from django.urls import re_path
from bookings.consumers import BookingConsumer
from notifications.consumers import NotificationConsumer

websocket_urlpatterns = [
    re_path(r'^ws/notifications/$', NotificationConsumer.as_asgi()),
    re_path(r'^ws/bookings/(?P<booking_id>\d+)/$', BookingConsumer.as_asgi()),
]
