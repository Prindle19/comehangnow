
import { NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ClubSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
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
    console.error("Error fetching club settings for manifest. This is likely due to Firestore security rules.", error);
  }

  // Per user requirement, the PWA is only installable if the admin has set a logo and a custom name.
  if (!clubSettings.name || !clubSettings.logoUrl) {
    // Return a 404 Not Found response to prevent installation with default/missing values.
    return new NextResponse(null, { status: 404 });
  }

  const appName = clubSettings.name;
  
  // The logo can be a data URI or a standard URL. We need to determine the mime type.
  const isDataUri = clubSettings.logoUrl.startsWith('data:image');
  const mimeTypeMatch = isDataUri ? clubSettings.logoUrl.match(/data:(image\/.*?);/) : null;
  const type = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png'; // Default to png if it's a URL, as we can't be sure.

  const icons = [
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
