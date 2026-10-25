from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from audit.models import AuditLog
from audit.serializers import AuditSerializer
from accounts.models import User

class AuditListView(generics.ListAPIView):
    serializer_class = AuditSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if self.request.user.role not in [User.Role.ADMIN, User.Role.SUPERVISOR]: raise PermissionDenied("Audit log access restricted to Admin/Supervisor.")
        return AuditLog.objects.select_related("user").all()
