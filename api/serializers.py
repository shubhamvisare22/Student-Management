from rest_framework import serializers
from .models import Subject, Student, SubjectScore
from django.contrib.auth.models import User
from django.db.models import Sum
import json


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
    class Meta:
        model = SubjectScore
        fields = ('subject', 'score')


class StudentSerializer(serializers.ModelSerializer):
    subject_scores = SubjectScoreSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = ('id', 'name', 'roll_no', 'student_class',
                  'photo', 'subject_scores')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        subject_scores_data = SubjectScore.objects.filter(student=instance)
        representation['subject_scores'] = SubjectScoreSerializer(
            subject_scores_data, many=True).data
        return representation
