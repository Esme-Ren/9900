# filters.py
import django_filters
from django.db.models import Q
from .models import (
    EducationDb,
    SDG_CHOICES,
    TYPE_CHOICES,
    DISP_CHOICES,
    INDU_CHOICES,
    REGION_CHOICES,
)


class EducationFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(
        method="filter_search",
        label="Keyword"
    )

    institution = django_filters.CharFilter(
        field_name="organization",
        lookup_expr="icontains",
        label="Institution"
    )

    location = django_filters.ChoiceFilter(
        field_name="location",
        choices=REGION_CHOICES,
        label="Location"
    )

    discipline = django_filters.MultipleChoiceFilter(
        field_name="related_to_which_discipline",
        choices=DISP_CHOICES,
        method="filter_comma_list",
        label="Discipline"
    )

    industries = django_filters.MultipleChoiceFilter(
        field_name="useful_for_which_industries",
        choices=INDU_CHOICES,
        method="filter_comma_list",
        label="Industries"
    )

    educational_resources = django_filters.MultipleChoiceFilter(
        field_name="type_label",
        choices=TYPE_CHOICES,
        method="filter_comma_list",
        label="Resource Type"
    )

    sdgs = django_filters.MultipleChoiceFilter(
        field_name="sdgs_related",
        choices=SDG_CHOICES,
        method="filter_comma_list",
        label="SDG"
    )

    def filter_search(self, qs, name, value):
        """
        Simple keyword search across several text fields.
        """
        return qs.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(aims__icontains=value) |
            Q(learning_outcome__icontains=value)
        )

    def filter_comma_list(self, qs, name, values):
        """
        Matches any selected value in a comma-separated MultiSelectField.
        """
        q = Q()
        for v in values:
            pattern = rf"(^|,)\s*{v}\s*(,|$)"
            q |= Q(**{f"{name}__iregex": pattern})
        return qs.filter(q)

    class Meta:
        model = EducationDb
        fields = [
            'search',
            'institution',
            'location',
            'discipline',
            'industries',
            'educational_resources',
            'sdgs',
        ]
