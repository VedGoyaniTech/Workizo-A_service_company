from django.urls import path
from services.views import ListServiceCategoriesView

urlpatterns = [
    path('categories/', ListServiceCategoriesView.as_view(), name='list_categories'),
]
