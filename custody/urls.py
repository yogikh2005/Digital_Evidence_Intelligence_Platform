from django.urls import path
from .views import EvidenceCustodyListView

urlpatterns = [
    path("evidence/<int:pk>/", EvidenceCustodyListView.as_view(), name="evidence-custody"),
]
