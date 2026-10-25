from rest_framework import serializers
from reports.models import InvestigationReport

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestigationReport
        fields = "__all__"
        read_only_fields = ["id", "generated_by", "status", "supervisor", "supervisor_comment", "approved_at", "created_at", "updated_at"]
        depth = 1
