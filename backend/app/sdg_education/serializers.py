from rest_framework import serializers
from .models import EducationDb


class EducationSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    class Meta:
        model = EducationDb
        fields = '__all__'
        extra_fields = ['type']
    def get_type(self, obj):
        return 'education'
