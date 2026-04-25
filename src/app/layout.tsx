
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { ClubSettingsProvider } from '@/hooks/use-club-settings';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { headers } from 'next/headers';
import { ClubSettings } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  let clubSettings: Partial<ClubSettings> = {
    name: "Come Hang Now",
  };

  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost';
    const hostname = host.split(':')[0]; // strip port
    
    // Use env override for local dev testing
    const clubDomain = process.env.NEXT_PUBLIC_DEV_CLUB_DOMAIN && (hostname === 'localhost' || hostname === '127.0.0.1')
      ? process.env.NEXT_PUBLIC_DEV_CLUB_DOMAIN 
      : hostname;

    if (db) {
      const clubsQuery = query(collection(db, "clubs"), where("domain", "==", clubDomain));
      const querySnapshot = await getDocs(clubsQuery);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        clubSettings.name = data.name || "Come Hang Now";
      }
    }
  } catch (error) {
    console.error("Error fetching club settings for metadata, using defaults.", error);
  }

  const appName = clubSettings.name || "Come Hang Now";

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
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", () => {
                  const firebaseConfig = {
                    apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}",
                    authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}",
                    projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}",
                    storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}",
                    messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}",
                    appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}"
                  };
                  const encodedConfig = encodeURIComponent(JSON.stringify(firebaseConfig));
                  navigator.serviceWorker.register("/firebase-messaging-sw.js?firebaseConfig=" + encodedConfig).then(
                    (registration) => {
                      console.log("FCM Service Worker registration successful with scope: ", registration.scope);
                    },
                    (err) => {
                      console.log("FCM Service Worker registration failed: ", err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
