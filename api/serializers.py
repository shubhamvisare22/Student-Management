from rest_framework import serializers
from .models import Subject, Student, SubjectScore
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('id', 'name')  


class SubjectScoreSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer()

    class Meta:
        model = SubjectScore
        fields = ('score', 'subject')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if 'student_scores' in self.context:  
            # Exclude 'id' field for 'score' when used in StudentSerializer
            representation['subject'] = {
                'id': representation['subject']['id'],
                'name': representation['subject']['name']
            }
            representation.pop('id', None)  # Remove 'id' field from 'score'
        return representation



class StudentSerializer(serializers.ModelSerializer):
    subject_scores = SubjectScoreSerializer(many=True, context={'student_scores': True})
    

    class Meta:
        model = Student
        fields = ('id', 'name', 'roll_no', 'photo', 'student_class', 'subject_scores')

