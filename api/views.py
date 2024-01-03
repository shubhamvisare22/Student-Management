from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .models import Subject, Student, SubjectScore
from .serializers import SubjectSerializer, StudentSerializer, SubjectScoreSerializer, UserSerializer
from django.contrib.auth import authenticate
from .paginations import CustomPagination
from django.db.models import Sum
from django.shortcuts import render
from django.http import JsonResponse


def student_management_view(request):
    return render(request, 'index.html')


def subject_management_view(request):
    return render(request, 'subject.html')


def create_student(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        roll_no = request.POST.get('roll_no')
        photo = request.FILES.get('photo')
        stu_cls = request.POST.get('stu_cls')
        subjects = []

        for i in range(1, 6):
            subject_id = request.POST.get(f'subject_scores[{i - 1}][subject]')
            score = request.POST.get(f'subject_scores[{i - 1}][score]')

            if subject_id and score:
                subjects.append({'subject_id': subject_id, 'score': score})

        if not all([name, roll_no, photo, stu_cls, subjects]):
            return JsonResponse({'message': 'Missing required fields.'}, status=400)

        try:
            student = Student.objects.create(
                name=name, roll_no=roll_no, photo=photo, student_class=stu_cls)
        except:
            return JsonResponse({'message': 'Roll number must be unique', 'status': 0}, status=400)

        for subject_data in subjects:
            subject = Subject.objects.get(id=subject_data['subject_id'])
            SubjectScore.objects.create(
                student=student, subject=subject, score=subject_data['score'])

        return JsonResponse({'message': 'Student created successfully!', 'status': 1})
    else:
        return JsonResponse({'message': 'Invalid request method'}, status=400)


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserSerializer
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            return Response(tokens, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TokenRefreshView(APIView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                access_token = str(refresh.access_token)
                return Response({'access': access_token})
            except Exception as e:
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
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class SubjectViewSet(viewsets.ModelViewSet):

    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    # permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination


class SubjectScoreViewSet(viewsets.ModelViewSet):

    queryset = SubjectScore.objects.all()
    serializer_class = SubjectScoreSerializer
    # permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination


class StudentViewSet(viewsets.ModelViewSet):
    
    # def create(self, request, *args, **kwargs):
    #     print(request.data)
    
    queryset = Student.objects.annotate(total_score=Sum(
        'subject_scores__score')).order_by('-total_score')
    serializer_class = StudentSerializer
    # permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        query_params = self.request.query_params

        filters = {}
        for param, value in query_params.items():
            filters[param] = value

        if filters:
            queryset = queryset.filter(**filters)

        return queryset
