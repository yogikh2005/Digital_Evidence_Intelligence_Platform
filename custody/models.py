from django.db import models
from django.conf import settings
from evidence.models import Evidence

class ChainOfCustody(models.Model):
    evidence = models.ForeignKey(Evidence, on_delete=models.PROTECT, related_name="custody_records")
    action = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    hash_value = models.CharField(max_length=64, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["timestamp"]
