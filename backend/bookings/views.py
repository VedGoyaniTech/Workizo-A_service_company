import json
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Booking, RepairToken, MajorRepairApproval, BookingRejection
from .serializers import BookingSerializer, RepairTokenSerializer, MajorRepairApprovalSerializer
from notifications.models import Notification
from notifications.serializers import NotificationSerializer

User = get_user_model()

def send_booking_update(booking_id, booking_data):
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f"booking_{booking_id}",
            {
                "type": "booking_update",
                "data": {
                    "type": "booking_status",
                    "booking": booking_data
                }
            }
        )

def create_and_send_notification(user, title, message, notification_type='general'):
    noti = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type
    )
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            {
                "type": "send_notification",
                "data": {
                    "type": "notification",
                    "notification": NotificationSerializer(noti).data
                }
            }
        )
    return noti

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        booking = serializer.save(customer=self.request.user)
        
        # Default date/time if instant booking
        if booking.booking_type == 'instant':
            from django.utils import timezone
            if not booking.preferred_date:
                booking.preferred_date = timezone.now().date()
            if not booking.preferred_time:
                booking.preferred_time = "Instant (10-40 mins)"
            booking.save()
            
            # Find and notify online approved workers in the service category
            from workers.models import WorkerProfile
            workers = WorkerProfile.objects.filter(
                online_status=True,
                approval_status='approved',
                service_category=booking.service_category
            )
            
            channel_layer = get_channel_layer()
            for wp in workers:
                # Create DB notification for the worker
                noti = Notification.objects.create(
                    user=wp.user,
                    title="New Instant Booking Request",
                    message=f"New instant request for {booking.service_category.name}. Problem: {booking.problem_type}.",
                    notification_type="incoming_booking_request"
                )
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{wp.user.id}",
                        {
                            "type": "send_notification",
                            "data": {
                                "type": "notification",
                                "notification": NotificationSerializer(noti).data,
                                "booking": BookingSerializer(booking).data
                            }
                        }
                    )

        # Broadcast the new available booking request to all workers in this category
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"category_{booking.service_category.id}",
                {
                    "type": "send_notification",
                    "data": {
                        "type": "booking_available",
                        "booking": BookingSerializer(booking).data
                    }
                }
            )

        # Create notification for self
        create_and_send_notification(
            user=self.request.user,
            title="Booking Placed",
            message=f"Your request for {booking.service_category.name} is placed. Searching for nearest worker...",
            notification_type="booking_update"
        )

    @action(detail=False, methods=['get'], url_path='my-bookings')
    def my_bookings(self, request):
        user = request.user
        if user.role == 'worker':
            bookings = Booking.objects.filter(worker=user).order_by('-created_at')
        else:
            bookings = Booking.objects.filter(customer=user).order_by('-created_at')
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='available-requests')
    def available_requests(self, request):
        user = request.user
        if user.role != 'worker':
            return Response({"detail": "Only workers can access this list."}, status=status.HTTP_403_FORBIDDEN)
        
        # Filter matching worker category
        profile = getattr(user, 'worker_profile', None)
        if not profile or not profile.online_status or profile.approval_status != 'approved':
            return Response([])

        category = profile.service_category
        if not category:
            return Response([])

        # Exclude rejected bookings
        rejected_booking_ids = BookingRejection.objects.filter(worker=user).values_list('booking_id', flat=True)

        bookings = Booking.objects.filter(
            service_category=category,
            status='searching'
        ).exclude(id__in=rejected_booking_ids).order_by('-created_at')
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        if user.role != 'worker':
            return Response({"detail": "Only workers can accept jobs."}, status=status.HTTP_403_FORBIDDEN)
        
        if booking.status != 'searching':
            return Response({"detail": "This booking has already been assigned or cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.worker = user
        booking.status = 'accepted'
        booking.save()

        # Serialized data
        booking_data = self.get_serializer(booking).data
        send_booking_update(booking.id, booking_data)

        # Broadcast to all workers in this category that booking is taken (remove from their dashboard)
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"category_{booking.service_category.id}",
                {
                    "type": "send_notification",
                    "data": {
                        "type": "booking_taken",
                        "booking_id": booking.id
                    }
                }
            )

        # Notify Customer
        create_and_send_notification(
            user=booking.customer,
            title="Captain Assigned",
            message=f"Captain {user.full_name} has accepted your plumber/electrician service request.",
            notification_type="booking_update"
        )
        # Notify Worker
        create_and_send_notification(
            user=user,
            title="Job Accepted",
            message=f"You successfully accepted booking #{booking.id} for {booking.customer.full_name}.",
            notification_type="booking_update"
        )

        return Response(booking_data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        if user.role != 'worker':
            return Response({"detail": "Only workers can reject jobs."}, status=status.HTTP_403_FORBIDDEN)

        BookingRejection.objects.get_or_create(worker=user, booking=booking)
        return Response({"detail": "Booking request rejected/declined."})


    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        new_status = request.data.get('status')

        valid_statuses = [c[0] for c in Booking.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({"detail": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)

        # Basic role validations
        if user.role == 'worker' and booking.worker != user:
            return Response({"detail": "You are not assigned to this job."}, status=status.HTTP_403_FORBIDDEN)
        if user.role == 'customer' and booking.customer != user and new_status == 'cancelled':
            return Response({"detail": "You cannot modify this booking."}, status=status.HTTP_403_FORBIDDEN)

        booking.status = new_status
        
        # Handle uploaded images if any
        if 'before_photo' in request.FILES:
            booking.before_photo = request.FILES['before_photo']
        if 'after_photo' in request.FILES:
            booking.after_photo = request.FILES['after_photo']
        if 'spare_part_photo' in request.FILES:
            booking.spare_part_photo = request.FILES['spare_part_photo']
        if 'invoice_photo' in request.FILES:
            booking.invoice_photo = request.FILES['invoice_photo']
        if 'optional_video' in request.FILES:
            booking.optional_video = request.FILES['optional_video']

        booking.save()

        # Notify both parties
        status_messages = {
            'on_the_way': f"Captain {booking.worker.full_name} is on the way.",
            'arrived': f"Captain {booking.worker.full_name} has arrived at your location.",
            'inspection': "Captain is performing an initial inspection of the issue.",
            'repair_started': "Captain has started the repair work.",
            'repair_completed': "Captain completed the repair. Preparing service bill invoice.",
            'waiting_approval': "Service bill generated. Awaiting your approval.",
            'completed': "Service job completed. Invoice payment confirmed.",
            'cancelled': f"Booking #{booking.id} has been cancelled."
        }

        msg = status_messages.get(new_status)
        if msg:
            create_and_send_notification(booking.customer, "Booking Status Update", msg, "booking_update")
            if booking.worker:
                create_and_send_notification(booking.worker, "Job Status Update", f"Job status updated to {new_status.replace('_', ' ').title()}.", "booking_update")

        booking_data = self.get_serializer(booking).data
        send_booking_update(booking.id, booking_data)


        return Response(booking_data)

    @action(detail=True, methods=['post'], url_path='verify-qr')
    def verify_qr(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        
        if user.role != 'worker' or booking.worker != user:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        qr_value = request.data.get('qr_code_value')
        if str(booking.qr_code_value) == str(qr_value):
            booking.status = 'verified'
            booking.save()

            booking_data = self.get_serializer(booking).data
            send_booking_update(booking.id, booking_data)

            create_and_send_notification(
                user=booking.customer,
                title="QR Verified Successfully",
                message="Captain QR verification verified. Work is beginning.",
                notification_type="booking_update"
            )

            return Response({"verified": True, "booking": booking_data})
        else:
            return Response({"verified": False, "detail": "Invalid QR code value. Please ask customer to reload."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='request-major-repair')
    def request_major_repair(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        
        if user.role != 'worker' or booking.worker != user:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        reason = request.data.get('reason')
        estimated_cost = request.data.get('estimated_cost')

        if not reason or not estimated_cost:
            return Response({"detail": "Reason and estimated_cost required."}, status=status.HTTP_400_BAD_REQUEST)

        approval = MajorRepairApproval.objects.create(
            booking=booking,
            reason=reason,
            estimated_cost=estimated_cost,
            status='pending'
        )

        create_and_send_notification(
            user=booking.customer,
            title="Major Repair Approval Needed",
            message=f"Captain requested approval for {reason}. Estimate: ₹{estimated_cost}.",
            notification_type="booking_update"
        )

        booking_data = self.get_serializer(booking).data
        send_booking_update(booking.id, booking_data)

        return Response(MajorRepairApprovalSerializer(approval).data)

    @action(detail=True, methods=['post'], url_path='respond-major-repair')
    def respond_major_repair(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        
        if booking.customer != user:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        approval_id = request.data.get('approval_id')
        response_status = request.data.get('status') # approved / rejected

        if response_status not in ['approved', 'rejected']:
            return Response({"detail": "Invalid response status."}, status=status.HTTP_400_BAD_REQUEST)

        approval = get_object_or_404(MajorRepairApproval, id=approval_id, booking=booking)
        approval.status = response_status
        approval.save()

        # Notify Captain
        create_and_send_notification(
            user=booking.worker,
            title=f"Repair Estimate {response_status.title()}",
            message=f"Customer has {response_status} the major repair estimate of ₹{approval.estimated_cost}.",
            notification_type="booking_update"
        )

        booking_data = self.get_serializer(booking).data
        send_booking_update(booking.id, booking_data)

        return Response(MajorRepairApprovalSerializer(approval).data)

    @action(detail=True, methods=['post'], url_path='update-repair-token')
    def update_repair_token(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        
        if user.role != 'worker' or booking.worker != user:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        token_status = request.data.get('status')
        valid_token_statuses = [c[0] for c in RepairToken.STATUS_CHOICES]

        if token_status not in valid_token_statuses:
            return Response({"detail": "Invalid token status."}, status=status.HTTP_400_BAD_REQUEST)

        token_number = request.data.get('token_number')
        if not token_number:
            # Generate a new unique token
            token_number = f"WRK-{1000 + booking.id}"

        token, created = RepairToken.objects.get_or_create(
            booking=booking,
            defaults={'token_number': token_number, 'status': token_status}
        )

        if not created:
            token.status = token_status
            token.save()

        create_and_send_notification(
            user=booking.customer,
            title="Workshop Repair Update",
            message=f"Workshop status updated to: {token.get_status_display()}.",
            notification_type="booking_update"
        )

        booking_data = self.get_serializer(booking).data
        send_booking_update(booking.id, booking_data)

        return Response(RepairTokenSerializer(token).data)

    @action(detail=True, methods=['post'], url_path='simulate-assignment')
    def simulate_assignment(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'searching':
            return Response({"detail": "Already assigned or completed."}, status=status.HTTP_400_BAD_REQUEST)
        
        from workers.models import WorkerProfile
        # Find any approved worker for this category
        wp = WorkerProfile.objects.filter(approval_status='approved', service_category=booking.service_category).first()
        if not wp:
            # Fallback to any approved worker
            wp = WorkerProfile.objects.filter(approval_status='approved').first()
        if not wp:
            # Fallback to any worker
            wp = WorkerProfile.objects.first()

        if not wp:
            return Response({"detail": "No workers registered. Please register a worker user first."}, status=status.HTTP_400_BAD_REQUEST)

        worker = wp.user
        booking.worker = worker
        booking.status = 'accepted'
        booking.save()

        booking_data = self.get_serializer(booking).data
        send_booking_update(booking.id, booking_data)

        create_and_send_notification(
            user=booking.customer,
            title="Captain Assigned",
            message=f"Captain {worker.full_name} has accepted your request. Expected arrival in 15 mins.",
            notification_type="booking_update"
        )

        return Response(booking_data)

    @action(detail=False, methods=['post'], url_path='generate-simulation')
    def generate_simulation(self, request):
        customer = User.objects.filter(role='customer').first()
        if not customer:
            customer, _ = User.objects.get_or_create(
                email='dummy_customer@workizo.com',
                defaults={
                    'full_name': 'Amit Patel',
                    'phone': '9876543210',
                    'role': 'customer',
                    'is_active': True
                }
            )

        import random
        from services.models import ServiceCategory
        
        wp = getattr(request.user, 'worker_profile', None)
        category = wp.service_category if wp else None
        if not category:
            category = ServiceCategory.objects.first()

        problems = {
            "Electrician": ["Short circuit in living room", "Ceiling fan installation", "Socket spark repair"],
            "Plumber": ["Kitchen washbasin leak", "Water tank blockage", "Bathroom tap replacement"],
            "Carpenter": ["Main door latch issue", "Wooden chair joint repair", "Kitchen cabinet fixing"],
            "AC Technician": ["AC not cooling", "Gas leakage check", "Routine filter service"],
            "Mechanic": ["Car starting trouble", "Brake pad replacement", "Engine noise diagnostics"],
            "Home Cleaning": ["Deep kitchen cleaning", "Sofa vacuuming", "Full apartment sanitize"]
        }

        prob_type = category.name if category else "General Fix"
        prob_list = problems.get(category.name, ["General repair service needed"]) if category else ["General repair service needed"]
        prob_desc = random.choice(prob_list)

        booking = Booking.objects.create(
            customer=customer,
            worker=request.user,
            service_category=category,
            problem_type=prob_type,
            problem_description=prob_desc,
            address="A-404, Vastrapur Lake Apartments",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380015",
            preferred_date="2026-07-04",
            preferred_time="03:00 PM - 05:00 PM",
            status='accepted'
        )

        create_and_send_notification(
            user=customer,
            title="Booking Placed & Accepted",
            message=f"Captain {request.user.full_name} accepted your request.",
            notification_type="booking_update"
        )

        return Response(self.get_serializer(booking).data, status=status.HTTP_201_CREATED)
