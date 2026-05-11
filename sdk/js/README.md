![OCY](https://raw.githubusercontent.com/solez-ai/ocy/main/public/logo.png)

# OCY - JavaScript/TypeScript OCR SDK

Lightweight OCR for developer screenshots — extract text from code images, terminals, and IDE windows.

**Made by Samin Yeasar • [github.com/solez-ai](https://github.com/solez-ai) • [x.com/Solez_None](https://x.com/Solez_None)**

## Installation

```bash
npm install ocy
```

## Usage

### Node.js

```javascript
const { extractText } = require('ocy');

async function main() {
  const result = await extractText('https://example.com/screenshot.png');
  console.log(result.text);
  console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
}

main();
```

### TypeScript

```typescript
import { extractText, OcyResult } from 'ocy';

const result: OcyResult = await extractText('https://example.com/code.png');
console.log(result.text);
console.log(`Latency: ${result.latency_ms}ms`);
```

### React Component

```tsx
import { useOcy } from 'ocy';

function ImageUploader() {
  const { extractText, extractTextFromFile } = useOcy();

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await extractTextFromFile(file);
      console.log(result.text);
    }
  };

  return <input type="file" onChange={handleFile} accept="image/*" />;
}
```

### Browser (direct fetch)

```html
<script type="module">
  const apiUrl = 'https://ocy-api.samin.workers.dev';

  async function extract(imageUrl) {
    const response = await fetch(`${apiUrl}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl })
    });
    const result = await response.json();
    console.log(result.text);
  }

  extract('https://example.com/screenshot.png');
</script>
```

## Configuration

### Custom API URL

```javascript
const { setApiUrl, extractText } = require('ocy');

setApiUrl('https://your-custom-worker.workers.dev');
const result = await extractText('https://example.com/screenshot.png');
```

### API Key

```javascript
const { setApiKey, extractText } = require('ocy');

setApiKey('your-api-key');
// Or per-request:
const result = await extractText('url', { apiKey: 'your-key' });
```

## API Reference

| Function | Description |
|----------|-------------|
| `extractText(imageUrl, options?)` | Extract text from URL |
| `extractTextFromFile(file, options?)` | Extract from browser File |
| `setApiUrl(url)` | Set custom API endpoint |
| `setApiKey(key)` | Set global API key |
| `useOcy()` | React hook |

## Response Format

```typescript
interface OcyResult {
  text: string;
  confidence: number;      // 0.0 to 1.0
  latency_ms: number;      // processing time in ms
  model: string;           // "ocy-v1-int8"
  chars_detected: number;   // character count
}
```

## License

MIT License - See [LICENSE](https://github.com/solez-ai/ocy/blob/main/LICENSE) for details.