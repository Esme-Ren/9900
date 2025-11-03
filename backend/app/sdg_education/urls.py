from django.urls import path
from .views import EducationSearchView, EducationRetrieveView, EducationFilterSearchView

urlpatterns = [
    path('search/', EducationSearchView.as_view(), name='education-search'),
    path('filter-search/', EducationFilterSearchView.as_view(),
         name='education-filter-search'),
    path('retrieve/', EducationRetrieveView.as_view(),
         name='education-retrieve'),
]
