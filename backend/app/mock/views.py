from django.http import JsonResponse


def mock_endpoint(request):
    data = {
        "message": "This is a mock endpoint",
        "status": "success",
        "data": {
            "key": "value"
        }
    }
    return JsonResponse(data)
