from django.db import models
from django.core.validators import validate_comma_separated_integer_list
from multiselectfield import MultiSelectField

SDG_CHOICES = ((1, '1'),
               (2, '2'),
               (3, '3'),
               (4, '4'),
               (5, '5'),
               (6, '6'),
               (7, '7'),
               (8, '8'),
               (9, '9'),
               (10, '10'),
               (11, '11'),
               (12, '12'),
               (13, '13'),
               (14, '14'),
               (15, '15'),
               (16, '16'),
               (17, '17'),
               (18, 'ALL'))

LEVEL_CHOICES = (
    (1, 'Level 1 - on Couch, Individual action'),
    (2, 'Level 2 - at Home, Individual action'),
    (3, 'Level 3 - in Community, Individual action'),
    (4, 'Level 4 - at School and Workm Individual action'),
    (5, 'Level 5 - Organization action'),
    (6, 'Level 6 - Government action')
)

YNB_CHOICES = (
    (0, 'Individual'),
    (1, 'Organization'),
    (2, 'Both')
)

DIGITAL_CHOICES = (
    (0, 'YES'),
    (1, 'NO'),
)

INDU_CHOICES = (
    ("Agriculture forestry and fishing", 'Agriculture forestry and fishing'),
    ("Mining", 'Mining'),
    ("Manufacturing", 'Manufacturing'),
    ("Electricity gas water and waste services",
     'Electricity gas water and waste services'),
    ("Construction", 'Construction'),
    ("Wholesale and retail trade", 'Wholesale and retail trade'),
    ("Accommodation and food services", 'Accommodation and food services'),
    ("Transport postal and warehousing", 'Transport postal and warehousing'),
    ("Information media and telecommunications",
     'Information media and telecommunications'),
    ("Financial and insurance services", 'Financial and insurance services'),
    ("Rental hiring and real estate services",
     'Rental hiring and real estate services'),
    ("Professional services", 'Professional services'),
    ("Public administration and safety", 'Public administration and safety'),
    ("Education and training", 'Education and training'),
    ("Health care and social assistance", 'Health care and social assistance'),
    ("Arts and recreation services", 'Arts and recreation services'),
)


class ActionDb(models.Model):
    actions = models.CharField(db_column='Actions', max_length=255, blank=True, null=True, verbose_name='Action Title',
                               help_text='Warning: please check if there are similar items in the database.', error_messages={"unique": "The Action item you entered is not unique."})
    action_detail = models.TextField(
        db_column='Action detail', max_length=2048, blank=True, null=True, verbose_name='Action Detail')
    award = models.IntegerField(
        db_column='Award', blank=True, null=True, choices=YNB_CHOICES, verbose_name='Award')
    award_description = models.TextField(
        db_column='Award Descriptions', max_length=2048, blank=True, null=True, verbose_name='Award Description')
    # field_sdgs = MultiSelectField(db_column='field_sdgs', max_length=64, blank=True, null=True, validators=[validate_comma_separated_integer_list], default='', verbose_name='Related_SDGs', choices=SDG_CHOICES)
    sdgs = MultiSelectField(db_column=' SDGs', max_length=64, blank=True, null=True, validators=[
        validate_comma_separated_integer_list], default='', verbose_name='Related_SDGs', choices=SDG_CHOICES)
    # level = MultiSelectField(db_column='Level', max_length=100, blank=True, null=True, choices=LEVEL_CHOICES)
    level = models.IntegerField(
        db_column='Level', blank=True, null=True, choices=LEVEL_CHOICES)
    individual_organization = models.IntegerField(
        db_column='Individual/Organization', blank=True, null=True, choices=YNB_CHOICES, verbose_name='individual or organization')
    location = models.TextField(db_column='Location (specific actions/org onlyonly)',
                                max_length=200, blank=True, null=True, verbose_name='location')
    digital_actions = models.IntegerField(
        db_column='Digital actions', blank=True, null=True, choices=DIGITAL_CHOICES)
    related_industry = MultiSelectField(db_column='Related Industry', max_length=200, blank=True,
                                        null=True, verbose_name='Industry: (Tick up to 3 most relevant categories)', choices=INDU_CHOICES)
    sources = models.TextField(db_column='Source descriptions', blank=True, null=True,
                               verbose_name='Sources:', help_text='Description of the source, DO NOT PUT hyperlink.')
    links = models.TextField(db_column='Source Links', blank=True,
                             null=True, verbose_name='Links:', help_text='Hyperlink only')
    additional_notes = models.TextField(
        db_column='Additional Notes', blank=True, null=True)
    column15 = models.CharField(
        db_column='Column15', max_length=50, blank=True, null=True)
    id = models.BigAutoField(unique=True, primary_key=True)

    class Meta:
        managed = True
        db_table = 'action_db'
        verbose_name_plural = "Action Database"
        verbose_name = "Action item"

    def __str__(self):
        return f'({self.actions})'
