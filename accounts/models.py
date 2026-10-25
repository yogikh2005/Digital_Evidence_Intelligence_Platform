from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        INVESTIGATING_OFFICER = "INVESTIGATING_OFFICER", "Investigating Officer"
        EVIDENCE_OFFICER = "EVIDENCE_OFFICER", "Evidence Officer"
        FORENSIC_OFFICER = "FORENSIC_OFFICER", "Forensic Officer"
        SUPERVISOR = "SUPERVISOR", "Supervisor"
    role = models.CharField(max_length=30, choices=Role.choices, default=Role.INVESTIGATING_OFFICER)
    employee_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    department = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    def __str__(self): return f"{self.username} ({self.role})"
