from django.urls import path
from workers.views import WorkerRegisterProfileView

urlpatterns = [
    path('register-profile/', WorkerRegisterProfileView.as_view(), name='register_profile'),
]
