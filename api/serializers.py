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
        fields = '__all__'


class SubjectScoreSerializer(serializers.ModelSerializer):
    """
    Serializer for the SubjectScore model.
    """

    class Meta:
        model = SubjectScore
        fields = ('subject', 'score')


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Student model.
    """
    subject_scores = SubjectScoreSerializer(many=True)

    class Meta:
        model = Student
        fields = ('id', 'name', 'roll_no', 'student_class','photo', 'subject_scores')

    def create(self, validated_data):
        subject_scores_data = validated_data.pop('subject_scores')
        student = Student.objects.create(**validated_data)
        for score_data in subject_scores_data:
            SubjectScore.objects.create(student=student, **score_data)
        return student
