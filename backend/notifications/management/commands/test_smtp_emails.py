import sys
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from decimal import Decimal
from unittest.mock import MagicMock

from bookings.models import Booking
from services.models import ServiceCategory
from billing.models import Bill, Payment
from notifications.email_service import EmailNotificationService

User = get_user_model()

class Command(BaseCommand):
    help = "Sends all 9 customer email notification templates to a target test email address."

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help="Target email address to receive notifications")

    def handle(self, *args, **options):
        target_email = options['email']
        self.stdout.write(self.style.WARNING(f"Starting email delivery tests to: {target_email}...\n"))

        # Create temporary mock/real database objects for context rendering
        # Category
        category, _ = ServiceCategory.objects.get_or_create(
            name="Electrical",
            defaults={"description": "Electrical repair services"}
        )

        # Customer User
        import random
        random_digits_cust = "".join([str(random.randint(0, 9)) for _ in range(8)])
        customer, created = User.objects.get_or_create(
            email=target_email,
            defaults={
                "full_name": "Test Customer",
                "phone": f"+9190{random_digits_cust}",
                "role": "customer"
            }
        )
        if not created:
            customer.full_name = "Test Customer"
            customer.save()

        # Worker User
        random_digits_work = "".join([str(random.randint(0, 9)) for _ in range(8)])
        worker, _ = User.objects.get_or_create(
            email="captain_test@workizo.com",
            defaults={
                "full_name": "Captain Steve Rogers",
                "phone": f"+9180{random_digits_work}",
                "role": "worker"
            }
        )

        # Booking
        booking = Booking(
            id=12345,
            customer=customer,
            worker=worker,
            service_category=category,
            problem_type="Short Circuit",
            problem_description="Living room lights flicker and short circuit",
            address="Apartment 4B, Avengers Tower",
            city="Mumbai",
            state="Maharashtra",
            pincode="400021",
            status="searching",
            created_at=now()
        )
        # Manually assign tracking_id since save() isn't called for in-memory object
        booking.tracking_id = "WRK-22345"

        # Bill
        bill = Bill(
            id=678,
            booking=booking,
            labour_charges=Decimal("500.00"),
            parts_charges=Decimal("250.00"),
            gst=Decimal("135.00"),
            grand_total=Decimal("885.00")
        )

        # Payment
        payment = Payment(
            id=910,
            booking=booking,
            amount=Decimal("885.00"),
            method="upi",
            status="success",
            transaction_id="TXN-STEVE-998877"
        )

        # Send all emails and check results
        results = []

        # 1. Welcome & Email Verification
        self.stdout.write("Sending [1/9] Welcome & Verification Email...")
        ok = EmailNotificationService.send_welcome_verification_email(customer)
        results.append(("Welcome & Verification", ok))

        # 2. Forgot Password
        self.stdout.write("Sending [2/9] Forgot Password Reset Email...")
        ok = EmailNotificationService.send_password_reset_email(customer)
        results.append(("Forgot Password", ok))

        # 3. Booking Confirmation
        self.stdout.write("Sending [3/9] Booking Confirmation Email...")
        ok = EmailNotificationService.send_booking_confirmation_email(booking)
        results.append(("Booking Confirmation", ok))

        # 4. Captain Assigned
        self.stdout.write("Sending [4/9] Captain Assigned Email...")
        booking.status = "accepted"
        ok = EmailNotificationService.send_captain_assigned_email(booking)
        results.append(("Captain Assigned", ok))

        # 5. Captain Arrived
        self.stdout.write("Sending [5/9] Captain Arrived Email...")
        booking.status = "arrived"
        ok = EmailNotificationService.send_captain_arrived_email(booking)
        results.append(("Captain Arrived", ok))

        # 6. Work Started
        self.stdout.write("Sending [6/9] Work Started Email...")
        booking.status = "repair_started"
        ok = EmailNotificationService.send_work_started_email(booking)
        results.append(("Work Started", ok))

        # 7. Work Completed
        self.stdout.write("Sending [7/9] Work Completed Email...")
        booking.status = "waiting_approval"
        ok = EmailNotificationService.send_work_completed_email(booking, bill)
        results.append(("Work Completed", ok))

        # 8. Payment Successful
        self.stdout.write("Sending [8/9] Payment Receipt Email...")
        booking.status = "completed"
        ok = EmailNotificationService.send_payment_receipt_email(booking, payment)
        results.append(("Payment Receipt", ok))

        # 9. Booking Cancelled
        self.stdout.write("Sending [9/9] Booking Cancelled Email...")
        booking.status = "cancelled"
        ok = EmailNotificationService.send_booking_cancelled_email(booking, reason="Captain request timed out")
        results.append(("Booking Cancelled", ok))

        # Output Results Summary
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.SUCCESS("EMAIL DELIVERY RESULTS SUMMARY"))
        self.stdout.write("=" * 50)
        failures = 0
        for name, success in results:
            status_text = self.style.SUCCESS("SUCCESS") if success else self.style.ERROR("FAILED (Check console logs)")
            if not success:
                failures += 1
            self.stdout.write(f"- {name:<25} : {status_text}")
        
        self.stdout.write("=" * 50)
        if failures == 0:
            self.stdout.write(self.style.SUCCESS("All test email renderings succeeded!"))
        else:
            self.stdout.write(self.style.ERROR(f"{failures} email renderings failed. Please check configured SMTP variables and logs."))
