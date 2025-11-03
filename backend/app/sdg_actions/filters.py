import django_filters
from django.db.models import Q
from .models import (
    ActionDb,
    LEVEL_CHOICES,
    YNB_CHOICES,
    DIGITAL_CHOICES,
    INDU_CHOICES,
)


class ActionFilter(django_filters.FilterSet):
    SDG_CHOICES = [(str(i), f"SDG {i}") for i in range(1, 18)]

    def filter_sdgs(self, qs, name, value):
        q = Q()
        for v in value:
            # regex to match the correct sdg number in a comma-separated list
            pattern = rf"(^|,)\s*{v}\s*(,|$)"
            q |= Q(**{f"{name}__iregex": pattern})
        return qs.filter(q)

    sdgs = django_filters.MultipleChoiceFilter(
        field_name='sdgs',
        choices=SDG_CHOICES,
        method='filter_sdgs',
        label="Related SDGs"
    )

    actions = django_filters.CharFilter(
        field_name='actions',
        lookup_expr='icontains',
        label="Search text"
    )

    level = django_filters.MultipleChoiceFilter(
        field_name='level',
        choices=[(str(k), v) for k, v in LEVEL_CHOICES],
        label="Level"
    )

    award = django_filters.ChoiceFilter(
        field_name='award',
        choices=[(str(k), v) for k, v in YNB_CHOICES],
        label="Award (Indiv/Org/Both)"
    )

    individual_organization = django_filters.ChoiceFilter(
        field_name='individual_organization',
        choices=[(str(k), v) for k, v in YNB_CHOICES],
        label="Individual vs Organization"
    )

    digital_actions = django_filters.ChoiceFilter(
        field_name='digital_actions',
        choices=[(str(k), v) for k, v in DIGITAL_CHOICES],
        label="Digital Action?"
    )

    related_industry = django_filters.MultipleChoiceFilter(
        field_name='related_industry',
        choices=[(c[0], c[1]) for c in INDU_CHOICES],
        label="Industry"
    )

    class Meta:
        model = ActionDb
        fields = [
            'actions',
            'sdgs',
            'level',
            'award',
            'individual_organization',
            'digital_actions',
            'related_industry',
        ]
