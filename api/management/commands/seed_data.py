# your_app/management/commands/seed_data.py

from django.core.management.base import BaseCommand
from faker import Faker
from random import randint
import uuid
from ...models import Student, Subject, SubjectScore

fake = Faker()

class Command(BaseCommand):
    help = 'Seeds dummy data into the database'

    def handle(self, *args, **kwargs):
        self.seed_data()

    
    
    
    def seed_data(self):
        self.stdout.write("Seeding data...")

        # Create subjects
        subject_names = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History']
        subjects = [Subject.objects.create(name=name) for name in subject_names]

        # Create students
        for _ in range(101):
            student = Student.objects.create(
                name=fake.name(),
                roll_no=_, 
                student_class=randint(1, 12),
                photo="Student-Management\screenshots\live search.png" 
            )
            student.subjects.set(subjects)
            student.save()

        # Generate subject scores
        students = Student.objects.all()
        for student in students:
            for subject in subjects:
                score = randint(40, 100)  
                SubjectScore.objects.create(student=student, subject=subject, score=score)

        self.stdout.write(self.style.SUCCESS("Data seeded successfully!"))
