
from .models import ActionDb
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from multiselectfield.db.fields import MultiSelectField

MultiSelectField.flatchoices = property(lambda self: self.choices)


class SdgActionSearchAPITestCase(APITestCase):
    def setUp(self):
        ActionDb.objects.create(
            id=1,
            actions="Get rid of paper bank statements",
            action_detail="Stop paper bank statements and pay your bills online or via mobile.",
            award=0,
            award_description="",
            sdgs=["15"],
            level=1,
            individual_organization=0,
            location="",
            digital_actions=1,
            related_industry=[],
            sources="The Lazy Person’s Guide to Saving the World (United Nations)",
            links="https://www.un.org/sustainabledevelopment/takeaction/",
            additional_notes="Add by Jessie Tang",
            column15=""
        )

        ActionDb.objects.create(
            id=2,
            actions="Share interesting social media posts about women’s rights or climate change",
            action_detail="Share, don’t just like. If you see an interesting social media post about women’s rights or climate change, share it so folks in your network see it too.",
            award=0,
            award_description="",
            sdgs=["5", "13"],
            level=1,
            individual_organization=0,
            location="",
            digital_actions=1,
            related_industry=[],
            sources="The Lazy Person’s Guide to Saving the World (United Nations)",
            links="https://www.un.org/sustainabledevelopment/takeaction/",
            additional_notes="Add by Jessie Tang",
            column15=""
        )

        ActionDb.objects.create(
            id=3,
            actions="Report online bullies",
            action_detail="Report online bullies. If you notice harassment on a message board or in a chat room, flag that person.",
            award=0,
            award_description="",
            sdgs=["10"],
            level=1,
            individual_organization=0,
            location="",
            digital_actions=1,
            related_industry=[],
            sources="The Lazy Person’s Guide to Saving the World (United Nations)",
            links="https://www.un.org/sustainabledevelopment/takeaction/",
            additional_notes="Add by Jessie Tang",
            column15=""
        )

        ActionDb.objects.create(
            id=4,
            actions="Stay informed",
            action_detail="Stay informed. Follow your local news and stay in touch with the Global Goals online or on social media at @GlobalGoalsUN.",
            award=0,
            award_description="",
            sdgs=["18"],
            level=1,
            individual_organization=0,
            location="",
            digital_actions=1,
            related_industry=[],
            sources="The Lazy Person’s Guide to Saving the World (United Nations)",
            links="https://www.un.org/sustainabledevelopment/takeaction/",
            additional_notes="Add by Jessie Tang",
            column15=""
        )

        ActionDb.objects.create(
            id=5,
            actions="Sharing your SDG actions",
            action_detail="Tell us about your actions to achieve the global goals by using the hashtag #globalgoals on social networks.",
            award=0,
            award_description="",
            sdgs=["18"],
            level=1,
            individual_organization=0,
            location="",
            digital_actions=1,
            related_industry=[],
            sources="The Lazy Person’s Guide to Saving the World (United Nations)",
            links="https://www.un.org/sustainabledevelopment/takeaction/",
            additional_notes="Add by Jessie Tang",
            column15=""
        )

        ActionDb.objects.create(
            id=6,
            actions="Investigate use of the Hunters Hill Connect app",
            action_detail="Investigate use of the Hunters Hill Connect app to increase social\ncohesion and support people who may be socially isolated to get\nassistance when they need it.",
            award=0,
            award_description="",
            sdgs=["11"],
            level=2,
            individual_organization=0,
            location="Australia",
            digital_actions=1,
            related_industry=[],
            sources="Climate Resilience Plan (Lane Cove Council)",
            links="https://www.lanecove.nsw.gov.au/.../ClimateResilience.aspx",
            additional_notes="Add by Ryan Su",
            column15=""
        )

        ActionDb.objects.create(
            id=7,
            actions="Turn off electrical appliances",
            action_detail="Save electricity by plugging appliances into a power strip and turning them off completely when not in use, including your computer.",
            award=0,
            award_description="",
            sdgs=["11", "12"],
            level=1,
            individual_organization=0,
            location="",
            digital_actions=1,
            related_industry=[],
            sources="The Lazy Person’s Guide to Saving the World (United Nations)",
            links="https://www.un.org/sustainabledevelopment/takeaction/",
            additional_notes="Add by Jessie Tang",
            column15=""
        )

        ActionDb.objects.create(
            id=8,
            actions="Show support for the Paris Agreement",
            action_detail="Speak up! Ask your local and national authorities to engage in initiatives that don’t harm people or the planet. You can also voice your support for the Paris Agreement and ask your country to ratify it or sign it if it hasn’t yet.",
            award=0,
            award_description="",
            sdgs=["13", "14"],
            level=1,
            individual_organization=0,
            location="",
            digital_actions=1,
            related_industry=[],
            sources="The Lazy Person’s Guide to Saving the World (United Nations)",
            links="https://www.un.org/sustainabledevelopment/takeaction/",
            additional_notes="Add by Jessie Tang",
            column15=""
        )

        self.list_url = reverse('action-filter-search')

    def test_no_filters_returns_all(self):
        resp = self.client.get(self.list_url, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.data
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 8)

    def test_search_keyword_filter(self):
        resp = self.client.get(
            self.list_url, {'actions': 'climate'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.data
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertIn('climate', data[0]['actions'].lower())

    def test_filter_by_single_sdg(self):
        resp = self.client.get(self.list_url, {'sdgs': ['15']}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.data
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['sdgs'], 15)

    def test_filter_by_level(self):
        resp = self.client.get(
            self.list_url, {'level': '1'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.data
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 7)

    def test_pagination(self):
        resp1 = self.client.get(
            self.list_url, {'page': 1, 'per_page': 3}, format='json')
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)
        page1 = resp1.data
        self.assertIsInstance(page1, dict)
        self.assertEqual(page1['count'], 8)
        self.assertEqual(len(page1['results']), 3)

        resp2 = self.client.get(
            self.list_url, {'page': 2, 'per_page': 3}, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        page2 = resp2.data
        self.assertIsInstance(page2, dict)
        self.assertEqual(page2['count'], 8)
        self.assertEqual(len(page2['results']), 3)

        ids1 = {i['id'] for i in page1['results']}
        ids2 = {i['id'] for i in page2['results']}
        self.assertTrue(ids1.isdisjoint(ids2))
