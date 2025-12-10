import sys
import os
import json
from urllib.parse import parse_qs

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import FastAPI app
from app.main import app

def handler(event, context):
    """
    Vercel serverless handler for FastAPI
    """
    try:
        # Extract request info from event
        path = event.get('path', '/')
        method = event.get('httpMethod', 'GET')
        headers = event.get('headers', {})
        query_string = event.get('queryStringParameters', {})
        body = event.get('body', '')

        # Build ASGI scope
        scope = {
            'type': 'http',
            'asgi': {'version': '3.0'},
            'http_version': '1.1',
            'method': method,
            'path': path,
            'query_string': '&'.join([f'{k}={v}' for k, v in query_string.items()]).encode(),
            'headers': [[k.encode(), v.encode()] for k, v in headers.items()],
            'server': ('localhost', 80),
        }

        # Response storage
        response_started = False
        status_code = 200
        response_headers = []
        response_body = []

        async def receive():
            return {
                'type': 'http.request',
                'body': body.encode() if isinstance(body, str) else body,
            }

        async def send(message):
            nonlocal response_started, status_code, response_headers, response_body

            if message['type'] == 'http.response.start':
                response_started = True
                status_code = message['status']
                response_headers = message.get('headers', [])
            elif message['type'] == 'http.response.body':
                response_body.append(message.get('body', b''))

        # Run FastAPI app
        import asyncio
        asyncio.run(app(scope, receive, send))

        # Build response
        headers_dict = {k.decode(): v.decode() for k, v in response_headers}
        body_bytes = b''.join(response_body)

        return {
            'statusCode': status_code,
            'headers': headers_dict,
            'body': body_bytes.decode('utf-8'),
        }

    except Exception as e:
        import traceback
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': str(e),
                'traceback': traceback.format_exc()
            })
        }
