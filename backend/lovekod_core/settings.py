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
    'lovekod_core.middleware.NoCacheAPIMiddleware',
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
STATICFILES_DIRS = [BASE_DIR / 'static']

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
# Media files configuration (File uploads)
cpanel_root = Path('/home8/aashutos/lovekod.com')
if cpanel_root.exists():
    MEDIA_ROOT = cpanel_root / 'media'
elif (BASE_DIR.parent / 'public' / 'images').exists():
    MEDIA_ROOT = BASE_DIR.parent / 'public' / 'images'
else:
    MEDIA_ROOT = BASE_DIR / 'media'

try:
    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
except Exception:
    pass

# Modern Unfold Admin Customization & Navigation
from django.urls import reverse_lazy

UNFOLD = {
    "SITE_TITLE": "LoveKod - Blanxer Vendor",
    "SITE_HEADER": "LoveKod (लभकोण)",
    "SITE_URL": "https://lovekod.com",
    "THEME": "light",
    "DASHBOARD_CALLBACK": "store.admin.blanxer_dashboard_callback",
    "STYLES": ["/static/css/admin_fix.css"],
    "COLORS": {
        "primary": {
            "50": "245 243 255",
            "100": "237 233 254",
            "200": "221 214 254",
            "300": "196 181 253",
            "400": "167 139 250",
            "500": "124 58 237",   # Blanxer Purple
            "600": "109 40 217",
            "700": "91 33 182",
            "800": "76 29 149",
            "900": "46 16 101",
            "950": "24 8 50",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Main Links",
                "separator": True,
                "items": [
                    {
                        "title": "Home",
                        "icon": "home",
                        "link": reverse_lazy("admin:index"),
                    },
                    {
                        "title": "Categories",
                        "icon": "grid_view",
                        "link": reverse_lazy("admin:store_category_changelist"),
                    },
                    {
                        "title": "Products",
                        "icon": "inventory_2",
                        "link": reverse_lazy("admin:store_product_changelist"),
                    },
                    {
                        "title": "Orders",
                        "icon": "shopping_bag",
                        "link": reverse_lazy("admin:store_order_changelist"),
                    },
                    {
                        "title": "Reviews",
                        "icon": "rate_review",
                        "link": reverse_lazy("admin:store_testimonial_changelist"),
                    },
                    {
                        "title": "Discount Coupons",
                        "icon": "local_offer",
                        "link": reverse_lazy("admin:store_coupon_changelist"),
                    },
                    {
                        "title": "Festival Moments",
                        "icon": "celebration",
                        "link": reverse_lazy("admin:store_festivalmoment_changelist"),
                    },
                ],
            },
            {
                "title": "Customizations",
                "separator": True,
                "items": [
                    {
                        "title": "Content & Banners",
                        "icon": "palette",
                        "link": reverse_lazy("admin:store_sitesettings_changelist"),
                    },
                    {
                        "title": "Admin Users",
                        "icon": "manage_accounts",
                        "link": reverse_lazy("admin:auth_user_changelist"),
                    },
                    {
                        "title": "Live Storefront",
                        "icon": "storefront",
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
