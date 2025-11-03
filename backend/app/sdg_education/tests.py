from .models import EducationDb
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from multiselectfield.db.fields import MultiSelectField
MultiSelectField.flatchoices = property(lambda self: self.choices)


class EducationSearchAPITestCase(APITestCase):
    def setUp(self):
        EducationDb.objects.create(
            id=1,
            title="Sir Rupert Myers Sustainability Award",
            aims="",
            sdgs_related=["4", "12", "17"],
            learning_outcome="",
            type_label="Event",
            location="Australia",
            organization="UNSW",
            year="2022",
            related_to_which_discipline=["Business and Management"],
            useful_for_which_industries=["Apply to all organizations"],
            sources="Alumni&Giving(UNSW)",
            links="https://alumni.unsw.edu.au/donate-10x",
            descriptions="The award has been established ..."
        )
        EducationDb.objects.create(
            id=2,
            title="World’s top universities unite to tackle climate change",
            aims="The network is united by their dedication to producing critical climate research...",
            sdgs_related=["9", "10", "11", "12", "13", "14", "15"],
            learning_outcome="The Climate Alliance will make university-led, high quality climate research accessible...",
            type_label="Initiative",
            location="Australia",
            organization="UNSW",
            year="2020",
            related_to_which_discipline=[
                "Education", "Information technology", "Environmental and Related Studies"
            ],
            useful_for_which_industries=["Education and training"],
            sources="Innovation Community(UNSW)",
            links="https://www.enterprise.unsw.edu.au/index.php/news/worlds-top-universities-unite-tackle-climate-change",
            descriptions="UNSW Sydney is facilitating the establishment ..."
        )
        EducationDb.objects.create(
            id=3,
            title="Developing Coursework and Supplementary Activities",
            aims="The course aims to familiarize students with the contents and implementation of five global agreements...",
            sdgs_related=["2", "8", "10", "11", "12", "13", "14", "15"],
            learning_outcome="Students will understand the importance of the SDGs ...",
            type_label="Undergraduate course",
            location="United States",
            organization="University of Pennsylvania",
            year="2019",
            related_to_which_discipline=[
                "Architecture and Building", "Humanities and Law", "Environmental and Related Studies"
            ],
            useful_for_which_industries=["Professional services"],
            sources="Accelerating Education for the SDGs in Universities(SDSN)",
            links="https://ap-unsdsn.org/regional-initiatives/universities-sdgs/education-for-sdgs-guide/",
            descriptions="This case describes a graduate level course ..."
        )
        EducationDb.objects.create(
            id=4,
            title="Honey Bee Initiative",
            aims="The Honey Bee Initiative exemplifies how sustainable beekeeping empowers communities...",
            sdgs_related=["2", "3", "5", "10"],
            learning_outcome="Our Colombia project growth from 20 to 160 families...",
            type_label="Initiative",
            location="United States",
            organization="George Mason University",
            year="2013",
            related_to_which_discipline=["Natural and Physical Sciences"],
            useful_for_which_industries=["Professional services"],
            sources="Accelerating Education for the SDGs in Universities(SDSN)",
            links="https://ap-unsdsn.org/regional-initiatives/universities-sdgs/education-for-sdgs-guide/",
            descriptions="The initiative uses shared value and sustainable development goals ..."
        )

        self.list_url = reverse('education-filter-search')

    def test_no_filters_returns_all(self):
        resp = self.client.get(self.list_url, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        data = resp.data
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 4)

    def test_search_keyword_filter(self):
        resp = self.client.get(
            self.list_url, {'search': 'Climate'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        data = resp.data
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertIn('climate', data[0]['title'].lower())

    def test_filter_by_single_sdg(self):
        resp = self.client.get(
            self.list_url, {'sdgs': ['4']}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        data = resp.data
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertIn('4', data[0]['sdgs_related'])

    def test_filter_by_multiple_sdgs(self):
        resp = self.client.get(
            self.list_url, {'sdgs': ['12', '15']}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        data = resp.data
        self.assertIsInstance(data, list)
        titles = sorted(item['title'] for item in data)
        expected = sorted([
            "Sir Rupert Myers Sustainability Award",
            "World’s top universities unite to tackle climate change",
            "Developing Coursework and Supplementary Activities",
        ])
        self.assertEqual(titles, expected)

    def test_filter_by_location(self):
        resp = self.client.get(
            self.list_url,
            {'location': 'United States'},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        data = resp.data
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)

    def test_pagination(self):
        resp = self.client.get(
            self.list_url, {'page': 1, 'per_page': 2}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        page_data = resp.data
        self.assertIsInstance(page_data, dict)
        self.assertEqual(page_data['count'], 4)
        self.assertEqual(len(page_data['results']), 2)

        resp2 = self.client.get(
            self.list_url, {'page': 2, 'per_page': 2}, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)

        page2 = resp2.data
        self.assertIsInstance(page2, dict)
        self.assertEqual(page2['count'], 4)
        self.assertEqual(len(page2['results']), 2)

        ids1 = {item['id'] for item in page_data['results']}
        ids2 = {item['id'] for item in page2['results']}
        self.assertTrue(ids1.isdisjoint(ids2))
