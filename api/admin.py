from django.contrib import admin
from .models import Student, Subject, SubjectScore

"""
Registers models with the Django admin for management and interaction via the admin interface.
"""

admin.site.register(Student)
admin.site.register(Subject)
admin.site.register(SubjectScore)