from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import (
    RegisterView, CustomTokenObtainPairView, LogoutView,
    CurrentUserView, UpdateProfileView, ChangePasswordView
)
from accounts.admin_views import (
    AdminListCustomersView, AdminListWorkersView,
    AdminVerifyWorkerView, AdminToggleUserActiveView
)

urlpatterns = [
    # General auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', UpdateProfileView.as_view(), name='update_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Admin actions
    path('admin/customers/', AdminListCustomersView.as_view(), name='admin_customers'),
    path('admin/workers/', AdminListWorkersView.as_view(), name='admin_workers'),
    path('admin/workers/<int:pk>/verify/', AdminVerifyWorkerView.as_view(), name='admin_verify_worker'),
    path('admin/users/<int:pk>/toggle-active/', AdminToggleUserActiveView.as_view(), name='admin_toggle_user_active'),
]
