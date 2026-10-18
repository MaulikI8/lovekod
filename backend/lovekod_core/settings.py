import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'lovekod-secret-key-tihar-2083-production-ready'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party apps
    'corsheaders',
    'rest_framework',
    # Local apps
    'store',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'lovekod_core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'lovekod_core.wsgi.application'

# Load environment variables from .env if present
env_file = BASE_DIR / '.env'
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\""))

DB_ENGINE = os.environ.get('DB_ENGINE', '').lower()

if DB_ENGINE in ['postgres', 'postgresql', 'django.db.backends.postgresql']:
    try:
        import psycopg2
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.environ.get('DB_NAME', 'aashutos_lovekod'),
                'USER': os.environ.get('DB_USER', 'aashutos_admin'),
                'PASSWORD': os.environ.get('DB_PASSWORD', '2#+q@;(-yEjD7ubr'),
                'HOST': os.environ.get('DB_HOST', 'localhost'),
                'PORT': os.environ.get('DB_PORT', '5432'),
            }
        }
    except ImportError:
        # Graceful fallback to sqlite if psycopg2 is not installed in the python environment
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
elif DB_ENGINE in ['mysql', 'django.db.backends.mysql']:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.environ.get('DB_NAME', 'lovekod_db'),
            'USER': os.environ.get('DB_USER', 'root'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '3306'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kathmandu'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
}

# CSRF Trusted Origins for local development & proxying
CSRF_TRUSTED_ORIGINS = [
    "https://lovekod.com",
    "https://www.lovekod.com",
    "https://aashutoshbasnet.com",
    "http://lovekod.com",
    "http://www.lovekod.com",
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

CSRF_COOKIE_HTTPONLY = False
CSRF_USE_SESSIONS = False

# Media files configuration (File uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR.parent / 'public' / 'images'

# Modern Unfold Admin Customization & Navigation
from django.urls import reverse_lazy

UNFOLD = {
    "SITE_TITLE": "LoveKod Storefront Admin",
    "SITE_HEADER": "LoveKod (लभकोण) Boutique Admin",
    "SITE_URL": "http://localhost:5173",
    "DASHBOARD_CALLBACK": None,
    "COLORS": {
        "primary": {
            "50": "249 243 238",
            "100": "246 240 231",
            "200": "233 211 203",
            "300": "192 129 122",
            "400": "164 103 91",
            "500": "138 90 77",   # Brand Rose-Gold
            "600": "115 69 57",
            "700": "92 51 43",
            "800": "59 38 33",    # Brand Ink
            "900": "42 27 23",    # Brand Night
            "950": "25 15 13",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": "Store Operations",
                "separator": True,
                "items": [
                    {
                        "title": "Products & Stock",
                        "icon": "shopping_bag",
                        "link": reverse_lazy("admin:store_product_changelist"),
                    },
                    {
                        "title": "Customer Orders",
                        "icon": "receipt_long",
                        "link": reverse_lazy("admin:store_order_changelist"),
                    },
                    {
                        "title": "Create Order (Manual)",
                        "icon": "add_shopping_cart",
                        "link": reverse_lazy("admin:store_order_add"),
                    },
                    {
                        "title": "Categories",
                        "icon": "category",
                        "link": reverse_lazy("admin:store_category_changelist"),
                    },
                ],
            },
            {
                "title": "Storefront Content",
                "separator": True,
                "items": [
                    {
                        "title": "Global Site Settings & Flash Sale Timer",
                        "icon": "tune",
                        "link": reverse_lazy("admin:store_sitesettings_changelist"),
                    },
                    {
                        "title": "Customer Reviews",
                        "icon": "rate_review",
                        "link": reverse_lazy("admin:store_testimonial_changelist"),
                    },
                ],
            },
            {
                "title": "Quick Links",
                "separator": True,
                "items": [
                    {
                        "title": "Merchant Suite Portal",
                        "icon": "dashboard",
                        "link": "https://lovekod.com/admin",
                    },
                    {
                        "title": "View Live Storefront",
                        "icon": "open_in_new",
                        "link": "https://lovekod.com",
                    },
                ],
            },
        ],
    },
}

# Bypass PostgreSQL version check for cPanel legacy PostgreSQL 10
from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None
