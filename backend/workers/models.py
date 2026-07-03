from django.db import models
from django.conf import settings
from services.models import ServiceCategory

class WorkerProfile(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='worker_profile')
    service_category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, related_name='workers')
    experience = models.IntegerField(default=0)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    
    aadhaar_number = models.CharField(max_length=12, blank=True, null=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    bank_account = models.CharField(max_length=20, blank=True, null=True)
    ifsc_code = models.CharField(max_length=11, blank=True, null=True)
    
    profile_photo = models.ImageField(upload_to='worker_photos/profile/', blank=True, null=True)
    aadhaar_photo = models.ImageField(upload_to='worker_photos/aadhaar/', blank=True, null=True)
    pan_photo = models.ImageField(upload_to='worker_photos/pan/', blank=True, null=True)
    
    is_verified = models.BooleanField(default=False)
    approval_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    online_status = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Worker Profile for {self.user.email}"
