from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.views import APIView
from .models import Subject, Student, SubjectScore
from .serializers import SubjectSerializer, StudentSerializer, SubjectScoreSerializer, UserSerializer
from django.contrib.auth import authenticate
from .paginations import CustomPagination
from django.db.models import Sum
from django.shortcuts import render
from django.db.models import Q


def student_management_view(request):
    return render(request, 'index.html')


def subject_management_view(request):
    return render(request, 'subject.html')


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            return Response(tokens, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TokenRefreshView(APIView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                access_token = str(refresh.access_token)
                return Response({'access': access_token})
            except TokenError as e:
                return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Refresh token not provided'}, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            return Response(tokens, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials or user not found'}, status=status.HTTP_401_UNAUTHORIZED)


class SubjectViewSet(viewsets.ModelViewSet):

    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    pagination_class = CustomPagination


class SubjectScoreViewSet(viewsets.ModelViewSet):

    queryset = SubjectScore.objects.all()
    serializer_class = SubjectScoreSerializer
    pagination_class = CustomPagination


class StudentViewSet(viewsets.ModelViewSet):

    queryset = Student.objects.annotate(total_score=Sum('subject_scores__score')).order_by('-total_score')
    serializer_class = StudentSerializer
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):
        # print(request.data)
        # <QueryDict: {'name': ['s1'], 'roll_no': ['1'], 'stu_cls': ['1'], 'csrfmiddlewaretoken': ['I7RrGC1iI6Ng1Jb5fYJIrI71IqyzitAwIgXGpD6JGelxiUbWSKLhv99vQXk29eyp'], 'subject_scores': ['[{"subject":1,"score":1},{"subject":2,"score":2},{"subject":3,"score":3},{"subject":4,"score":4},{"subject":5,"score":5}]'], 'photo': [<TemporaryUploadedFile: phir-hera-pheri-mere-ko-to-aisa-dhak-dhak-ho-rela-hai.gif (image/gif)>]}>
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()   
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        queryset = super().get_queryset()
        query_params = self.request.query_params

        filters = {param: value for param, value in query_params.items() if param != 'page'}

        if filters:
            queryset = queryset.filter(**filters)

        return queryset


class GetStudentsListView(generics.ListAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query_params = self.request.query_params
        queryset = Student.objects.all()

        filters = {}
        for param, value in query_params.items():
            filters[param] = value

        if filters:
            queryset = queryset.filter(**filters)

        return queryset
