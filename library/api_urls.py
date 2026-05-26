from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BookViewSet, LoanViewSet, MemberViewSet, dashboard_stats


router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'members', MemberViewSet)
router.register(r'loans', LoanViewSet)

urlpatterns = router.urls + [
    path('dashboard/', dashboard_stats, name='dashboard-stats'),
]