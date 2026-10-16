import os
import sys

# Ensure project root is in Python path for CloudLinux / cPanel Passenger
sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lovekod_core.settings')

from lovekod_core.wsgi import application
