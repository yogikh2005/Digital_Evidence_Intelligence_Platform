from rest_framework import serializers
from custody.models import ChainOfCustody


class ChainOfCustodySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = ChainOfCustody
        fields = ["id", "action", "username", "role", "hash_value", "ip_address", "timestamp"]
