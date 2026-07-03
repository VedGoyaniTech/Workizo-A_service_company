from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from accounts.serializers import UserSerializer
from accounts.permissions import IsAdminUser
from customers.models import CustomerProfile
from customers.serializers import CustomerProfileSerializer
from workers.models import WorkerProfile
from workers.serializers import WorkerProfileSerializer

User = get_user_model()

class AdminListCustomersView(APIView):
    permission_classes = (IsAdminUser,)
    
    def get(self, request):
        customers = User.objects.filter(role='customer').order_by('-created_at')
        data = []
        for customer in customers:
            user_data = UserSerializer(customer).data
            try:
                profile = customer.customer_profile
                profile_data = CustomerProfileSerializer(profile).data
            except CustomerProfile.DoesNotExist:
                profile_data = None
            data.append({
                'user': user_data,
                'profile': profile_data
            })
        return Response(data, status=status.HTTP_200_OK)

class AdminListWorkersView(APIView):
    permission_classes = (IsAdminUser,)
    
    def get(self, request):
        workers = User.objects.filter(role='worker').order_by('-created_at')
        data = []
        for worker in workers:
            user_data = UserSerializer(worker).data
            try:
                profile = worker.worker_profile
                profile_data = WorkerProfileSerializer(profile).data
            except WorkerProfile.DoesNotExist:
                profile_data = None
            data.append({
                'user': user_data,
                'profile': profile_data
            })
        return Response(data, status=status.HTTP_200_OK)

class AdminVerifyWorkerView(APIView):
    permission_classes = (IsAdminUser,)
    
    def post(self, request, pk):
        try:
            profile = WorkerProfile.objects.get(user_id=pk)
        except WorkerProfile.DoesNotExist:
            return Response({"detail": "Worker profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        approval_status = request.data.get('approval_status')
        if approval_status not in ['approved', 'rejected', 'pending']:
            return Response({"detail": "Invalid approval status"}, status=status.HTTP_400_BAD_REQUEST)
            
        profile.approval_status = approval_status
        if approval_status == 'approved':
            profile.is_verified = True
        else:
            profile.is_verified = False
            
        profile.save()
        return Response({
            'profile': WorkerProfileSerializer(profile).data,
            'message': f"Worker status updated to {approval_status} successfully."
        }, status=status.HTTP_200_OK)

class AdminToggleUserActiveView(APIView):
    permission_classes = (IsAdminUser,)
    
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Prevent self deactivation
        if request.user.id == user.id:
            return Response({"detail": "You cannot deactivate your own admin account."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.is_active = not user.is_active
        user.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': f"User active status set to {user.is_active} successfully."
        }, status=status.HTTP_200_OK)
