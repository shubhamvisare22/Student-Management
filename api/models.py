from django.db import models


class Subject(models.Model):
    """
    Model to represent a subject.
    """
    name = models.CharField(max_length=50)
    
    def __str__(self) -> str:
        return self.name


class Student(models.Model):
    """
    Model to represent a Student.
    """
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=20, unique=True)
    subjects = models.ManyToManyField(Subject, related_name='students_enrolled', blank=True)
    photo = models.ImageField(upload_to='student_photos/', blank=True, null=True)
    student_class = models.IntegerField(choices=[(i, i) for i in range(1, 13)], default=1)

    def __str__(self) -> str:
        return self.name


class SubjectScore(models.Model):
    """
    Model to represent a SubjectScore.
    """
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='subject_scores')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    score = models.IntegerField()
    
    class Meta:
        unique_together = ('student', 'subject')
        
    def __str__(self) -> str:
        return f'{self.score}, {self.student}, {self.subject}'

