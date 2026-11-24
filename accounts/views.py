from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.db.models import ProtectedError

from accounts.models import User
from accounts.serializers import LoginSerializer, UserSerializer, UserCreateSerializer
from audit.services import audit

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

class MeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by("username")
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        if u.role == User.Role.ADMIN:
            return User.objects.all().order_by("username")
        return User.objects.filter(is_active=True).order_by("username")

    def create(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN:
            raise PermissionDenied("Only Admin can create user accounts.")
        return super().create(request, *args, **kwargs)

    def get_serializer_class(self):
        return UserCreateSerializer if self.request.method == "POST" else UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != User.Role.ADMIN:
            raise PermissionDenied("Admin only.")
        return super().get_queryset()

    def perform_update(self, serializer):
        user = serializer.save()
        audit(self.request.user, "USER_UPDATED", {"user_id": user.id, "username": user.username}, self.request)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.id == request.user.id:
            raise ValidationError({"detail": "You cannot delete your own admin account."})
        
        username = instance.username
        user_id = instance.id
        try:
            instance.delete()
            audit(request.user, "USER_DELETED", {"user_id": user_id, "username": username, "type": "HARD_DELETE"}, request)
            return Response({"detail": f"User '{username}' deleted successfully."}, status=status.HTTP_200_OK)
        except ProtectedError:
            instance.is_active = False
            instance.save(update_fields=["is_active"])
            audit(request.user, "USER_DEACTIVATED", {"user_id": user_id, "username": username, "type": "DEACTIVATED_DUE_TO_AUDIT_LOGS"}, request)
            return Response({"detail": f"User '{username}' is linked to historical forensic records, so the account was deactivated instead of deleted."}, status=status.HTTP_200_OK)
