# sdg_education/urls.py

from django.urls import path
from .views import mock_endpoint

urlpatterns = [
    path('specificmock', mock_endpoint, name='mock-endpoint'),
]
