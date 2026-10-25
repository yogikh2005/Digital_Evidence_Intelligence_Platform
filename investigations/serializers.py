# pyrefly: ignore [missing-import]
from rest_framework import serializers
from investigations.models import InvestigationCase
from accounts.models import User

class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestigationCase
        fields = "__all__"
        read_only_fields = ["id", "investigating_officer", "created_at", "updated_at"]
        depth = 1
    def validate_forensic_officer(self, v):
        if v and v.role != User.Role.FORENSIC_OFFICER:
            raise serializers.ValidationError("Select a Forensic Officer.")
        return v
    def validate_supervisor(self, v):
        if v and v.role != User.Role.SUPERVISOR:
            raise serializers.ValidationError("Select a Supervisor.")
        return v
