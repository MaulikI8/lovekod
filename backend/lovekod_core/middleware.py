class NoCacheAPIMiddleware:
    """
    Prevents browsers, devices, and intermediate proxies from caching dynamic API responses.
    Guarantees visitors and admins always receive real-time catalog and order data.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        path = request.path_info
        content_type = response.get('Content-Type', '')

        # Set no-cache on all API endpoints and JSON responses
        if (
            path.startswith('/api/')
            or path.startswith('/products/')
            or path.startswith('/categories/')
            or path.startswith('/site-settings/')
            or path.startswith('/festival-moments/')
            or path.startswith('/testimonials/')
            or path.startswith('/orders/')
            or 'application/json' in content_type
        ):
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
        return response
