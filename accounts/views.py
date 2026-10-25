from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import PermissionDenied

from accounts.models import User
from accounts.serializers import LoginSerializer, UserSerializer, UserCreateSerializer

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
        if self.request.user.role != User.Role.ADMIN:
            raise PermissionDenied("Admin only.")
        return super().get_queryset()
    def get_serializer_class(self):
        return UserCreateSerializer if self.request.method == "POST" else UserSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if self.request.user.role != User.Role.ADMIN:
            raise PermissionDenied("Admin only.")
        return super().get_queryset()
