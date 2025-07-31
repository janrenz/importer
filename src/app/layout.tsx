import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SchILD Keycloak Sync',
  description: 'Import and sync user data from SchILD exports to Keycloak',
  other: {
    // Content Security Policy
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https:;
      frame-src 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
    `.replace(/\s+/g, ' ').trim(),
    
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="scroll-smooth">
      <body className="bg-slate-50 dark:bg-slate-900">
        {/* Skip link for keyboard users */}
        <a href="#main-content" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        
        <div className="min-h-screen">
          <main id="main-content" className="focus:outline-none" tabIndex={-1}>
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}