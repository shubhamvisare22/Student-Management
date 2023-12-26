from rest_framework import serializers
from .models import Subject, Student, SubjectScore
from django.contrib.auth.models import User
from django.db.models import Sum


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    """
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class SubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for the Subject model.
    """
    class Meta:
        model = Subject
        fields = ('id', 'name')


class SubjectScoreSerializer(serializers.ModelSerializer):
    """
    Serializer for the SubjectScore model.
    """
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())

    class Meta:
        model = SubjectScore
        fields = ('id', 'score', 'subject', 'student')


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Student model.
    """
    subject_scores = SubjectScoreSerializer(many=True, required=False)
    total_score = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ('id', 'name', 'roll_no', 'photo',
                  'student_class', 'subject_scores', 'total_score')

    def get_total_score(self, obj):
        return obj.subject_scores.aggregate(total_score=Sum('score'))['total_score'] or 0
