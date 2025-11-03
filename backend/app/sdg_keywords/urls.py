from django.urls import path
from .views import KeywordListCreateView, KeywordRetrieveUpdateDestroyView

urlpatterns = [
    path('keywords/', KeywordListCreateView.as_view(), name='keyword-list-create'),
    path('keywords/<int:pk>/', KeywordRetrieveUpdateDestroyView.as_view(), name='keyword-detail'),
]
