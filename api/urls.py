from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, SubjectScoreViewSet, StudentViewSet, UserRegistrationView, TokenRefreshView, UserLoginView

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet)
router.register(r'subject-scores', SubjectScoreViewSet)
router.register(r'students', StudentViewSet)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('refresh-token/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
