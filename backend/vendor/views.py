from django.shortcuts import render, redirect
from django.conf import settings
from django.template.loader import render_to_string
from django.db import models, transaction
from django.db.models.functions import ExtractMonth


from store.models import Product, Tax, Category, Cart, CartOrder, CartOrderItem, Notification, Gallery, ProductFaq, Review,  Specification, Coupon, Color, Size, Wishlist
from store.serializers import CouponSummarySerializer, EarningSerializer, NotificationSerializer, NotificationSummarySerializer, ProductSerializer, CategorySerializer, CartSerializer, CartOrderSerializer, CartOrderItemSerializer, CouponSerializer, ReviewSerializer, SummarySerializer, VendorSerializer, WishlistSerializer, SpecificationSerializer, SizeSerializer, ColorSerializer, GallerySerializer
from userauths.serializer import ProfileSerializer
from userauths.models import Profile, User
from vendor.models import Vendor

from rest_framework.decorators import api_view
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from decimal import Decimal
import requests
from datetime import datetime, timedelta


class DashboardStatsAPIView(generics.ListAPIView):
    serializer_class = SummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        product_count = Product.objects.filter(vendor=vendor).count()
        order_count = CartOrder.objects.filter(vendor=vendor, payment_status="paid").count()
        revenue = CartOrderItem.objects.filter(vendor=vendor, order__payment_status="paid").aggregate(total_revenue=models.Sum(models.F('sub_total') + models.F('shipping_amount')))['total_revenue'] or 0

        return [{
            'products': product_count,
            'orders': order_count,
            'revenue': revenue
        }]

    def list(self, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


@api_view(('GET',))
def MonthlyOrderChartAPIView(request, vendor_id):
    vendor = Vendor.objects.get(id=vendor_id)
    orders = CartOrder.objects.filter(vendor = vendor, payment_status = 'paid')
    orders_by_month = orders.annotate(month=ExtractMonth('date')).values('month').annotate(orders=models.Count('id')).order_by('month')
    return Response(orders_by_month)


@api_view(('GET',))
def MonthlyProductChartAPIView(request, vendor_id):
    vendor = Vendor.objects.get(id=vendor_id)
    products = Product.objects.filter(vendor = vendor)
    products_by_month = products.annotate(month=ExtractMonth('date')).values('month').annotate(products=models.Count('id')).order_by('month')
    return Response(products_by_month)


class ProductsAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        products = Product.objects.filter(vendor=vendor).order_by('-id')
        return products


class OrdersAPIView(generics.ListAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        orders = CartOrder.objects.filter(vendor=vendor).order_by('-id')
        return orders


class OrderDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        order_oid = self.kwargs['order_oid']
        vendor = Vendor.objects.get(id=vendor_id)
        order = CartOrder.objects.get(vendor=vendor, oid=order_oid)
        return order
    

class RevenueAPIView(generics.ListAPIView):
    serializer_class = CartOrderItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        revenue = CartOrderItem.objects.filter(vendor=vendor, order__payment_status="paid").aggregate(total_revenue=models.Sum(models.F('sub_total')))['total_revenue'] or 0
        return revenue


class FilterOrdersAPIView(generics.ListAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        filter = self.request.GET.get('filter')
        
        if filter == "paid":
            orders = CartOrder.objects.filter(vendor=vendor, payment_status = "paid").order_by("-id")
        elif filter =="pending":
            orders = CartOrder.objects.filter(vendor=vendor, payment_status = "pending").order_by("-id")
        elif filter =="processing":
            orders = CartOrder.objects.filter(vendor=vendor, payment_status = "processing").order_by("-id")
        elif filter =="cancelled":
            orders = CartOrder.objects.filter(vendor=vendor, payment_status = "cancelled").order_by("-id")
        elif filter =="lastest":
            orders = CartOrder.objects.filter(vendor=vendor, payment_status = "paid").order_by("-id")
        elif filter =="oldest":
            orders = CartOrder.objects.filter(vendor=vendor, payment_status = "paid").order_by("id")
        elif filter =="Pending":
            orders = CartOrder.objects.filter(vendor=vendor, order_status ="Pending", payment_status = "paid").order_by("-id")
        elif filter =="Fulfilled":
            orders = CartOrder.objects.filter(vendor=vendor, order_status ="Fulfilled", payment_status = "paid").order_by("-id")
        elif filter =="Cancelled":
            orders = CartOrder.objects.filter(vendor=vendor, order_status ="Cancelled", payment_status = "paid").order_by("-id")
        else:
            orders = CartOrder.objects.filter(vendor=vendor, payment_status = "paid").order_by("-id")
        return orders
        

class FilterProductsAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        filter = self.request.GET.get('filter')

        if filter == "published":
            products = Product.objects.filter(vendor=vendor, status="published")
        elif filter == "draft":
            products = Product.objects.filter(vendor=vendor, status="draft")
        elif filter == "disabled":
            products = Product.objects.filter(vendor=vendor, status="disabled")
        elif filter == "in_review":
            products = Product.objects.filter(vendor=vendor, status="in_review")
        elif filter == "latest":
            products = Product.objects.filter(vendor=vendor).order_by('-id')
        elif filter == "oldest":
            products = Product.objects.filter(vendor=vendor).order_by('id')
        else:
            products = Product.objects.filter(vendor=vendor)
        return products
    

class EarningAPIView(generics.ListAPIView):
    serializer_class = EarningSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        one_month_ago = datetime.today() - timedelta(days=28)
        monthly_revenue = CartOrderItem.objects.filter(vendor=vendor, order__payment_status="paid", date__gte=one_month_ago).aggregate(total_revenue=models.Sum(models.F('sub_total')))['total_revenue'] or 0
        total_revenue = CartOrderItem.objects.filter(vendor=vendor, order__payment_status="paid").aggregate(total_revenue=models.Sum(models.F('sub_total')))['total_revenue'] or 0

        return [{
            'monthly_revenue': monthly_revenue,
            'total_revenue': total_revenue,
        }]

    def list(self, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    

@api_view(('GET',))
def MonthlyEarningTracker(request, vendor_id):
    vendor = Vendor.objects.get(id=vendor_id)
    monthly_earning_tracker = (
        CartOrderItem.objects
        .filter(vendor=vendor, order__payment_status="paid")
        .annotate(month=ExtractMonth("date"))
        .values("month")
        .annotate(sales_count=models.Sum("qty"), total_earning=models.Sum(models.F('sub_total')))
        .order_by("-month")
    )
    return Response(monthly_earning_tracker)


class ReviewsListAPIView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        reviews = Review.objects.filter(product__vendor=vendor)
        return reviews
    

class ReviewsDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        review_id = self.kwargs['review_id']

        vendor = Vendor.objects.get(id=vendor_id)
        review = Review.objects.get(product__vendor=vendor, id=review_id)
        return review


class CouponListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        coupon = Coupon.objects.filter(vendor=vendor)
        return coupon
    
    def create(self, request, *args, **kwargs):
        payload = request.data

        vendor_id = payload['vendor_id']
        code = payload['code']
        discount = payload['discount']
        active = payload['active']

        vendor = Vendor.objects.get(id=vendor_id)
        coupon = Coupon.objects.create(
            vendor=vendor,
            code=code,
            discount=discount,
            active=(active.lower() == "true")
        )

        return Response({"message": "Coupon Created Successfully."}, status=status.HTTP_201_CREATED)
    

class CouponDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouponSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        coupon_id = self.kwargs['coupon_id']
        vendor = Vendor.objects.get(id=vendor_id)
        coupon = Coupon.objects.get(vendor=vendor, id=coupon_id)
        return coupon
    

class CouponStatsAPIView(generics.ListAPIView):
    serializer_class = CouponSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        total_coupons = Coupon.objects.filter(vendor=vendor).count()
        active_coupons = Coupon.objects.filter(vendor=vendor, active=True).count()

        return [{
            'total_coupons': total_coupons,
            'active_coupons': active_coupons,
        }]

    def list(self, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class NotificationAPIView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)
        notifications = Notification.objects.filter(vendor=vendor, seen=False).order_by('-id')
        return notifications
    

class NotificationSummaryAPIView(generics.ListAPIView):
    serializer_class = NotificationSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        vendor = Vendor.objects.get(id=vendor_id)

        un_read_noti = Notification.objects.filter(vendor=vendor, seen=False).count()
        read_noti = Notification.objects.filter(vendor=vendor, seen=True).count()
        all_noti = Notification.objects.filter(vendor=vendor).count()

        return [{
            'un_read_noti': un_read_noti,
            'read_noti': read_noti,
            'all_noti': all_noti,
        }]

    def list(self, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class NotificationVendorMarkAsSeen(generics.RetrieveAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        noti_id = self.kwargs['noti_id']
        vendor = Vendor.objects.get(id=vendor_id)
        noti = Notification.objects.get(vendor=vendor, id=noti_id)
        noti.seen = True
        noti.save()
        return noti


class VendorProfileUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]


class ShopUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [AllowAny]    


class ShopAPIView(generics.RetrieveAPIView):
    serializer_class = VendorSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        vendor_slug = self.kwargs['vendor_slug']
        vendor = Vendor.objects.get(slug=vendor_slug)
        return vendor
 

class ShopProductsAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendor_slug = self.kwargs['vendor_slug']
        vendor = Vendor.objects.get(slug=vendor_slug)
        products = Product.objects.filter(vendor=vendor)
        return products


class ProductCreateAPIView(generics.CreateAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()

    @transaction.atomic
    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)

        serializer.save()

        product_instance = serializer.instance

        specifications_data = []
        sizes_data = []
        colors_data = []
        gallery_data = []
        
        for key, value in self.request.data.items():
            # specification[0][title]
            if key.startswith('specifications') and '[title]' in key:
                index = key.split('[')[1].split(']')[0]
                title = value
                content_key = f'specifications[{index}][content]'
                content = self.request.data.get(content_key)
                specifications_data.append({'title': title, 'content': content})

            elif key.startswith('sizes') and '[name]' in key:
                index = key.split('[')[1].split(']')[0]
                name = value
                price_key = f'sizes[{index}][price]'
                price = self.request.data.get(price_key)
                sizes_data.append({'name': name, 'price': price})

            elif key.startswith('colors') and '[name]' in key:
                index = key.split('[')[1].split(']')[0]
                name = value
                color_code_key = f'colors[{index}][color_code]'
                color_code = self.request.data.get(color_code_key)
                colors_data.append({'name': name, 'color_code': color_code})

            elif key.startswith('gallery') and '[image]' in key:
                index = key.split('[')[1].split(']')[0]
                image = value
                gallery_data.append({'image': image})

        self.save_nested_data(product_instance, SpecificationSerializer, specifications_data)
        self.save_nested_data(product_instance, SizeSerializer, sizes_data)
        self.save_nested_data(product_instance, ColorSerializer, colors_data)
        self.save_nested_data(product_instance, GallerySerializer, gallery_data)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def save_nested_data(self, product_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context = {'product_instance': product_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(product = product_instance)


class ProductUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        product_pid = self.kwargs['product_pid']

        vendor = Vendor.objects.get(id = vendor_id)
        product = Product.objects.get(pid = product_pid, vendor = vendor)
        return product

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        product = self.get_object()

        serializer = self.get_serializer(product, data = request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        product.specification().delete()
        product.color().delete()
        product.size().delete()
        product.gallery().delete()

        specifications_data = []
        sizes_data = []
        colors_data = []
        gallery_data = []
        
        for key, value in self.request.data.items():
            # specification[0][title]
            if key.startswith('specifications') and '[title]' in key:
                index = key.split('[')[1].split(']')[0]

                title = value
                content_key = f'specifications[{index}][content]'
                content = self.request.data.get(content_key)
                specifications_data.append({'title': title, 'content': content})

            elif key.startswith('sizes') and '[name]' in key:
                index = key.split('[')[1].split(']')[0]
                name = value
                price_key = f'sizes[{index}][price]'
                price = self.request.data.get(price_key)
                sizes_data.append({'name': name, 'price': price})

            elif key.startswith('colors') and '[name]' in key:
                index = key.split('[')[1].split(']')[0]
                name = value
                color_code_key = f'colors[{index}][color_code]'
                color_code = self.request.data.get(color_code_key)
                colors_data.append({'name': name, 'color_code': color_code})

            elif key.startswith('gallery') and '[image]' in key:
                index = key.split('[')[1].split(']')[0]
                image = value
                gallery_data.append({'image': image})

        self.save_nested_data(product, SpecificationSerializer, specifications_data)
        self.save_nested_data(product, SizeSerializer, sizes_data)
        self.save_nested_data(product, ColorSerializer, colors_data)
        self.save_nested_data(product, GallerySerializer, gallery_data)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def save_nested_data(self, product_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context = {'product_instance': product_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(product = product_instance)


class ProductDeleteAPIView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_object(self):
        vendor_id = self.kwargs['vendor_id']
        product_pid = self.kwargs['product_pid']

        vendor = Vendor.objects.get(id=vendor_id)
        product = Product.objects.get(vendor=vendor, pid=product_pid)
        return product

class VendorRegister(generics.CreateAPIView):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        payload = request.data

        image = payload['image']
        name = payload['name']
        email = payload['email']
        description = payload['description']
        mobile = payload['mobile']
        user_id = payload['user_id']

        Vendor.objects.create(
            image=image,
            name=name,
            email=email,
            description=description,
            mobile=mobile,
            user_id=user_id,
        )

        return Response({"message":"Created vendor account"})