import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Booking(models.Model):
    STATUS_CHOICES = (
        ('searching', 'Searching For Worker'),
        ('accepted', 'Worker Accepted'),
        ('on_the_way', 'Worker On The Way'),
        ('arrived', 'Worker Arrived'),
        ('verified', 'QR Verified'),
        ('in_progress', 'Work Started / Repair In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    worker = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
    service_category = models.ForeignKey('services.ServiceCategory', on_delete=models.PROTECT)
    problem_type = models.CharField(max_length=100)
    problem_description = models.TextField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    BOOKING_TYPE_CHOICES = (
        ('slot', 'Slot-Based Service'),
        ('instant', 'Instant Service (10-40 mins)'),
    )

    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPE_CHOICES, default='slot')
    preferred_date = models.DateField(null=True, blank=True)
    preferred_time = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='searching')
    qr_code_value = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    before_photo = models.ImageField(upload_to='bookings/before/', null=True, blank=True)
    after_photo = models.ImageField(upload_to='bookings/after/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking #{self.id} - {self.service_category.name} ({self.status})"

class RepairToken(models.Model):
    STATUS_CHOICES = (
        ('reached_workshop', 'Reached Workshop'),
        ('inspection', 'Inspection'),
        ('repair_started', 'Repair Started'),
        ('waiting_parts', 'Waiting For Parts'),
        ('repair_completed', 'Repair Completed'),
        ('returning', 'Returning'),
        ('delivered', 'Delivered'),
    )

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='repair_token')
    token_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='reached_workshop')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Token {self.token_number} ({self.status})"

class MajorRepairApproval(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='major_repairs')
    reason = models.TextField()
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Repair Approval #{self.id} for Booking #{self.booking.id} ({self.status})"
