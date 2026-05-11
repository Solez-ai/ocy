![OCY](https://raw.githubusercontent.com/solez-ai/ocy/main/public/logo.png)

# OCY — OCR for Developers

[![npm version](https://img.shields.io/npm/v/ocy)](https://www.npmjs.com/package/ocy)
[![PyPI version](https://img.shields.io/pypi/v/ocy)](https://pypi.org/project/ocy/)
[![License](https://img.shields.io/github/license/solez-ai/ocy)](https://github.com/solez-ai/ocy/blob/main/LICENSE)

Lightweight OCR for developer screenshots — extract text from code images, terminal output, and IDE windows. One line of code.

**Made with care by Samin Yeasar • [github.com/solez-ai](https://github.com/solez-ai) • [x.com/Solez_None](https://x.com/Solez_None) • MIT License**

## Quick Start

```python
import ocy
ocy.set_api_url("https://your-api.vercel.app")
result = ocy.extract_text("https://example.com/code.png")
print(result["text"])
```

```javascript
const { extractText, setApiUrl } = require("ocy");
setApiUrl('https://your-api.vercel.app');
const result = await extractText("https://example.com/code.png");
console.log(result.text);
```

```java
Ocy.setApiUrl("https://your-api.vercel.app");
String text = Ocy.extractTextOnly("https://example.com/code.png");
System.out.println(text);
```

```cpp
ocy::setApiUrl("https://your-api.vercel.app");
auto result = ocy::extract("https://example.com/code.png");
cout << result.text << endl;
```

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌───────────┐
│   Python    │     │                  │     │             │     │           │
│   JavaScript│────▶│   Vercel API     │────▶│ ONNX Model  │────▶│ JSON Resp │
│   Java      │     │   (Serverless)   │     │ (Int8)      │     │           │
│   C++       │     │                  │     │             │     │           │
└─────────────┘     └──────────────────┘     └─────────────┘     └───────────┘
```

## Installation

### Python

```bash
pip install ocy
```

### JavaScript / TypeScript

```bash
npm install @solez-ai/ocy
```

### Java (Maven)

```xml
<dependency>
  <groupId>dev.ocy</groupId>
  <artifactId>ocy-java</artifactId>
  <version>1.0.0</version>
</dependency>
```

### C++

```bash
vcpkg install curl
# or: sudo apt install libcurl4-openssl-dev
```

Then include `ocy.hpp` and compile with `-lcurl`.

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/extract` | POST | Extract text from image URL |
| `/api/health` | GET | Check API health status |

### POST /api/extract

**Request:**

```json
{
  "image_url": "https://example.com/screenshot.png"
}
```

**Response:**

```json
{
  "text": "extracted text...",
  "confidence": 0.95,
  "latency_ms": 150,
  "model": "ocy-v1-int8",
  "chars_detected": 42
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Extracted text |
| `confidence` | float | Confidence score (0.0-1.0) |
| `latency_ms` | int | Processing time in milliseconds |
| `model` | string | Model identifier |
| `chars_detected` | int | Number of characters detected |

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request |
| 429 | Rate limit exceeded (100 req/hour free) |
| 502 | Failed to fetch image |
| 500 | Internal inference error |

## Self-hosting (Vercel)

### Prerequisites

- Node.js 18+
- Vercel account (free)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/solez-ai/ocy.git
   cd ocy
   ```

2. **Deploy to Vercel**

   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy
   vercel
   ```

   Or connect your GitHub repo to Vercel for automatic deployments.

3. **Use your API URL**

   After deployment, you'll get a URL like `https://your-project.vercel.app`

   ```python
   import ocy
   ocy.set_api_url("https://your-project.vercel.app")
   result = ocy.extract_text("https://example.com/screenshot.png")
   ```

## SDKs

- [Python SDK](sdk/python/README.md)
- [JavaScript/TypeScript SDK](sdk/js/README.md)
- [Java SDK](sdk/java/README.md)
- [C++ SDK](sdk/cpp/README.md)

## Rate Limits

Free tier: **100 requests per hour** per IP.

For higher limits, self-host or contact for enterprise pricing.

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License — see [LICENSE](LICENSE) for details.

## Links

- [GitHub](https://github.com/solez-ai/ocy)
- [npm package](https://www.npmjs.com/package/ocy)
- [PyPI package](https://pypi.org/project/ocy/)
- [Vercel](https://vercel.com)