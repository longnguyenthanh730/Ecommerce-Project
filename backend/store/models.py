from django.db import models
from django.utils.text import slugify
from django.dispatch import receiver
from django.db.models.signals import post_save


from vendor.models import Vendor
from userauths.models import User, Profile

from shortuuid.django_fields import ShortUUIDField


class Category(models.Model):
    title = models.CharField(max_length=100)
    image = models.FileField(upload_to="category", default="category.jpg", null=True, blank=True)
    active = models.BooleanField(default=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['title']

class Product(models.Model):

    STATUS = (
        ("draft", "Draft"),
        ("disabled", "Disabled"),
        ("in_review", "In_review"),
        ("published", "Published"),
    )

    title = models.CharField(max_length=100)
    image = models.FileField(upload_to="products", default="product.jpg", blank=True, null=True)
    description = models.TextField(null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    old_price = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    shipping_amount = models.DecimalField( decimal_places=2, max_digits=12, default=0.00)
    stock_qty = models.PositiveIntegerField(default=1)
    in_stock = models.BooleanField(default=True)
    status = models.CharField(max_length=100, choices=STATUS, default="published")
    featured = models.BooleanField(default=False)
    views = models.PositiveIntegerField(default=0)
    rating = models.PositiveBigIntegerField(default=0, null=True, blank=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    pid = ShortUUIDField(unique=True, length=10, alphabet="abcdefg12345")
    slug = models.SlugField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def product_rating(self):
        product_rating = Review.objects.filter(product=self).aggregate(avg_rating=models.Avg("rating"))
        return product_rating['avg_rating']
    
    def rating_count(self):
        return Review.objects.filter(product=self).count()
        
    def gallery(self):
        return Gallery.objects.filter(product=self)
    
    def color(self):
        return Color.objects.filter(product=self)
    
    def size(self):
        return Size.objects.filter(product=self)
    
    def specification(self):
        return Specification.objects.filter(product=self)
    
    def orders(self):
        return CartOrderItem.objects.filter(product=self).count()


    def save(self, *args, **kwargs):
        self.rating = self.product_rating()
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.title)
        super(Product, self).save(*args, **kwargs)


class Gallery(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    image = models.FileField(upload_to="products", default="product.jpg", null=True, blank=True)
    active = models.BooleanField(default=True)
    gid = ShortUUIDField(length=10, max_length=25, alphabet="abcdefg12345")

    def __str__(self):
        return self.product.title
    
    class Meta:
        verbose_name_plural = 'Product Images'

class Specification(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=1000, null=True, blank=True)
    content = models.CharField(max_length=1000, null=True, blank=True)


    def __str__(self):
        return self.product.title


class Size(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=1000, null=True, blank=True)
    price = models.DecimalField(decimal_places=2, max_digits=12, default=0.00, null=True, blank=True)


    def __str__(self):
        return self.name
    

class Color(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=1000, null=True, blank=True)
    color_code = models.CharField(max_length=1000, null=True, blank=True)


    def __str__(self):
        return self.name
    
class Cart(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    qty = models.PositiveIntegerField(default=0)
    price = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    sub_total = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    shipping_amount = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    service_fee = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    tax_fee = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    total = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    country = models.CharField(max_length=100, null=True, blank=True)
    size = models.CharField(max_length=100, null=True, blank=True)
    color = models.CharField(max_length=100, null=True, blank=True)
    cart_id = models.CharField(max_length=1000, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.cart_id} - {self.product.title}'
    

class CartOrder(models.Model):
    PAYMENT_STATUS = (
        ("paid", "Paid"),
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("cancelled", "Cancelled"),
    )

    ORDER_STATUS = (
        ("Pending", "Pending"),
        ("Fulfilled", "Fulfilled"),
        ("Cancelled", "Cancelled"),
    )

    vendor = models.ManyToManyField(Vendor, blank=True)
    buyer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="buyer", blank=True)

    sub_total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    shipping_amount = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    tax_fee = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    service_fee = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)

    payment_status = models.CharField(max_length=100, choices=PAYMENT_STATUS, default="pending")
    order_status = models.CharField(max_length=100, choices=ORDER_STATUS, default="Pending")
    
    #Coupons
    initial_total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    saved = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    
    #Bio Data
    full_name = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    mobile = models.CharField(max_length=100)
    
    # Shipping Address
    address = models.CharField(max_length=1000, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

    stripe_session_id = models.CharField(max_length=1000, null=True, blank=True)

    oid = ShortUUIDField(unique=True, length=10, alphabet="abcdefg12345")
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.oid

    def orderitem(self):
        return CartOrderItem.objects.filter(order=self)


class CartOrderItem(models.Model):
    order = models.ForeignKey(CartOrder, on_delete=models.CASCADE)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    qty = models.IntegerField(default=0)
    price = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    sub_total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    shipping_amount = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    tax_fee = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    service_fee = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    country = models.CharField(max_length=100, null=True, blank=True)

    color = models.CharField(max_length=100, null=True, blank=True)
    size = models.CharField(max_length=100, null=True, blank=True)

    #Coupons
    coupon = models.ManyToManyField("store.Coupon", blank=True)
    initial_total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    saved = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    oid = ShortUUIDField(unique=True, length=10, alphabet="abcdefg12345")
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.oid
    
class ProductFaq(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    email = models.EmailField(null=True, blank=True)
    question = models.CharField(max_length=1000)
    answer = models.TextField(null=True, blank=True)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)
        
    def __str__(self):
        return self.question
    
    class Meta:
        verbose_name_plural = "Product FAQs"

class Review(models.Model):
    RATING = (
        (1, "1 Star"),
        (2, "2 Star"),
        (3, "3 Star"),
        (4, "4 Star"),
        (5, "5 Star"),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    review = models.TextField()
    reply = models.TextField(null=True, blank=True)
    rating = models.IntegerField(choices=RATING, default=None)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)
        
    def __str__(self):
        return self.product.title
    
    class Meta:
        verbose_name_plural = "Reviews & Rating"

    def profile(self):
        return Profile.objects.get(user=self.user)
    
receiver(post_save, sender = Review)
def update_product_rating(sender, instance, **kwargs):
    if instance.product:
        instance.product.save()


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.product.title

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null= True, blank= True)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null= True, blank= True)
    order = models.ForeignKey(CartOrder, on_delete=models.SET_NULL, null= True, blank= True)
    order_item = models.ForeignKey(CartOrderItem, on_delete=models.SET_NULL, null=True, blank=True)
    seen = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        if self.order:
            return self.order.oid
        else:
            return f"Notification - {self.pk}"
        

class Coupon(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    user_by = models.ManyToManyField(User, blank=True)
    code = models.CharField(max_length=1000)
    discount = models.IntegerField(default=1)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code


class Tax(models.Model):
    country = models.CharField(max_length=100)
    rate = models.IntegerField(default=5, help_text="Numbers added here are in percentage e.g 5%")
    active = models.BooleanField(default=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.country
    
    class Meta:
        verbose_name_plural = "Taxes"
        ordering = ['country']