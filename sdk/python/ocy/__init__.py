"""
OCY - Lightweight OCR SDK for Python
Extract text from developer screenshots with one line of code.
"""

import asyncio
import os
import httpx
from typing import Union, Optional

__version__ = "1.0.0"

# API configuration - must be set by user
_api_url: Optional[str] = None
_api_key: Optional[str] = None


def set_api_url(url: str) -> None:
    """Set a custom API URL for self-hosted instances."""
    global _api_url
    _api_url = url


def set_api_key(key: str) -> None:
    """Set the API key for authenticated requests."""
    global _api_key
    _api_key = key


def _upload_to_0x0(file_path: str) -> str:
    """Upload a file to 0x0.st and return the URL."""
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f, 'application/octet-stream')}
        response = httpx.post('https://0x0.st', files=files)
        response.raise_for_status()
        return response.text.strip()


def _upload_bytes_to_0x0(data: bytes, filename: str = 'image.png') -> str:
    """Upload raw bytes to 0x0.st and return the URL."""
    files = {'file': (filename, data, 'application/octet-stream')}
    response = httpx.post('https://0x0.st', files=files)
    response.raise_for_status()
    return response.text.strip()


def extract_text(
    img: Union[str, bytes],
    api_key: Optional[str] = None
) -> dict:
    """
    Extract text from an image.

    Args:
        img: Image can be a URL string, local file path, or raw bytes
        api_key: Optional API key for authenticated requests

    Returns:
        dict with keys: text, confidence, latency_ms, model, chars_detected

    Example:
        >>> import ocy
        >>> result = ocy.extract_text("https://example.com/screenshot.png")
        >>> print(result['text'])
    """
    global _api_key

    if not _api_url:
        raise ValueError("API URL not set. Call set_api_url() first or set OCY_API_URL environment variable.")

    # Determine image URL
    image_url = img

    if isinstance(img, str):
        # Check if it's a local file path
        if not img.startswith(('http://', 'https://')):
            if os.path.isfile(img):
                image_url = _upload_to_0x0(img)
            else:
                raise ValueError(f"Invalid URL or file path: {img}")
    elif isinstance(img, bytes):
        image_url = _upload_bytes_to_0x0(img)
    else:
        raise TypeError("img must be a URL string, file path, or bytes")

    # Build request
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key
    elif _api_key:
        headers["x-api-key"] = _api_key

    # Make request
    with httpx.Client(timeout=30.0) as client:
        response = client.post(
            f"{_api_url}/api/extract",
            json={"image_url": image_url},
            headers=headers
        )
        response.raise_for_status()
        return response.json()


async def extract_text_async(
    img: Union[str, bytes],
    api_key: Optional[str] = None
) -> dict:
    """
    Async version of extract_text for use with asyncio.

    Args:
        img: Image can be a URL string, local file path, or raw bytes
        api_key: Optional API key for authenticated requests

    Returns:
        dict with keys: text, confidence, latency_ms, model, chars_detected
    """
    global _api_key

    if not _api_url:
        raise ValueError("API URL not set. Call set_api_url() first or set OCY_API_URL environment variable.")

    # Determine image URL
    image_url = img

    if isinstance(img, str):
        if not img.startswith(('http://', 'https://')):
            if os.path.isfile(img):
                async with httpx.AsyncClient() as client:
                    with open(img, 'rb') as f:
                        files = {'file': (os.path.basename(img), f, 'application/octet-stream')}
                        response = await client.post('https://0x0.st', files=files)
                        response.raise_for_status()
                        image_url = response.text.strip()
            else:
                raise ValueError(f"Invalid URL or file path: {img}")
    elif isinstance(img, bytes):
        async with httpx.AsyncClient() as client:
            files = {'file': ('image.png', img, 'application/octet-stream')}
            response = await client.post('https://0x0.st', files=files)
            response.raise_for_status()
            image_url = response.text.strip()
    else:
        raise TypeError("img must be a URL string, file path, or bytes")

    # Build request
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key
    elif _api_key:
        headers["x-api-key"] = _api_key

    # Make async request
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{_api_url}/api/extract",
            json={"image_url": image_url},
            headers=headers
        )
        response.raise_for_status()
        return response.json()