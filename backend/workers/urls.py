from django.urls import path
from workers.views import WorkerRegisterProfileView, WalletDetailView, WalletWithdrawView

urlpatterns = [
    path('register-profile/', WorkerRegisterProfileView.as_view(), name='register_profile'),
    path('wallet/', WalletDetailView.as_view(), name='wallet_details'),
    path('wallet/withdraw/', WalletWithdrawView.as_view(), name='wallet_withdraw'),
]
