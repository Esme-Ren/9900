# Create your views here.
from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from .models import EducationDb
from .serializers import EducationSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .filters import EducationFilter
from rest_framework.pagination import PageNumberPagination


class EducationSearchView(generics.ListAPIView):
    """
    GET /api/education/search/?q=<search_term>

    Returns first 10 Education records where the `title` field contains the search term (case-insensitive)
    """
    serializer_class = EducationSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Response becomes a list

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        queryset = EducationDb.objects.all()
        if query:
            queryset = queryset.filter(title__icontains=query)
        # first 10 results
        return queryset[:10]


class EducationRetrieveView(generics.RetrieveAPIView):
    """
    GET /api/education/retrieve/?q=<education_id>

    Returns the education record with the given ID.
    """
    serializer_class = EducationSerializer
    permission_classes = [permissions.AllowAny]
    queryset = EducationDb.objects.all()

    def get_object(self):
        education_id = self.request.query_params.get('q')
        if not education_id:
            raise NotFound("No education ID provided.")
        return get_object_or_404(self.get_queryset(), id=education_id)


class StandardResultsSetPagination(PageNumberPagination):
    page_size_query_param = 'per_page'


class EducationFilterSearchView(generics.ListAPIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    queryset = EducationDb.objects.all()
    serializer_class = EducationSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_class = EducationFilter
    pagination_class = StandardResultsSetPagination
