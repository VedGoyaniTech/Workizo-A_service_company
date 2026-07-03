from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from services.models import ServiceCategory
from services.serializers import ServiceCategorySerializer

class ListServiceCategoriesView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def get(self, request):
        categories = ServiceCategory.objects.all().order_by('name')
        serializer = ServiceCategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
