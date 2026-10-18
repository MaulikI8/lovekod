from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Support both /django-admin/ and /api/django-admin/ for cPanel Passenger compatibility
    path('django-admin/', admin.site.urls),
    path('api/django-admin/', admin.site.urls),
    path('api/', include('store.urls')),
    path('', include('store.urls')),
]

# Ensure uploaded media is always accessible via /media/
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
