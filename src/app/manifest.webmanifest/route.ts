
import { NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClubSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  let clubSettings: Partial<ClubSettings> = {
    name: "ClubConnect",
    logoUrl: ""
  };

  try {
    if (db) {
      const settingsDocRef = doc(db, "clubSettings", "main");
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        clubSettings = {
            name: data.name || "ClubConnect",
            logoUrl: data.logoUrl || "",
        };
      }
    }
  } catch (error) {
    console.error("Error fetching club settings for manifest. This is likely due to Firestore security rules. Using default values.", error);
  }

  const appName = clubSettings.name || "ClubConnect";
  const defaultLogo192 = "https://placehold.co/192x192.png";
  const defaultLogo512 = "https://placehold.co/512x512.png";
  
  let icons;
  if (clubSettings.logoUrl && (clubSettings.logoUrl.startsWith('http') || clubSettings.logoUrl.startsWith('data:image'))) {
    const isDataUri = clubSettings.logoUrl.startsWith('data:image');
    const mimeTypeMatch = isDataUri ? clubSettings.logoUrl.match(/data:(image\/.*?);/) : null;
    const type = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
    icons = [
      {
        src: clubSettings.logoUrl,
        sizes: '192x192',
        type: type,
        purpose: 'any maskable'
      },
      {
        src: clubSettings.logoUrl,
        sizes: '512x512',
        type: type,
        purpose: 'any maskable'
      },
    ];
  } else {
    icons = [
      {
        src: defaultLogo192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: defaultLogo512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
    ];
  }

  const manifest = {
    name: appName,
    short_name: appName,
    description: `Check-in and see who's at ${appName}.`,
    icons: icons,
    theme_color: '#87CEEB',
    background_color: '#FFFFFF',
    start_url: '/',
    display: 'standalone',
    scope: '/',
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
