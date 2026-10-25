import ipaddress
from audit.models import AuditLog

def ip_for(request):
    ip = request.META.get("REMOTE_ADDR") if request else None
    try:
        return str(ipaddress.ip_address(ip)) if ip else None
    except ValueError:
        return None

def audit(user, action, details=None, request=None):
    return AuditLog.objects.create(
        user=user,
        action=action,
        details=details or {},
        ip_address=ip_for(request)
    )
