from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from accounts.google_auth import verify_google_id_token

from accounts.serializers import (
    RegisterSerializer, UserSerializer, ChangePasswordSerializer,
    CustomTokenObtainPairSerializer
)
from customers.models import CustomerProfile
from customers.serializers import CustomerProfileSerializer
from workers.models import WorkerProfile
from workers.serializers import WorkerProfileSerializer

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create corresponding empty profile
            if user.role == 'customer':
                CustomerProfile.objects.create(user=user)
            elif user.role == 'worker':
                WorkerProfile.objects.create(user=user)
                
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
                
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": "Invalid token or already logged out"}, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        user = request.user
        user_data = UserSerializer(user).data
        
        # Attach profile details
        profile_data = None
        if user.role == 'customer':
            try:
                profile = user.customer_profile
                profile_data = CustomerProfileSerializer(profile).data
            except CustomerProfile.DoesNotExist:
                profile_data = None
        elif user.role == 'worker':
            try:
                profile = user.worker_profile
                profile_data = WorkerProfileSerializer(profile).data
            except WorkerProfile.DoesNotExist:
                profile_data = None
                
        return Response({
            'user': user_data,
            'profile': profile_data
        })

class UpdateProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def put(self, request):
        user = request.user
        user_serializer = UserSerializer(user, data=request.data, partial=True)
        
        if not user_serializer.is_valid():
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        user_serializer.save()
        
        # If user has profile details to update
        profile_data = None
        if user.role == 'customer':
            try:
                profile = user.customer_profile
                profile_serializer = CustomerProfileSerializer(profile, data=request.data, partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save()
                    profile_data = profile_serializer.data
                else:
                    return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except CustomerProfile.DoesNotExist:
                pass
        elif user.role == 'worker':
            try:
                profile = user.worker_profile
                profile_serializer = WorkerProfileSerializer(profile, data=request.data, partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save()
                    profile_data = profile_serializer.data
                else:
                    return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except WorkerProfile.DoesNotExist:
                pass
                
        return Response({
            'user': user_serializer.data,
            'profile': profile_data,
            'message': 'Profile updated successfully'
        })

class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
                
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('credential')
        role = request.data.get('role', 'customer')

        if not token:
            return Response({"detail": "Google credential token is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Verify Google Token
        id_info = verify_google_id_token(token)
        if not id_info:
            return Response({"detail": "Invalid or expired Google credential token"}, status=status.HTTP_400_BAD_REQUEST)

        google_id = id_info.get('sub')
        email = id_info.get('email')
        full_name = id_info.get('name', '')
        profile_picture = id_info.get('picture', '')

        # Try to find user by google_id or email
        user = None
        try:
            user = User.objects.get(google_id=google_id)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=email)
                # Link account
                if not user.google_id:
                    user.google_id = google_id
                if not user.profile_picture:
                    user.profile_picture = profile_picture
                user.save()
            except User.DoesNotExist:
                user = None

        is_new_user = False
        if not user:
            is_new_user = True
            if role not in ['customer', 'worker']:
                return Response({"detail": "Invalid role specified"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.create_user(
                    email=email,
                    full_name=full_name,
                    role=role,
                    auth_provider='GOOGLE',
                    google_id=google_id,
                    profile_picture=profile_picture
                )
                
                # Create corresponding profile
                if role == 'customer':
                    CustomerProfile.objects.create(user=user)
                elif role == 'worker':
                    WorkerProfile.objects.create(user=user)

            except Exception as e:
                return Response({"detail": f"Failed to create user account: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['email'] = user.email
        refresh['full_name'] = user.full_name

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful',
            'is_new': is_new_user
        }, status=status.HTTP_200_OK if not is_new_user else status.HTTP_201_CREATED)
