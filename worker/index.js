/**
 * OCY - OCR API
 * Deploy to Vercel as a serverless function
 */

const VERSION = "1.0.0";
const MODEL_NAME = "ocy-v1-int8";

// Character set for CTC decoding
const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~ ';

// Rate limiting - simple in-memory (for Vercel Pro use Redis)
const rateLimitStore = new Map();
const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = 3600 * 1000; // 1 hour

function addCorsHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || (now - record.timestamp) > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

async function fetchImage(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  return response.arrayBuffer();
}

/**
 * Run OCR inference - simplified version
 * In production, integrate with actual ONNX model
 */
async function runInference(imageData) {
  const startTime = Date.now();

  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 50));

  // Return mock response for demonstration
  // In production, load and run actual ONNX model here
  return {
    text: "SAMPLE_CODE",
    confidence: 0.92,
    latency_ms: Date.now() - startTime + 50,
    model: MODEL_NAME,
    chars_detected: 11
  };
}

function generateLandingPage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OCY - OCR API</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d0d0d; color: #e5e5e5; line-height: 1.6; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; text-align: center; }
    .logo { width: 120px; margin-bottom: 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .subtitle { color: #888; margin-bottom: 2rem; }
    .endpoints { text-align: left; background: #1a1a1a; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; }
    .code-block { background: #1a1a1a; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; font-family: monospace; }
    pre { margin: 0; }
    code { color: #a5d6ff; }
    .comment { color: #6a737d; }
    .method { background: #7C3AED; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
    .path { color: #7C3AED; font-family: monospace; }
    .footer { color: #666; margin-top: 3rem; }
    .footer a { color: #7C3AED; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://raw.githubusercontent.com/solez-ai/ocy/main/public/logo.png" alt="OCY" class="logo">
    <h1>OCY — OCR API</h1>
    <p class="subtitle">Lightweight OCR for developer screenshots</p>

    <div class="endpoints">
      <p><span class="method">POST</span> <span class="path">/api/extract</span> — Extract text from image</p>
      <div class="code-block"><pre><span class="comment"># Request</span>
curl -X POST ${typeof window !== 'undefined' ? window.location.origin : ''}/api/extract \\
  -H "Content-Type: application/json" \\
  -d '{"image_url": "https://example.com/screenshot.png"}'</pre></div>

      <p><span class="method">GET</span> <span class="path">/api/health</span> — Health check</p>
      <div class="code-block"><pre>{<span class="comment">"status": "ok", "version": "1.0.0"</span>}</pre></div>
    </div>

    <div class="code-block"><pre><span class="comment"># Python</span>
<span class="string">import</span> ocy
result = ocy.extract_text(<span class="string">"url"</span>)

<span class="comment"># JavaScript</span>
<span class="string">const</span> { extractText } = <span class="string">require</span>(<span class="string">"ocy"</span>)

<span class="comment"># Java</span>
String text = Ocy.extractTextOnly(<span class="string">"url"</span>)

<span class="comment"># C++</span>
auto result = ocy::extract(<span class="string">"url"</span>)</pre></div>

    <div class="footer">
      <p>Made by <a href="https://github.com/solez-ai">Samin Yeasar</a> • <a href="https://x.com/Solez_None">@Solez_None</a></p>
      <p><a href="https://github.com/solez-ai/ocy">GitHub</a> • MIT License</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export default async function handler(req) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key'
      }
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // Rate limit check
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'Rate limit exceeded. Maximum 100 requests per hour.'
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  try {
    // Landing page
    if (path === '/' && req.method === 'GET') {
      return new Response(generateLandingPage(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Health endpoint
    if (path === '/api/health' && req.method === 'GET') {
      return addCorsHeaders(new Response(JSON.stringify({
        status: 'ok',
        version: VERSION,
        model: MODEL_NAME
      }), {
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // Extract endpoint
    if (path === '/api/extract' && req.method === 'POST') {
      let body;
      try {
        body = await req.json();
      } catch (e) {
        return addCorsHeaders(new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      const { image_url } = body;
      if (!image_url) {
        return addCorsHeaders(new Response(JSON.stringify({ error: 'Missing image_url field' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Validate URL
      try {
        new URL(image_url);
      } catch (e) {
        return addCorsHeaders(new Response(JSON.stringify({ error: 'Invalid image_url format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Fetch and process image
      try {
        const imageData = await fetchImage(image_url);
        const result = await runInference(imageData);
        return addCorsHeaders(new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        }));
      } catch (e) {
        return addCorsHeaders(new Response(JSON.stringify({ error: `Failed to process image: ${e.message}` }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    }

    // 404
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }));

  } catch (e) {
    return addCorsHeaders(new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}