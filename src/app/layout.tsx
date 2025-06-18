import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SchILD Keycloak Sync',
  description: 'Import and sync user data from SchILD/Logineo exports to Keycloak',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-slate-50 dark:bg-slate-900">
        <div className="min-h-screen">
          <main className="">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}