from django.urls import path
from .views import EvidenceListCreateView, EvidenceRequestListCreateView, EvidenceRequestActionView, EvidenceReviewView

urlpatterns = [
    path("", EvidenceListCreateView.as_view()),
    path("requests/", EvidenceRequestListCreateView.as_view()),
    path("requests/<int:pk>/action/", EvidenceRequestActionView.as_view()),
    path("<int:pk>/review/", EvidenceReviewView.as_view()),
]
