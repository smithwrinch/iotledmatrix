from django.db import models
from django.contrib.postgres.fields import ArrayField
from jsonfield import JSONField
# Create your models here.


# stores the data of matrix
class Matrix(models.Model):
    json = JSONField(default=list)
    timings = JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
