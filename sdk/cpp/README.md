![OCY](https://raw.githubusercontent.com/solez-ai/ocy/main/public/logo.png)

# OCY - C++ OCR SDK

Lightweight OCR for developer screenshots — extract text from code images, terminals, and IDE windows.

**Made by Samin Yeasar • [github.com/solez-ai](https://github.com/solez-ai) • [x.com/Solez_None](https://x.com/Solez_None)**

## Installation

### Using vcpkg (recommended)

```bash
vcpkg install curl
```

### Using system package manager

**Linux (Debian/Ubuntu):**
```bash
sudo apt install libcurl4-openssl-dev
```

**macOS:**
```bash
brew install curl
```

**Windows:**
Download from https://curl.se/download.html or use vcpkg.

## Usage

### Basic Example

```cpp
#include "ocy.hpp"
#include <iostream>

int main() {
    ocy::OcyResult result = ocy::extract("https://example.com/screenshot.png");

    std::cout << "Text: " << result.text << std::endl;
    std::cout << "Confidence: " << (result.confidence * 100) << "%" << std::endl;
    std::cout << "Latency: " << result.latency_ms << "ms" << std::endl;

    return 0;
}
```

### Raw JSON Response

```cpp
#include "ocy.hpp"
#include <iostream>

int main() {
    std::string json = ocy::extract_text("https://example.com/code.png");
    std::cout << json << std::endl;
    return 0;
}
```

### With API Key

```cpp
#include "ocy.hpp"

int main() {
    // Option 1: Per-request
    ocy::OcyResult result = ocy::extract("url", "your-api-key");

    // Option 2: Global
    ocy::setApiKey("your-api-key");
    ocy::OcyResult result = ocy::extract("url");
    return 0;
}
```

### Custom API URL

```cpp
#include "ocy.hpp"

int main() {
    ocy::setApiUrl("https://your-custom-worker.workers.dev");
    ocy::OcyResult result = ocy::extract("https://example.com/screenshot.png");
    return 0;
}
```

## Compilation

### Linux/macOS

```bash
g++ -o myapp main.cpp -lcurl
```

### With vcpkg

```bash
g++ -o myapp main.cpp -I${VCPKG_ROOT}/include -L${VCPKG_ROOT}/lib -lcurl
```

### Windows (with libcurl installed)

```bash
g++ -o myapp main.cpp -lcurl
```

## Response Format

```cpp
struct OcyResult {
    std::string text;        // extracted text
    float confidence;        // 0.0 to 1.0
    int latency_ms;         // processing time in ms
    std::string model;       // "ocy-v1-int8"
    int chars_detected;     // character count
};
```

## Features

- Single header file - just `#include "ocy.hpp"`
- No external JSON library - uses built-in string parsing
- Uses libcurl for HTTP requests
- Works on Linux, macOS, and Windows

## Requirements

- C++11 or higher
- libcurl

## License

MIT License - See [LICENSE](https://github.com/solez-ai/ocy/blob/main/LICENSE) for details.