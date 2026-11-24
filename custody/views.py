from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from custody.models import ChainOfCustody
from custody.serializers import ChainOfCustodySerializer
from evidence.models import Evidence
from accounts.models import User


class EvidenceCustodyListView(APIView):
    """GET /api/custody/evidence/<pk>/ — return all custody records for one evidence item."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        u = request.user
        q = Evidence.objects.select_related("case")
        if u.role in [User.Role.ADMIN, User.Role.EVIDENCE_OFFICER]:
            pass
        elif u.role == User.Role.INVESTIGATING_OFFICER:
            q = q.filter(case__investigating_officer=u)
        elif u.role == User.Role.FORENSIC_OFFICER:
            q = q.filter(case__forensic_officer=u)
        elif u.role == User.Role.SUPERVISOR:
            q = q.filter(case__supervisor=u)
        else:
            q = q.none()

        evidence = q.filter(pk=pk).first()
        if evidence is None:
            raise NotFound("Evidence not found or access denied.")

        records = ChainOfCustody.objects.filter(evidence=evidence).select_related("user").order_by("timestamp")
        return Response(ChainOfCustodySerializer(records, many=True).data)
