
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ClubSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const host = request.headers.get('host') || 'localhost';
  const hostname = host.split(':')[0]; // strip port
  
  // Use env override for local dev testing
  const clubDomain = process.env.NEXT_PUBLIC_DEV_CLUB_DOMAIN && (hostname === 'localhost' || hostname === '127.0.0.1')
    ? process.env.NEXT_PUBLIC_DEV_CLUB_DOMAIN 
    : hostname;

  const defaultSettings = {
    name: "Come Hang Now",
    logoUrl192: "https://placehold.co/192x192/87ceeb/ffffff.png?text=Hang",
    logoUrl512: "https://placehold.co/512x512/87ceeb/ffffff.png?text=Hang",
  };
  let clubSettings: Partial<ClubSettings> = {};

  try {
    if (db) {
      const clubsQuery = query(collection(db, "clubs"), where("domain", "==", clubDomain));
      const querySnapshot = await getDocs(clubsQuery);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        clubSettings = {
            name: data.name,
            logoUrl: data.logoUrl,
        };
      }
    }
  } catch (error) {
    console.warn("Could not fetch club settings for manifest, using defaults. This may be due to Firestore security rules.");
  }

  const appName = clubSettings.name || defaultSettings.name;
  const customLogoUrl = clubSettings.logoUrl;

  const icons = customLogoUrl ? [
    {
      src: customLogoUrl,
      sizes: '192x192',
      type: customLogoUrl.startsWith('data:image/svg+xml') ? 'image/svg+xml' : (customLogoUrl.match(/data:(image\/.*?);/)?.[1] || 'image/png'),
      purpose: 'any maskable'
    },
    {
      src: customLogoUrl,
      sizes: '512x512',
      type: customLogoUrl.startsWith('data:image/svg+xml') ? 'image/svg+xml' : (customLogoUrl.match(/data:(image\/.*?);/)?.[1] || 'image/png'),
      purpose: 'any maskable'
    },
  ] : [
    {
      src: defaultSettings.logoUrl192,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: defaultSettings.logoUrl512,
      sizes: '512x512',
      type: 'image/png',
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
