from django.urls import path
from .views import ReportListCreateView, ReportSubmitView, ReportDecisionView

urlpatterns = [
    path("", ReportListCreateView.as_view()),
    path("<int:pk>/submit/", ReportSubmitView.as_view()),
    path("<int:pk>/decision/", ReportDecisionView.as_view()),
]
