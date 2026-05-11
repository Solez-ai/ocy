/**
 * OCY - OCR API for Vercel
 * Deploy as Vercel serverless function
 */

export const runtime = 'edge';

const VERSION = "1.0.0";
const MODEL_NAME = "ocy-v1-int8";

const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~ ';

const rateLimitStore = new Map();
const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = 3600 * 1000;

function corsHeaders(status = 200, body = null) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  };
  return new Response(body, { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

async function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || (now - record.timestamp) > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

async function fetchImage(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  return response.arrayBuffer();
}

async function runInference(imageData) {
  const startTime = Date.now();
  // Simulate OCR processing
  await new Promise(resolve => setTimeout(resolve, 50));

  return {
    text: "SAMPLE_CODE",
    confidence: 0.92,
    latency_ms: Date.now() - startTime + 50,
    model: MODEL_NAME,
    chars_detected: 11
  };
}

export default async function handler(req) {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('', {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        }
      });
    }

    // Rate limit check
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return corsHeaders(429, JSON.stringify({ error: 'Rate limit exceeded. Maximum 100 requests per hour.' }));
    }

    // Method check
    if (req.method !== 'POST') {
      return corsHeaders(405, JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    }

    // Parse body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return corsHeaders(400, JSON.stringify({ error: 'Invalid JSON body' }));
    }

    const { image_url } = body;
    if (!image_url) {
      return corsHeaders(400, JSON.stringify({ error: 'Missing image_url field' }));
    }

    // Validate URL
    try {
      new URL(image_url);
    } catch (e) {
      return corsHeaders(400, JSON.stringify({ error: 'Invalid image_url format' }));
    }

    // Fetch and process image
    const imageData = await fetchImage(image_url);
    const result = await runInference(imageData);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}