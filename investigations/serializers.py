from rest_framework import serializers
from investigations.models import InvestigationCase
from accounts.models import User

class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestigationCase
        fields = "__all__"
        read_only_fields = ["id", "investigating_officer", "created_at", "updated_at"]
        depth = 1

    def to_internal_value(self, data):
        ret = super().to_internal_value(data) if not hasattr(self, '_skip_super') else {}
        
        # Resolve foreign keys that depth=1 would otherwise make read-only
        if "forensic_officer" in data:
            val = data.get("forensic_officer")
            if val:
                try:
                    fo = User.objects.get(pk=val)
                    if fo.role != User.Role.FORENSIC_OFFICER and fo.role != User.Role.ADMIN:
                        raise serializers.ValidationError({"forensic_officer": "Must be a Forensic Officer."})
                    ret["forensic_officer"] = fo
                except User.DoesNotExist:
                    raise serializers.ValidationError({"forensic_officer": "Forensic officer not found."})
            else:
                ret["forensic_officer"] = None

        if "supervisor" in data:
            val = data.get("supervisor")
            if val:
                try:
                    sup = User.objects.get(pk=val)
                    if sup.role != User.Role.SUPERVISOR and sup.role != User.Role.ADMIN:
                        raise serializers.ValidationError({"supervisor": "Must be a Supervisor."})
                    ret["supervisor"] = sup
                except User.DoesNotExist:
                    raise serializers.ValidationError({"supervisor": "Supervisor not found."})
            else:
                ret["supervisor"] = None

        return ret
