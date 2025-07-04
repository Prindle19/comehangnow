
import { NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ClubSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const defaultSettings = {
    name: "Come Hang Now",
    logoUrl: "https://placehold.co/512x512.png",
  };
  let clubSettings: Partial<ClubSettings> = {};

  try {
    if (db) {
      const settingsDocRef = doc(db, "clubSettings", "main");
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        clubSettings = {
            name: data.name,
            logoUrl: data.logoUrl,
        };
      }
    }
  } catch (error) {
    // This can happen if firestore rules are not public. We'll use defaults.
    console.warn("Could not fetch club settings for manifest, using defaults. This may be due to Firestore security rules.");
  }

  const appName = clubSettings.name || defaultSettings.name;
  const logoUrl = clubSettings.logoUrl || defaultSettings.logoUrl;
  
  // The logo can be a data URI or a standard URL. We need to determine the mime type.
  const isDataUri = logoUrl.startsWith('data:image');
  const mimeTypeMatch = isDataUri ? logoUrl.match(/data:(image\/.*?);/) : null;
  const type = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png'; // Default to png if it's a URL.

  const icons = [
    {
      src: logoUrl,
      sizes: '192x192',
      type: type,
      purpose: 'any maskable'
    },
    {
      src: logoUrl,
      sizes: '512x512',
      type: type,
      purpose: 'any maskable'
    },
  ];

  const manifest = {
    name: appName,
    short_name: appName,
    description: `Check-in and see who's at ${appName}.`,
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
