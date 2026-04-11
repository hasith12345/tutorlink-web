/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Apply CSP headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://accounts.google.com https://accounts.youtube.com https://*.auth0.com https://dev-qeqx7zzpkuws7tt4.us.auth0.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "frame-src 'self' https://accounts.google.com https://*.auth0.com https://dev-qeqx7zzpkuws7tt4.us.auth0.com",
              "connect-src 'self' http://localhost:5001 https://accounts.google.com https://accounts.youtube.com https://*.auth0.com https://dev-qeqx7zzpkuws7tt4.us.auth0.com https://vitals.vercel-insights.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ]
      }
    ]
  }
}

export default nextConfig
