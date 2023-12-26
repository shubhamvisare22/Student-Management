from rest_framework import pagination


class CustomPagination(pagination.PageNumberPagination):
    """
    Custom pagination configuration for the API.

    Attributes:
    - `page_size`: The default number of items per page.
    - `page_size_query_param`: The query parameter name to set the number of items per page.
    - `max_page_size`: The maximum number of items per page that can be requested.
    """
    
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
