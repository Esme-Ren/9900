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

TYPE_CHOICES = (("Undergraduate course", "Undergraduate course"),
                ("Postgraduate course", "Postgraduate course"),
                ("Initiative", "Initiative"),
                ("Event", "Event"),
                ("Seminar", "Seminar"),
                ("Undergraduate program", "Undergraduate program"),
                ("Postgraduate program", "Postgraduate program"),
                ("Practicum online course", "Practicum online course"),
                ("MOOC", "MOOC"),
                ("Case study", "Case study"),
                ("Report", "Report"),
                ("Blog", "Blog"),
                ("Edu Tool", "Edu Tool"),
                ("Simulation", "Simulation"),
                ("Game", "Game"),
                ("VR video", "VR video"),
                ("Film", "Film"),
                ("Contest", "Contest"))

DISP_CHOICES = (("Architecture and Building", "Architecture and Building (Architecture, City Planning, Industrial Design, Landscape Architecture)"),
                ("Business and Management",
                "Business and Management (Actuarial Studies, Business, Commerce, Finance, Property and Development)"),
                ("Creative Arts", "Creative Arts (Art, Music, Design, Media)"),
                ("Education", "Education"),
                ("Engineering and Related Technologies",
                "Engineering and Related Technologies (Aerospace, Aviation, Civil, Electricity, Materials, Mechanics, Biomedical Engineering, Food, Mining)"),
                ("Environmental and Related Studies",
                "Environmental and Related Studies (Environmental Management)"),
                ("Health", "Health (Medicine, Nutrition, Psychology, Mental health, Ophthalmology, Public health)"),
                ("Humanities and Law", "Humanities and Law (Art-culture, Criminology, Economics, Humanities, Law, Language Studies, aborigines, Social Sciences, Politics, Sociology, Philosophy, Tax)"),
                ("Information Technology", "Information Technology "),
                ("Natural and Physical Sciences",
                "Natural and Physical Sciences (Mathematics, Physics, Biology, Chemistry, Life sciences, Sciences)"),
                ("All", "All"))

"""
REGION_CHOICES=(("Global", "Global"),
                ("Australia", "Australia"),
                ("Austria", "Austria"),
                ("Brazil", "Brazil"),
                ("Canada", "Canada"),
                ("China Mainland", "China Mainland"),
                ("European Union", "European Union"),
                ("Malaysia", "Malaysia"),
                ("Mexico", "Mexico"),
                ("New Zealand", "New Zealand"),
                ("Russia", "Russia"),
                ("Spain", "Spain"),
                ("United Kingdom", "United Kingdom"),
                ("United States", "United States"),
                ("Hong Kong SAR", "Hong Kong SAR"),
                ("Taiwan ROC", "Taiwan ROC"),
                ("Sweden", "Sweden"),
                ("Switzerland", "Switzerland"),
                ("India", "India"),
                ("Ireland", "Ireland"),
                ("Italy", "Italy"))
"""

REGION_CHOICES = (("Australia", "Australia"),
                  ("Austria", "Austria"),
                  ("Brazil", "Brazil"),
                  ("Canada", "Canada"),
                  ("China Mainland", "China Mainland"),
                  ("European Union", "European Union"),
                  ("India", "India"),
                  ("Ireland", "Ireland"),
                  ("Italy", "Italy"),
                  ("Malaysia", "Malaysia"),
                  ("Mexico", "Mexico"),
                  ("New Zealand", "New Zealand"),
                  ("Russia", "Russia"),
                  ("Spain", "Spain"),
                  ("Sweden", "Sweden"),
                  ("Switzerland", "Switzerland"),
                  ("Taiwan ROC", "Taiwan ROC"),
                  ("United Kingdom", "United Kingdom"),
                  ("United States", "United States"),
                  ("Global", "Global"))


INDU_CHOICES = (("Agriculture forestry and fishing", "Agriculture forestry and fishing"),
                ("Mining", "Mining"),
                ("Manufacturing", "Manufacturing"),
                ("Electricity gas water and waste services",
                "Electricity gas water and waste services"),
                ("Construction", "Construction"),
                ("Wholesale and retail trade", "Wholesale and retail trade"),
                ("Accommodation and food services",
                "Accommodation and food services"),
                ("Transport postal and warehousing",
                "Transport postal and warehousing"),
                ("Information media and telecommunications",
                "Information media and telecommunications"),
                ("Financial and insurance services",
                "Financial and insurance services"),
                ("Rental hiring and real estate services",
                "Rental hiring and real estate services"),
                ("Professional services", "Professional services"),
                ("Public administration and safety",
                "Public administration and safety"),
                ("Education and training", "Education and training"),
                ("Health care and social assistance",
                "Health care and social assistance"),
                ("Arts and recreation services", "Arts and recreation services"))


class EducationDb(models.Model):
    title = models.TextField(db_column='Title', blank=True, null=True)
    description = models.TextField(
        db_column='Description', blank=True, null=True)
    aims = models.TextField(db_column='Aims', blank=True, null=True)
    sdgs_related = MultiSelectField(db_column='SDGs related', max_length=100, blank=True, null=True, validators=[
                                    validate_comma_separated_integer_list], default='', verbose_name='Related_SDGs', choices=SDG_CHOICES)
    learning_outcome = models.TextField(
        db_column='Learning outcome( Expecting outcome)', blank=True, null=True)
    type_label = MultiSelectField(db_column='Type label', blank=True, null=True,
                                  verbose_name="Type: (Tick up to 3 most relevant categories)", choices=TYPE_CHOICES, max_length=100)
    # location = models.TextField(db_column='Country/Region', blank=True, null=True, choices=REGION_CHOICES)
    location = models.TextField(
        db_column='Location', blank=True, null=True, choices=REGION_CHOICES)
    organization = models.TextField(
        db_column='Organization', blank=True, null=True)
    year = models.CharField(
        db_column='Year', max_length=50, blank=True, null=True)
    related_to_which_discipline = MultiSelectField(db_column='Related to which discipline', blank=True, null=True,
                                                   verbose_name="Related to which discipline: (Tick up to 3 most relevant categories)", choices=DISP_CHOICES, max_length=1500)
    useful_for_which_industries = MultiSelectField(db_column='Useful for which industries', blank=True, null=True,
                                                   verbose_name="Useful for which industries: (Tick up to 3 most relevant categories)", choices=INDU_CHOICES, max_length=1500)
    sources = models.TextField(db_column='Source', blank=True, null=True)
    links = models.TextField(db_column='Link', blank=True, null=True)
    descriptions = models.TextField(
        db_column='descriptions', blank=True, null=True)
    column14 = models.IntegerField(db_column='Column14', blank=True, null=True)
    column15 = models.CharField(
        db_column='Column15', max_length=50, blank=True, null=True)
    column16 = models.CharField(
        db_column='Column16', max_length=50, blank=True, null=True)
    id = models.BigAutoField(unique=True, primary_key=True)

    class Meta:
        managed = True
        db_table = 'education_db'
        verbose_name_plural = "Education Database"
        verbose_name = "Education item"
