from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('my-bookings/', BookingViewSet.as_view({'get': 'my_bookings'}), name='my-bookings-list'),
    path('', include(router.urls)),
]
