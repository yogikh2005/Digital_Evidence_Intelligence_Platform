from django.utils import timezone
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError, NotFound

from reports.models import InvestigationReport
from reports.serializers import ReportSerializer
from accounts.models import User
from audit.services import audit

class ReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        u = self.request.user
        q = InvestigationReport.objects.all()
        if u.role == User.Role.ADMIN: return q
        if u.role == User.Role.SUPERVISOR: return q.filter(case__supervisor=u)
        if u.role == User.Role.INVESTIGATING_OFFICER: return q.filter(case__investigating_officer=u)
        if u.role == User.Role.FORENSIC_OFFICER: return q.filter(case__forensic_officer=u)
        return q.none()
    def perform_create(self, serializer):
        u = self.request.user
        if u.role not in [User.Role.ADMIN, User.Role.INVESTIGATING_OFFICER, User.Role.FORENSIC_OFFICER]: raise PermissionDenied("Only Admin, Investigating or Forensic Officer can create reports.")
        obj = serializer.save(generated_by=u)
        audit(u, "REPORT_CREATED", {"report_id": obj.id}, self.request)

class ReportSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        u = request.user
        try: obj = InvestigationReport.objects.get(pk=pk)
        except InvestigationReport.DoesNotExist: raise NotFound("Report not found.")
        permitted = (u.role == User.Role.INVESTIGATING_OFFICER and obj.case.investigating_officer_id == u.id) or (u.role == User.Role.FORENSIC_OFFICER and obj.case.forensic_officer_id == u.id)
        if not permitted: raise PermissionDenied("Only report author role on assigned case can submit.")
        if obj.status != "DRAFT": raise ValidationError("Only draft reports can be submitted.")
        obj.status = "UNDER_REVIEW"
        obj.save(update_fields=["status", "updated_at"])
        audit(u, "REPORT_SUBMITTED", {"report_id": obj.id}, request)
        return Response(ReportSerializer(obj).data)

class ReportDecisionView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        u = request.user
        if u.role != User.Role.SUPERVISOR: raise PermissionDenied("Only Supervisors can decide reports.")
        try: obj = InvestigationReport.objects.get(pk=pk, case__supervisor=u)
        except InvestigationReport.DoesNotExist: raise NotFound("Report not assigned to you.")
        decision = request.data.get("decision")
        if decision not in ["APPROVED", "REJECTED"]: raise ValidationError({"decision": "Use APPROVED or REJECTED."})
        if obj.status != "UNDER_REVIEW": raise ValidationError("Report must be under review first.")
        obj.status = decision
        obj.supervisor = u
        obj.supervisor_comment = str(request.data.get("comment", ""))[:5000]
        obj.approved_at = timezone.now() if decision == "APPROVED" else None
        obj.save()
        audit(u, "REPORT_" + decision, {"report_id": obj.id}, request)
        return Response(ReportSerializer(obj).data)
