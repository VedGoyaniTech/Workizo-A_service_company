from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

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
