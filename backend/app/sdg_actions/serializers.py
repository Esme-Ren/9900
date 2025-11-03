from rest_framework import serializers
from .models import ActionDb


class ActionSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    class Meta:
        model = ActionDb
        fields = '__all__'
        extra_fields = ['type']
    def get_type(self, obj):
        return 'action'
