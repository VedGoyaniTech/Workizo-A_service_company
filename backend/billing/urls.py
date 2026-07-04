from django.urls import path
from .views import GenerateBillView, GetBillView, ApproveBillView, ProcessPaymentView, DownloadInvoiceView

urlpatterns = [
    path('<int:booking_id>/generate-bill/', GenerateBillView.as_view(), name='generate-bill'),
    path('<int:booking_id>/get-bill/', GetBillView.as_view(), name='get-bill'),
    path('<int:booking_id>/approve-bill/', ApproveBillView.as_view(), name='approve-bill'),
    path('<int:booking_id>/process-payment/', ProcessPaymentView.as_view(), name='process-payment'),
    path('<int:booking_id>/download-invoice/', DownloadInvoiceView.as_view(), name='download-invoice'),
]
