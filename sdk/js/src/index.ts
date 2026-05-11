/**
 * OCY - JavaScript/TypeScript OCR SDK
 * Lightweight OCR for developer screenshots
 */

export interface OcyResult {
  text: string;
  confidence: number;
  latency_ms: number;
  model: string;
  chars_detected: number;
}

export interface OcyOptions {
  apiKey?: string;
}

let apiUrl: string | undefined;
let globalApiKey: string | undefined;

/**
 * Set a custom API URL for self-hosted instances
 */
export function setApiUrl(url: string): void {
  apiUrl = url;
}

/**
 * Set a global API key for authenticated requests
 */
export function setApiKey(key: string): void {
  globalApiKey = key;
}

/**
 * Extract text from an image URL
 */
export async function extractText(
  imageUrl: string,
  options?: OcyOptions
): Promise<OcyResult> {
  if (!apiUrl) {
    throw new Error("API URL not set. Call setApiUrl() first.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.apiKey) {
    headers["x-api-key"] = options.apiKey;
  } else if (globalApiKey) {
    headers["x-api-key"] = globalApiKey;
  }

  const response = await fetch(`${apiUrl}/api/extract`, {
    method: "POST",
    headers,
    body: JSON.stringify({ image_url: imageUrl }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Extract text from a browser File object
 */
export async function extractTextFromFile(
  file: File,
  options?: OcyOptions
): Promise<OcyResult> {
  // Upload to 0x0.st first
  const formData = new FormData();
  formData.append("file", file);

  const uploadResponse = await fetch("https://0x0.st", {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to 0x0.st");
  }

  const imageUrl = await uploadResponse.text();
  return extractText(imageUrl.trim(), options);
}

/**
 * React hook for using OCY
 */
export function useOcy() {
  return {
    extractText,
    extractTextFromFile,
  };
}

// Export default for convenience
export default {
  extractText,
  extractTextFromFile,
  setApiUrl,
  setApiKey,
  useOcy,
};