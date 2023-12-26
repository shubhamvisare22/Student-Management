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


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserSerializer

    """
        Registers a new user.

        Accepts a POST request with user details and creates a new user if the details are valid.

        Request Data:
        - username: The username for the new user
        - password: The password for the new user

        Returns:
        - Upon successful registration, returns a response with tokens for the new user's authentication:
            {
                "refresh": "<refresh_token_string>",
                "access": "<access_token_string>"
            }

        - If the registration fails due to invalid details, returns a response with errors and a status code of 400.
    """

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

    """
        Refreshes an access token using a refresh token.

        Accepts a POST request with a 'refresh' token and returns a new 'access' token.

        Request Data:
        - refresh: The refresh token to generate a new access token

        Returns:
        - Upon successful refresh, returns a response with a new 'access' token:
            {
                "access": "<new_access_token_string>"
            }

        - If the refresh token is invalid or expired, returns a response with an error and a status code of 400.
    """

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

    """
        Authenticates user credentials and returns access and refresh tokens.

        Accepts a POST request with 'username' and 'password' fields for user authentication.

        Request Data:
        - username: Username for authentication
        - password: Password for authentication

        Returns:
        - Upon successful authentication, returns a response with 'access' and 'refresh' tokens:
            {
                "refresh": "<refresh_token_string>",
                "access": "<access_token_string>"
            }

        - If the provided credentials are invalid, returns a response with an error message and a status code of 401.
    """

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

    """
    API endpoint for managing subjects.

    list:
    Retrieve a paginated list of all subjects.

    create:
    Create a new subject instance.

    retrieve:
    Retrieve details of a specific subject instance.

    update:
    Update details of a specific subject instance.

    partial_update:
    Partially update details of a specific subject instance.

    destroy:
    Delete a specific subject instance.

    Attributes:
        queryset (QuerySet): The queryset of Subject objects.
        serializer_class (Serializer): The serializer class for Subject.
        permission_classes (list): Authenticated user only.
        pagination_class (CustomPagination): Custom Pagination.

    """

    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination


class SubjectScoreViewSet(viewsets.ModelViewSet):

    """
    API endpoint for managing subject scores.

    list:
    Retrieve a paginated list of all subject scores.

    create:
    Create a new subject score instance.

    retrieve:
    Retrieve details of a specific subject score instance.

    update:
    Update details of a specific subject score instance.

    partial_update:
    Partially update details of a specific subject score instance.

    destroy:
    Delete a specific subject score instance.

    Attributes:
        queryset (QuerySet): The queryset of SubjectScore objects.
        serializer_class (Serializer): The serializer class for SubjectScore.
        permission_classes (list): Authenticated user only.
        pagination_class (CustomPagination): Custom Pagination.

    """

    queryset = SubjectScore.objects.all()
    serializer_class = SubjectScoreSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination


class StudentViewSet(viewsets.ModelViewSet):

    """
    A ViewSet for interacting with Student objects.

    Provides CRUD operations for Student entities.
    Supports filtering by name, roll number, or student class.

    Query Parameters:
    - name: Filter by student name.
    - roll_no: Filter by student roll number.
    - student_class: Filter by student class.

    Results are paginated and ordered by total score (high to low).

    Endpoint Details:
    - get_queryset: Retrieve the list of students.
    - create: Create a new student instance.
    - retrieve: Retrieve a single student instance by ID.
    - update: Update a student instance by ID.
    - partial_update: Partially update a student instance by ID.
    - destroy: Delete a student instance by ID.
    """

    queryset = Student.objects.annotate(total_score=Sum('subject_scores__score')).order_by('-total_score')
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
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
