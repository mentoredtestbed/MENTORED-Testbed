from django.contrib.auth.middleware import RemoteUserMiddleware

class CustomHeaderMiddleware(RemoteUserMiddleware):
    header = 'HTTP_REMOTE_USER'
    # header = 'HTTPS_REMOTE_USER'

