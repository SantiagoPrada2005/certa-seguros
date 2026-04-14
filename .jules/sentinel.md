## 2024-06-03 - Added Basic Security Headers
**Vulnerability:** The application lacks basic security headers, such as `X-Frame-Options` (preventing clickjacking), `X-Content-Type-Options` (preventing MIME sniffing), and `Referrer-Policy`.
**Learning:** These basic security headers should be added using a Next.js middleware / proxy.
**Prevention:** Always consider basic security headers using Next.js proxy or middleware.
