
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { ClubSettingsProvider } from '@/hooks/use-club-settings';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClubSettings } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  let clubSettings: Partial<ClubSettings> = {
    name: "ClubConnect",
  };

  try {
    if (db) {
      const settingsDocRef = doc(db, "clubSettings", "main");
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        clubSettings.name = data.name || "ClubConnect";
      }
    }
  } catch (error) {
    console.error("Error fetching club settings for metadata, using defaults.", error);
  }

  const appName = clubSettings.name || "ClubConnect";

  return {
    title: {
      default: appName,
      template: `%s | ${appName}`,
    },
    description: `Know who's at ${appName} and where.`,
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#87CEEB" />
      </head>
      <body
        className={cn(
          'h-full font-body antialiased',
        )}
      >
        <ClubSettingsProvider>
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </AuthProvider>
        </ClubSettingsProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('SW registered: ', registration);
                  }).catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
