import io
from decimal import Decimal
from django.shortcuts import render, get_object_or_404
from django.http import FileResponse, Http404
from django.core.files.base import ContentFile
from rest_framework import views, permissions, status
from rest_framework.response import Response

from .models import Bill, BillItem, Payment
from .serializers import BillSerializer, BillItemSerializer, PaymentSerializer
from bookings.models import Booking
from bookings.serializers import BookingSerializer
from bookings.views import send_booking_update, create_and_send_notification
from workers.models import Wallet, WalletTransaction

# ReportLab Invoice Imports
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def compile_bill_pdf(bill):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter, 
        rightMargin=36, 
        leftMargin=36, 
        topMargin=36, 
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F0F14'),
        spaceAfter=12
    )
    normal_style = styles['Normal']
    
    story = []
    story.append(Paragraph("WORKIZO OFFICIAL INVOICE", title_style))
    story.append(Spacer(1, 10))
    
    # Metadata
    story.append(Paragraph(f"<b>Invoice No:</b> WRK-INV-{bill.id}", normal_style))
    story.append(Paragraph(f"<b>Booking Ref:</b> #{bill.booking.id}", normal_style))
    story.append(Paragraph(f"<b>Customer:</b> {bill.booking.customer.full_name} ({bill.booking.customer.phone})", normal_style))
    story.append(Paragraph(f"<b>Captain:</b> {bill.booking.worker.full_name}", normal_style))
    story.append(Paragraph(f"<b>Service Category:</b> {bill.booking.service_category.name}", normal_style))
    story.append(Paragraph(f"<b>Date:</b> {bill.created_at.strftime('%Y-%m-%d %H:%M')}", normal_style))
    story.append(Spacer(1, 20))
    
    # Table columns: Description, Qty, Rate, Total
    table_data = [
        [
            Paragraph("<b>Item Description</b>", normal_style), 
            Paragraph("<b>Quantity</b>", normal_style), 
            Paragraph("<b>Price</b>", normal_style), 
            Paragraph("<b>Amount</b>", normal_style)
        ]
    ]
    
    # Labour charges
    table_data.append([
        Paragraph("Labour / Service Fee", normal_style), 
        "1", 
        f"INR {bill.labour_charges}", 
        f"INR {bill.labour_charges}"
    ])
    
    # Spare parts items
    for item in bill.items.all():
        item_total = item.price * item.quantity
        table_data.append([
            Paragraph(item.part_name, normal_style), 
            str(item.quantity), 
            f"INR {item.price}", 
            f"INR {item_total}"
        ])
        
    # Divider blank line
    table_data.append(["", "", "", ""])
    
    # Totals breakdown
    parts_sub = bill.parts_charges
    subtotal = bill.labour_charges + parts_sub
    table_data.append(["", "", Paragraph("<b>Subtotal:</b>", normal_style), f"INR {subtotal}"])
    table_data.append(["", "", Paragraph("<b>GST (18%):</b>", normal_style), f"INR {bill.gst}"])
    table_data.append(["", "", Paragraph("<b>Discount:</b>", normal_style), f"-INR {bill.discount}"])
    table_data.append(["", "", Paragraph("<b>Grand Total:</b>", normal_style), f"INR {bill.grand_total}"])
    
    t = Table(table_data, colWidths=[240, 60, 100, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FAFAFB')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-2), 0.5, colors.HexColor('#E5E7EB')),
        ('LINEBELOW', (2,-4), (-1,-1), 1, colors.HexColor('#0F0F14')),
    ]))
    
    story.append(t)
    story.append(Spacer(1, 30))
    story.append(Paragraph("Thank you for choosing WORKIZO. For queries, contact support@workizo.com", normal_style))
    
    doc.build(story)
    
    buffer.seek(0)
    pdf_file = ContentFile(buffer.read())
    bill.invoice_pdf.save(f"invoice_{bill.booking.id}.pdf", pdf_file)
    bill.save()

class GenerateBillView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        if request.user.role != 'worker' or booking.worker != request.user:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if bill already exists
        if hasattr(booking, 'bill'):
            return Response({"detail": "Bill already generated for this booking."}, status=status.HTTP_400_BAD_REQUEST)

        import json
        labour_charges = Decimal(str(request.data.get('labour_charges', 0) or 0))
        discount = Decimal(str(request.data.get('discount', 0) or 0))
        
        items_data = request.data.get('items', [])
        if isinstance(items_data, str):
            try:
                items_data = json.loads(items_data)
            except Exception:
                items_data = []

        supplier_invoice = request.FILES.get('supplier_invoice')

        # Create Bill (charges calculated below)
        bill = Bill.objects.create(
            booking=booking,
            labour_charges=labour_charges,
            discount=discount,
            supplier_invoice=supplier_invoice
        )


        parts_charges = Decimal('0.00')
        for item in items_data:
            name = item.get('part_name')
            qty = int(item.get('quantity', 1))
            price = Decimal(str(item.get('price', 0)))
            
            if name:
                BillItem.objects.create(
                    bill=bill,
                    part_name=name,
                    quantity=qty,
                    price=price
                )
                parts_charges += (price * qty)

        # Set final aggregates
        subtotal = labour_charges + parts_charges
        gst = (subtotal * Decimal('0.18')).quantize(Decimal('0.01'))
        grand_total = (subtotal + gst - discount).quantize(Decimal('0.01'))
        if grand_total < 0:
            grand_total = Decimal('0.00')

        bill.parts_charges = parts_charges
        bill.gst = gst
        bill.grand_total = grand_total
        bill.save()

        # Compile PDF invoice automatically
        compile_bill_pdf(bill)

        # Update booking status & broadcast
        booking.status = 'completed' if bill.grand_total == 0 else booking.status # if free, complete it immediately, else wait for payment
        booking.save()

        booking_data = BookingSerializer(booking).data
        send_booking_update(booking.id, booking_data)

        # Alert customer
        create_and_send_notification(
            user=booking.customer,
            title="Invoice Generated",
            message=f"Captain has generated an invoice for ₹{grand_total}. Please review and pay.",
            notification_type="bill"
        )

        return Response(BillSerializer(bill).data, status=status.HTTP_201_CREATED)

class GetBillView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        bill = get_object_or_404(Bill, booking=booking)
        
        if request.user != booking.customer and request.user != booking.worker:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
            
        return Response(BillSerializer(bill).data)

class ApproveBillView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        if booking.customer != request.user:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        bill = get_object_or_404(Bill, booking=booking)
        bill.is_approved = True
        bill.save()

        # Broadcast update
        send_booking_update(booking.id, BookingSerializer(booking).data)

        create_and_send_notification(
            user=booking.worker,
            title="Invoice Approved",
            message=f"Customer approved invoice for booking #{booking.id}. Awaiting payment.",
            notification_type="bill"
        )

        return Response(BillSerializer(bill).data)

class ProcessPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        if booking.customer != request.user:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        bill = get_object_or_404(Bill, booking=booking)
        method = request.data.get('method', 'cash')
        
        # Create Payment
        payment, created = Payment.objects.get_or_create(
            booking=booking,
            defaults={
                'amount': bill.grand_total,
                'method': method,
                'status': 'success',
                'transaction_id': f"TXN-{booking.id}-{int(bill.grand_total)}"
            }
        )

        # Update Booking Status
        booking.status = 'completed'
        booking.save()

        # Credit Worker Wallet (90% commission payout)
        worker_payout = (bill.grand_total * Decimal('0.90')).quantize(Decimal('0.01'))
        wallet, _ = Wallet.objects.get_or_create(worker=booking.worker)
        wallet.current_balance += worker_payout
        wallet.save()

        # Wallet Transaction log
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=worker_payout,
            transaction_type='credit',
            description=f"Earnings for Booking #{booking.id} ({booking.service_category.name})"
        )

        # Broadcast update
        booking_data = BookingSerializer(booking).data
        send_booking_update(booking.id, booking_data)

        # Dispatch alerts
        create_and_send_notification(
            user=booking.customer,
            title="Payment Received",
            message=f"Payment of ₹{bill.grand_total} confirmed via {method.upper()}.",
            notification_type="payment"
        )
        create_and_send_notification(
            user=booking.worker,
            title="Earnings Deposited",
            message=f"₹{worker_payout} deposited to wallet for booking #{booking.id}.",
            notification_type="payment"
        )

        return Response(PaymentSerializer(payment).data)

class DownloadInvoiceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        bill = get_object_or_404(Bill, booking=booking)
        
        if request.user != booking.customer and request.user != booking.worker:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        if not bill.invoice_pdf:
            raise Http404("Invoice PDF file not found.")

        return FileResponse(bill.invoice_pdf.open(), content_type='application/pdf')
