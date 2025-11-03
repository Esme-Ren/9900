from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from .models import ActionDb
from .serializers import ActionSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .filters import ActionFilter
from rest_framework.pagination import PageNumberPagination

# API view to search for actions in general, returns 10


class ActionSearchView(generics.ListAPIView):
    """
    GET /api/sdg-actions/search/?q=<search_term>

    Returns list of first 10 Action records where the `actions` field contains the search term (case-insensitive)
    """
    serializer_class = ActionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Response becomes a list

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        queryset = ActionDb.objects.all()
        if query:
            queryset = queryset.filter(actions__icontains=query)
        # Return first 10 results
        return queryset[:10]

# API view to search for a specific action by ID


class ActionRetrieveView(generics.RetrieveAPIView):
    """
    GET /api/sdg-actions/retrieve/?q=<action_id>

    Returns the action record with the given ID.
    """
    serializer_class = ActionSerializer
    permission_classes = [permissions.AllowAny]
    queryset = ActionDb.objects.all()

    def get_object(self):
        action_id = self.request.query_params.get('q')
        if not action_id:
            raise NotFound("No action ID provided.")
        return get_object_or_404(self.get_queryset(), id=action_id)


class StandardResultsSetPagination(PageNumberPagination):
    page_size_query_param = 'per_page'

# API view to search for actions with filters


class ActionFilterSearchView(generics.ListAPIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    queryset = ActionDb.objects.all()
    serializer_class = ActionSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_class = ActionFilter
    pagination_class = StandardResultsSetPagination
