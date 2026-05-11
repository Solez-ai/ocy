![OCY](https://raw.githubusercontent.com/solez-ai/ocy/main/public/logo.png)

# OCY - Python OCR SDK

Lightweight OCR for developer screenshots — extract text from code images, terminals, and IDE windows with one line of code.

**Made by Samin Yeasar • [github.com/solez-ai](https://github.com/solez-ai) • [x.com/Solez_None](https://x.com/Solez_None)**

## Installation

```bash
pip install ocy
```

## Quick Start

### 1. Set your API URL

First, set the API URL. You can use a self-hosted instance or a public one:

```python
import ocy

# Set your API URL (required)
ocy.set_api_url("https://your-api.vercel.app")
```

### 2. Extract text from a URL

```python
result = ocy.extract_text("https://example.com/screenshot.png")
print(result["text"])
print(f"Confidence: {result['confidence']:.1%}")
```

### 3. Extract text from a local file

```python
result = ocy.extract_text("./myScreenshot.png")
print(result["text"])
```

### 4. Async usage

```python
import asyncio
import ocy

async def main():
    result = await ocy.extract_text_async("https://example.com/code.png")
    print(result["text"])

asyncio.run(main())
```

### 5. Use an API key

```python
import ocy

# Option 1: Per-request key
result = ocy.extract_text("https://example.com/screenshot.png", api_key="your-key")

# Option 2: Set global key
ocy.set_api_key("your-key")
result = ocy.extract_text("https://example.com/screenshot.png")
```

## Response Format

```python
{
    "text": "extracted text from image...",
    "confidence": 0.95,        # 0.0 to 1.0
    "latency_ms": 150,         # processing time in milliseconds
    "model": "ocy-v1-int8",    # model identifier
    "chars_detected": 42       # number of characters detected
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `extract_text(img, api_key=None)` | Extract text synchronously |
| `extract_text_async(img, api_key=None)` | Extract text asynchronously |
| `set_api_url(url)` | Set custom API endpoint |
| `set_api_key(key)` | Set global API key |

## License

MIT License - See [LICENSE](https://github.com/solez-ai/ocy/blob/main/LICENSE) for details.