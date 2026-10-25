from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.views.generic import TemplateView

urlpatterns=[
    path("", TemplateView.as_view(template_name="dashboard.html"), name="dashboard"),
    path("admin/",admin.site.urls),
    path("api/auth/",include("accounts.urls")),
    path("api/cases/",include("investigations.urls")),
    path("api/evidence/",include("evidence.urls")),
    path("api/reports/",include("reports.urls")),
    path("api/audit/",include("audit.urls")),
]
if settings.DEBUG: urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
