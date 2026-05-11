package dev.ocy;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * OCY - Java OCR SDK
 * Lightweight OCR for developer screenshots
 */
public class Ocy {
    private static String API_URL = null;
    private static String API_KEY = null;

    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    /**
     * Set a custom API URL for self-hosted instances
     */
    public static void setApiUrl(String url) {
        API_URL = url;
    }

    /**
     * Set a global API key for authenticated requests
     */
    public static void setApiKey(String key) {
        API_KEY = key;
    }

    /**
     * Extract text from an image URL
     */
    public static String extractText(String imageUrl) throws java.io.IOException {
        return extractText(imageUrl, null);
    }

    /**
     * Extract text from an image URL with API key
     */
    public static String extractText(String imageUrl, String apiKey) throws java.io.IOException {
        if (API_URL == null) {
            throw new IllegalStateException("API URL not set. Call setApiUrl() first.");
        }

        String requestBody = String.format("{\"image_url\":\"%s\"}", imageUrl.replace("\"", "\\\""));

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + "/api/extract"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody));

        if (apiKey != null && !apiKey.isEmpty()) {
            requestBuilder.header("x-api-key", apiKey);
        } else if (API_KEY != null && !API_KEY.isEmpty()) {
            requestBuilder.header("x-api-key", API_KEY);
        }

        HttpRequest request = requestBuilder.build();

        try {
            HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new java.io.IOException("API request failed with status: " + response.statusCode());
            }

            return response.body();
        } catch (java.net.http.HttpTimeoutException e) {
            throw new java.io.IOException("Request timed out", e);
        } catch (java.net.http.HttpRequestException e) {
            throw new java.io.IOException("Request failed: " + e.getMessage(), e);
        }
    }

    /**
     * Convenience method to extract just the text (parses "text" field from JSON)
     */
    public static String extractTextOnly(String imageUrl) throws java.io.IOException {
        return extractTextOnly(imageUrl, null);
    }

    /**
     * Convenience method to extract just the text with API key
     */
    public static String extractTextOnly(String imageUrl, String apiKey) throws java.io.IOException {
        String json = extractText(imageUrl, apiKey);
        return parseTextFromJson(json);
    }

    /**
     * Parse the "text" field from JSON response using basic string operations
     */
    private static String parseTextFromJson(String json) {
        // Simple JSON parsing without external libraries
        String key = "\"text\":\"";
        int start = json.indexOf(key);
        if (start == -1) {
            key = "\"text\": \"";
            start = json.indexOf(key);
        }
        if (start == -1) {
            return json; // Return raw if parsing fails
        }

        start += key.length();
        int end = json.indexOf("\"", start);

        if (end == -1) {
            return json;
        }

        String text = json.substring(start, end);

        // Handle escaped characters
        text = text.replace("\\\"", "\"");
        text = text.replace("\\\\", "\\");
        text = text.replace("\\n", "\n");
        text = text.replace("\\t", "\t");

        return text;
    }

    /**
     * Get API health status
     */
    public static String health() throws java.io.IOException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + "/api/health"))
                .GET()
                .build();

        try {
            HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (Exception e) {
            throw new java.io.IOException("Health check failed: " + e.getMessage(), e);
        }
    }
}