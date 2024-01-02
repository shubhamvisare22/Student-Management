from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, SubjectScoreViewSet, UserRegistrationView, TokenRefreshView, UserLoginView, StudentViewSet, student_management_view, subject_management_view

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'subject-scores', SubjectScoreViewSet, basename='subject-score')
router.register(r'students', StudentViewSet, basename='student')    

urlpatterns = [
    
    path('student-crud/', student_management_view, name='student_crud'),
    path('subject-crud/', subject_management_view, name='subject_crud'),
    
    # --------------------------- Registration and Token urls --------------------------
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('refresh-token/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # --------------------------- subject urls --------------------------
    path('subject-list/', SubjectViewSet.as_view({'get': 'list'}), name='subject-list'),
    path('subject-create/', SubjectViewSet.as_view({'post': 'create'}), name='subject-create'),
    path('subject-detail/<int:pk>/', SubjectViewSet.as_view({'get': 'retrieve'}), name='subject-detail'),
    path('subject-update/<int:pk>/', SubjectViewSet.as_view({'put': 'update'}), name='subject-update'),
    path('subject-partial-update/<int:pk>/', SubjectViewSet.as_view({'patch': 'partial_update'}), name='subject-partial-update'),
    path('subject-delete/<int:pk>/', SubjectViewSet.as_view({'delete': 'destroy'}), name='subject-delete'), 
    

    # --------------------------- subject score urls --------------------------
    path('subject-score-list/', SubjectScoreViewSet.as_view({'get': 'list'}), name='subject-score-list'),
    path('subject-score-create/', SubjectScoreViewSet.as_view({'post': 'create'}), name='subject-score-create'),
    path('subject-score-detail/<int:pk>/', SubjectScoreViewSet.as_view({'get': 'retrieve'}), name='subject-score-detail'),
    path('subject-score-update/<int:pk>/', SubjectScoreViewSet.as_view({'put': 'update'}), name='subject-score-update'),
    path('subject-score-partial-update/<int:pk>/', SubjectScoreViewSet.as_view({'patch': 'partial_update'}), name='subject-score-partial-update'),
    path('subject-score-delete/<int:pk>/', SubjectScoreViewSet.as_view({'delete': 'destroy'}), name='subject-score-delete'),
    
    
    # --------------------------- student urls --------------------------
    path('student-list/', StudentViewSet.as_view({'get': 'list'}), name='student-list'),
    path('student-create/', StudentViewSet.as_view({'post': 'create'}), name='student-create'),
    path('student-detail/<int:pk>/', StudentViewSet.as_view({'get': 'retrieve'}), name='student-detail'),
    path('student-update/<int:pk>/', StudentViewSet.as_view({'put': 'update'}), name='student-update'),
    path('student-partial-update/<int:pk>/', StudentViewSet.as_view({'patch': 'partial_update'}), name='student-partial-update'),
    path('student-delete/<int:pk>/', StudentViewSet.as_view({'delete': 'destroy'}), name='student-delete'),

    path('', include(router.urls)),
]
