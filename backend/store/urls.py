from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('site-settings/', views.site_settings_detail_update, name='site_settings_detail_update'),
    path('categories/', views.category_list_create, name='category_list_create'),
    path('categories/<int:category_id>/', views.category_detail_update_delete, name='category_detail_update_delete'),
    path('festival-moments/', views.festival_moment_list_create, name='festival_moment_list_create'),
    path('festival-moments/<int:moment_id>/', views.festival_moment_detail_update_delete, name='festival_moment_detail_update_delete'),
    path('testimonials/', views.testimonial_list_create, name='testimonial_list_create'),
    path('testimonials/<int:testimonial_id>/', views.testimonial_detail_update_delete, name='testimonial_detail_update_delete'),
    path('products/', views.product_list_create, name='product_list_create'),
    path('products/reset/', views.reset_products_inventory, name='reset_products_inventory'),
    path('products/<str:product_id>/', views.product_detail_update_delete, name='product_detail_update_delete'),
    path('coupons/', views.coupon_list, name='coupon_list'),
    path('coupons/validate/', views.coupon_validate, name='coupon_validate'),
    path('customers/', views.customer_list_create, name='customer_list_create'),
    path('customers/lookup/', views.customer_lookup, name='customer_lookup'),
    path('customers/<str:phone>/', views.customer_detail_update_delete, name='customer_detail_update_delete'),
    path('orders/', views.order_list_create, name='order_list_create'),
    path('orders/<str:order_id>/', views.order_detail_update, name='order_detail_update'),
    path('admin/login/', views.admin_login_api, name='admin_login_api'),
    path('preview/product/<str:product_id>/', views.product_preview, name='product_preview'),
    path('p/<str:product_id>/', views.product_preview, name='short_product_preview'),
]
