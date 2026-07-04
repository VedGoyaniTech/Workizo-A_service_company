from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Rating(models.Model):
    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='rating')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_ratings')
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_ratings')
    rating = models.IntegerField()
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating: {self.rating} stars for Worker {self.worker.email} by {self.customer.email}"
