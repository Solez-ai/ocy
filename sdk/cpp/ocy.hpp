/**
 * OCY - C++ OCR SDK
 * Lightweight OCR for developer screenshots
 *
 * Compile Instructions:
 *   Linux/macOS: g++ -o example example.cpp -lcurl
 *   Windows: g++ -o example example.cpp -lcurl (with libcurl installed)
 *
 * Or with vcpkg:
 *   vcpkg install curl
 *   g++ -o example example.cpp -I<vcpkg_root>/include -L<vcpkg_root>/lib -lcurl
 */

#ifndef OCY_HPP
#define OCY_HPP

#include <string>
#include <curl/curl.h>
#include <cstring>

namespace ocy {

/**
 * Result structure for OCR extraction
 */
struct OcyResult {
    std::string text;
    float confidence;
    int latency_ms;
    std::string model;
    int chars_detected;
};

namespace detail {

/**
 * CURL write callback for response body
 */
static size_t writeCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

/**
 * Simple JSON parsing - extract string value for a key
 */
std::string extractJsonValue(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\":";
    size_t pos = json.find(search);
    if (pos == std::string::npos) {
        search = "\"" + key + "\": ";
        pos = json.find(search);
        if (pos == std::string::npos) return "";
    }

    pos = json.find(":", pos) + 1;
    while (pos < json.size() && (json[pos] == ' ' || json[pos] == '\t')) pos++;

    if (pos >= json.size()) return "";

    char quote = json[pos];
    if (quote == '"') {
        pos++;
        size_t end = json.find('"', pos);
        if (end == std::string::npos) return "";
        return json.substr(pos, end - pos);
    } else if (quote == '{' || quote == '[') {
        int depth = 1;
        size_t end = pos + 1;
        while (end < json.size() && depth > 0) {
            if (json[end] == '"' && (end == 0 || json[end-1] != '\\')) {
                end++;
                size_t nextQuote = json.find('"', end);
                if (nextQuote != std::string::npos) end = nextQuote + 1;
            } else if (json[end] == '{' || json[end] == '[') {
                depth++;
                end++;
            } else if (json[end] == '}' || json[end] == ']') {
                depth--;
                end++;
            } else {
                end++;
            }
        }
        return json.substr(pos, end - pos);
    } else {
        size_t end = pos;
        while (end < json.size() && json[end] != ',' && json[end] != '}') end++;
        std::string val = json.substr(pos, end - pos);
        while (!val.empty() && (val.back() == ' ' || val.back() == '\t' || val.back() == '\n' || val.back() == '\r')) {
            val.pop_back();
        }
        return val;
    }
}

/**
 * Extract numeric value from JSON
 */
float extractJsonNumber(const std::string& json, const std::string& key) {
    std::string val = extractJsonValue(json, key);
    if (val.empty()) return 0.0f;
    try {
        return std::stof(val);
    } catch (...) {
        return 0.0f;
    }
}

/**
 * Extract integer value from JSON
 */
int extractJsonInt(const std::string& json, const std::string& key) {
    std::string val = extractJsonValue(json, key);
    if (val.empty()) return 0;
    try {
        return std::stoi(val);
    } catch (...) {
        return 0;
    }
}

} // namespace detail

// Configuration
static std::string API_URL = "https://ocy-api.samin.workers.dev";
static std::string API_KEY = "";

/**
 * Set a custom API URL for self-hosted instances
 */
inline void setApiUrl(const std::string& url) {
    API_URL = url;
}

/**
 * Set a global API key for authenticated requests
 */
inline void setApiKey(const std::string& key) {
    API_KEY = key;
}

/**
 * Extract text from an image URL - returns raw JSON string
 */
inline std::string extract_text(const std::string& image_url, const std::string& api_key = "") {
    CURL* curl = curl_easy_init();
    if (!curl) return "{\"error\":\"Failed to init CURL\"}";

    std::string response;

    // Build JSON body
    std::string json_body = "{\"image_url\":\"" + image_url + "\"}";

    // Set headers
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");

    std::string key = api_key.empty() ? API_KEY : api_key;
    if (!key.empty()) {
        std::string auth_header = "x-api-key: " + key;
        headers = curl_slist_append(headers, auth_header.c_str());
    }

    // Configure CURL
    curl_easy_setopt(curl, CURLOPT_URL, (API_URL + "/extract").c_str());
    curl_easy_setopt(curl, CURLOPT_POST, 1L);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_body.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, detail::writeCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);

    // Perform request
    CURLcode res = curl_easy_perform(curl);

    // Cleanup
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK) {
        return "{\"error\":\"CURL error: " + std::string(curl_easy_strerror(res)) + "\"}";
    }

    return response;
}

/**
 * Extract text and parse into OcyResult struct
 */
inline OcyResult extract(const std::string& image_url, const std::string& api_key = "") {
    std::string json = extract_text(image_url, api_key);

    OcyResult result;
    result.text = detail::extractJsonValue(json, "text");
    result.confidence = detail::extractJsonNumber(json, "confidence");
    result.latency_ms = detail::extractJsonInt(json, "latency_ms");
    result.model = detail::extractJsonValue(json, "model");
    result.chars_detected = detail::extractJsonInt(json, "chars_detected");

    return result;
}

/**
 * Check API health
 */
inline std::string health() {
    CURL* curl = curl_easy_init();
    if (!curl) return "{\"error\":\"Failed to init CURL\"}";

    std::string response;

    curl_easy_setopt(curl, CURLOPT_URL, (API_URL + "/health").c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPGET, 1L);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, detail::writeCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);

    CURLcode res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK) {
        return "{\"error\":\"CURL error: " + std::string(curl_easy_strerror(res)) + "\"}";
    }

    return response;
}

} // namespace ocy

#endif // OCY_HPP