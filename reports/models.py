from django.db import models
from django.conf import settings
from investigations.models import InvestigationCase

class InvestigationReport(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
    case = models.ForeignKey(InvestigationCase, on_delete=models.PROTECT, related_name="reports")
    title = models.CharField(max_length=255)
    summary = models.TextField(blank=True)
    findings = models.JSONField(default=dict, blank=True)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="reports_created")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    supervisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="reports_decided", null=True, blank=True)
    supervisor_comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
