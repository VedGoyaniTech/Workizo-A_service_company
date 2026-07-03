from rest_framework import serializers
from workers.models import WorkerProfile
from services.models import ServiceCategory
from services.serializers import ServiceCategorySerializer

class WorkerProfileSerializer(serializers.ModelSerializer):
    service_category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.all(),
        source='service_category',
        write_only=True,
        required=False,
        allow_null=True
    )
    service_category = ServiceCategorySerializer(read_only=True)
    
    class Meta:
        model = WorkerProfile
        fields = (
            'service_category',
            'service_category_id',
            'experience',
            'address',
            'city',
            'state',
            'pincode',
            'aadhaar_number',
            'pan_number',
            'bank_account',
            'ifsc_code',
            'profile_photo',
            'aadhaar_photo',
            'pan_photo',
            'is_verified',
            'approval_status',
            'online_status'
        )
        read_only_fields = ('is_verified', 'approval_status')
