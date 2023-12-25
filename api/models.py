from django.db import models
from django.contrib.auth.models import User


class Subject(models.Model):
    name = models.CharField(max_length=50)


class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=20, unique=True)
    subjects = models.ManyToManyField(Subject, related_name='students_enrolled', blank=True)
    photo = models.ImageField(upload_to='student_photos/', blank=True, null=True)
    student_class = models.IntegerField(choices=[(i, i) for i in range(1, 13)], default=1)


class SubjectScore(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='subject_scores')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    score = models.IntegerField()

        