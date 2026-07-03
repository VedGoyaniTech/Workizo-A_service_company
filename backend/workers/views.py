from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from workers.models import WorkerProfile
from workers.serializers import WorkerProfileSerializer
from accounts.permissions import IsWorker

class WorkerRegisterProfileView(APIView):
    permission_classes = (IsWorker,)
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        try:
            profile = request.user.worker_profile
        except WorkerProfile.DoesNotExist:
            profile = WorkerProfile.objects.create(user=request.user)
            
        # Perform updates
        serializer = WorkerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'profile': serializer.data,
                'message': 'Worker profile details and documents uploaded successfully.'
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
