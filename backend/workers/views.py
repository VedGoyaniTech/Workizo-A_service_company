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

from workers.models import Wallet, WalletTransaction
from workers.serializers import WalletSerializer

class WalletDetailView(APIView):
    permission_classes = (IsWorker,)

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(worker=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)

class WalletWithdrawView(APIView):
    permission_classes = (IsWorker,)

    def post(self, request):
        wallet, _ = Wallet.objects.get_or_create(worker=request.user)
        amount = request.data.get('amount')
        if not amount:
            return Response({"detail": "Amount is required."}, status=status.HTTP_400_BAD_REQUEST)

        from decimal import Decimal
        try:
            val = Decimal(str(amount))
        except ValueError:
            return Response({"detail": "Invalid amount format."}, status=status.HTTP_400_BAD_REQUEST)

        if val <= 0:
            return Response({"detail": "Amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)

        if wallet.current_balance < val:
            return Response({"detail": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)

        wallet.current_balance -= val
        wallet.save()

        # Create Debit Transaction
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=val,
            transaction_type='debit',
            description="Withdrawal payout transfer completed (Simulated)"
        )

        return Response(WalletSerializer(wallet).data)
