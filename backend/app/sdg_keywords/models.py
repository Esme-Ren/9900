from django.db import models

class Keyword(models.Model):
    keyword = models.CharField(max_length=200)
    sdggoal = models.CharField(max_length=20)
    target = models.CharField(max_length=50)
    reference1 = models.CharField(max_length=300, blank=True)
    reference2 = models.CharField(max_length=300, blank=True)
    note = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.keyword} ({self.sdggoal}-{self.target})'
