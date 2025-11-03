from django.urls import path
from .views import ActionSearchView, ActionRetrieveView, ActionFilterSearchView

urlpatterns = [
    path('search/', ActionSearchView.as_view(), name='action-search'),
    path('filter-search/', ActionFilterSearchView.as_view(),
         name='action-filter-search'),
    path('retrieve/', ActionRetrieveView.as_view(), name='action-retrieve'),
]
