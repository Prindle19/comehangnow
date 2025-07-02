
import { NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClubSettings } from '@/lib/types';

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
        clubSettings = docSnap.data();
      }
    }
  } catch (error) {
    console.error("Error fetching club settings for manifest:", error);
  }

  const defaultLogo192 = "https://placehold.co/192x192.png";
  const defaultLogo512 = "https://placehold.co/512x512.png";
  
  let icons;
  if (clubSettings.logoUrl) {
    const isDataUri = clubSettings.logoUrl.startsWith('data:image');
    const mimeTypeMatch = isDataUri ? clubSettings.logoUrl.match(/data:(image\/.*?);/) : null;
    const type = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
    icons = [
      {
        src: clubSettings.logoUrl,
        sizes: '192x192',
        type: type,
        purpose: 'any'
      },
      {
        src: clubSettings.logoUrl,
        sizes: '512x512',
        type: type,
        purpose: 'any'
      },
    ];
  } else {
    icons = [
      {
        src: defaultLogo192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: defaultLogo512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ];
  }

  const manifest = {
    name: clubSettings.name || "ClubConnect",
    short_name: clubSettings.name || "ClubConnect",
    description: `Check-in and see who's at ${clubSettings.name || "the club"}.`,
    icons: icons,
    theme_color: '#87CEEB',
    background_color: '#F0F0F0',
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
