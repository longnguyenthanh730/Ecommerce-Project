from django.contrib import admin
from store.models import Product, Tax, Category, Gallery, Specification, Size, Color, Cart, CartOrder, CartOrderItem, Review, ProductFaq, Notification, Wishlist, Coupon

class GalleryInLine(admin.TabularInline):
    model = Gallery
    extra = 0

class SpecificationInLine(admin.TabularInline):
    model = Specification
    extra = 0


class SizeInLine(admin.TabularInline):
    model = Size
    extra = 0


class ColorInLine(admin.TabularInline):
    model = Color
    extra = 0

class ProductAdmin(admin.ModelAdmin):
    list_display = ['title',   'price', 'category' , 'featured', 'shipping_amount', 'stock_qty', 'vendor']
    list_editable = ['featured']
    list_filter = ['date']
    search_fields = ['title']
    inlines = [GalleryInLine, SpecificationInLine, SizeInLine, ColorInLine]

class CartOrderAdmin(admin.ModelAdmin):
    list_editable = ['payment_status', 'order_status', 'total']
    list_display = ['oid', 'buyer', 'payment_status', 'order_status', 'total']

class ReviewAdmin(admin.ModelAdmin):
    list_display=['user', 'product']

admin.site.register(Category)
admin.site.register(Product, ProductAdmin)
admin.site.register(Cart)
admin.site.register(CartOrder, CartOrderAdmin)
admin.site.register(CartOrderItem)
admin.site.register(Review, ReviewAdmin)
admin.site.register(Tax)
admin.site.register(ProductFaq)
admin.site.register(Notification)
admin.site.register(Wishlist)
admin.site.register(Coupon)
