from rest_framework import serializers
from .models import Booking, RepairToken, MajorRepairApproval
from accounts.serializers import UserSerializer
from services.serializers import ServiceCategorySerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class RepairTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairToken
        fields = ('id', 'booking', 'token_number', 'status', 'updated_at')

class MajorRepairApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = MajorRepairApproval
        fields = ('id', 'booking', 'reason', 'estimated_cost', 'status', 'created_at')

class BookingSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    worker = UserSerializer(read_only=True)
    service_category_detail = ServiceCategorySerializer(source='service_category', read_only=True)
    repair_token = RepairTokenSerializer(read_only=True)
    major_repairs = MajorRepairApprovalSerializer(many=True, read_only=True)
    
    class Meta:
        model = Booking
        fields = (
            'id', 'customer', 'worker', 'service_category', 'service_category_detail',
            'problem_type', 'problem_description', 'address', 'city', 'state', 'pincode',
            'preferred_date', 'preferred_time', 'booking_type', 'status', 'qr_code_value',
            'before_photo', 'after_photo', 'repair_token', 'major_repairs', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'customer', 'worker', 'qr_code_value', 'created_at', 'updated_at')
