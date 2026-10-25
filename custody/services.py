from custody.models import ChainOfCustody
from audit.services import ip_for

def custody(evidence, user, action, request=None, hash_value=""):
    return ChainOfCustody.objects.create(
        evidence=evidence,
        user=user,
        action=action,
        hash_value=hash_value,
        ip_address=ip_for(request)
    )
