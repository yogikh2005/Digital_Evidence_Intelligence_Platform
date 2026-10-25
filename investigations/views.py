from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from investigations.models import InvestigationCase
from investigations.serializers import CaseSerializer
from accounts.models import User
from audit.services import audit

class CaseListCreateView(generics.ListCreateAPIView):
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        u = self.request.user
        q = InvestigationCase.objects.all()
        if u.role == User.Role.ADMIN: return q
        if u.role == User.Role.INVESTIGATING_OFFICER: return q.filter(investigating_officer=u)
        if u.role == User.Role.FORENSIC_OFFICER: return q.filter(forensic_officer=u)
        if u.role == User.Role.SUPERVISOR: return q.filter(supervisor=u)
        return q.none()
    def perform_create(self, serializer):
        u = self.request.user
        if u.role not in [User.Role.ADMIN, User.Role.INVESTIGATING_OFFICER]:
            raise PermissionDenied("Only Admin or Investigating Officer can create cases.")
        obj = serializer.save(investigating_officer=u)
        audit(u, "CASE_CREATED", {"case_id": obj.id}, self.request)

class CaseDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        u = self.request.user
        q = InvestigationCase.objects.all()
        if u.role == User.Role.ADMIN: return q
        if u.role == User.Role.INVESTIGATING_OFFICER: return q.filter(investigating_officer=u)
        if u.role == User.Role.FORENSIC_OFFICER: return q.filter(forensic_officer=u)
        if u.role == User.Role.SUPERVISOR: return q.filter(supervisor=u)
        return q.none()
    def update(self, request, *args, **kwargs):
        if request.user.role not in [User.Role.ADMIN, User.Role.INVESTIGATING_OFFICER]:
            raise PermissionDenied("Only Admin or Investigating Officer can update cases.")
        return super().update(request, *args, **kwargs)
