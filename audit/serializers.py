from rest_framework import serializers
from audit.models import AuditLog

class AuditSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = AuditLog
        fields = ["id", "username", "action", "details", "ip_address", "timestamp"]
