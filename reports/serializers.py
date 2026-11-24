from rest_framework import serializers
from reports.models import InvestigationReport
from investigations.models import InvestigationCase

class ReportSerializer(serializers.ModelSerializer):
    case_id = serializers.PrimaryKeyRelatedField(
        queryset=InvestigationCase.objects.all(), source="case", write_only=True
    )

    class Meta:
        model = InvestigationReport
        fields = "__all__"
        read_only_fields = ["id", "generated_by", "status", "supervisor", "supervisor_comment", "approved_at", "created_at", "updated_at"]
        depth = 1
