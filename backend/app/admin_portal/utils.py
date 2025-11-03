from datetime import timedelta
from django.utils import timezone

#Helper function to filter between different time ranges for analytics
def time_range_filter(time_range):
    now = timezone.now()
    if time_range == "past day":
        return now - timedelta(days=1)
    elif time_range == "past week":
        return now - timedelta(weeks=1)
    elif time_range == "past month":
        return now - timedelta(days=30)
    elif time_range == "past 6 months":
        return now - timedelta(days=182)
    elif time_range == "past year":
        return now - timedelta(days=365)
    elif time_range == "past 5 years":
        return now - timedelta(days=1825)
    return None

#Map for different SDGs and their names
SDG_NAME_MAP = {
    "SDG 1": "No Poverty",
    "SDG 2": "Zero Hunger",
    "SDG 3": "Good Health and Well-being",
    "SDG 4": "Quality Education",
    "SDG 5": "Gender Equality",
    "SDG 6": "Clean Water and Sanitation",
    "SDG 7": "Affordable and Clean Energy",
    "SDG 8": "Decent Work and Economic Growth",
    "SDG 9": "Industry, Innovation and Infrastructure",
    "SDG 10": "Reduced Inequality",
    "SDG 11": "Sustainable Cities and Communities",
    "SDG 12": "Responsible Consumption and Production",
    "SDG 13": "Climate Action",
    "SDG 14": "Life Below Water",
    "SDG 15": "Life on Land",
    "SDG 16": "Peace, Justice and Strong Institutions",
    "SDG 17": "Partnerships for the Goals",
}

def get_sdg_name(code):
    SDG = 'SDG ' + code
    return SDG_NAME_MAP.get(SDG, "Unknown SDG")