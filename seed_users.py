import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

users = [
    ("investigator", "password123", User.Role.INVESTIGATING_OFFICER),
    ("evidence_officer", "password123", User.Role.EVIDENCE_OFFICER),
    ("forensic_officer", "password123", User.Role.FORENSIC_OFFICER),
    ("supervisor", "password123", User.Role.SUPERVISOR),
]

for username, password, role in users:
    if not User.objects.filter(username=username).exists():
        u = User.objects.create_user(username=username, password=password, role=role)
        print(f"Created {role}: {username}")
    else:
        print(f"User {username} already exists.")
