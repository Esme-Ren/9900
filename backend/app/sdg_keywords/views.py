from rest_framework import generics, filters
from .models import Keyword
from .serializers import KeywordSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class KeywordListCreateView(generics.ListCreateAPIView):
    queryset = Keyword.objects.all().order_by('-updated_at')
    serializer_class = KeywordSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['keyword', 'sdggoal', 'target', 'reference1', 'reference2', 'note']
    ordering_fields = ['created_at', 'updated_at', 'keyword', 'sdggoal', 'target']

class KeywordRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Keyword.objects.all()
    serializer_class = KeywordSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
