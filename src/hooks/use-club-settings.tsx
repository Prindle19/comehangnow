"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, doc, onSnapshot, query, orderBy, where, getDocs } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { ClubSettings, ClubLocation } from '@/lib/types';

interface ClubSettingsContextType {
  clubId: string | null;
  clubSettings: ClubSettings;
  settingsLoading: boolean;
  locations: ClubLocation[];
  locationsLoading: boolean;
  isAdmin: boolean;
}

const ClubSettingsContext = createContext<ClubSettingsContextType | undefined>(undefined);

const defaultSettings = { name: "Come Hang Now", logoUrl: "" };

export const ClubSettingsProvider = ({ children, userEmail }: { children: ReactNode, userEmail?: string | null }) => {
    const [clubId, setClubId] = useState<string | null>(null);
    const [clubSettings, setClubSettings] = useState<ClubSettings>(defaultSettings);
    const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
    const [locations, setLocations] = useState<ClubLocation[]>([]);
    const [locationsLoading, setLocationsLoading] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        if (typeof document !== 'undefined' && clubSettings.name) {
            document.title = clubSettings.name;
        }
    }, [clubSettings.name]);

    // Determine the club domain and fetch settings
    useEffect(() => {
        if (!db) {
            setSettingsLoading(false);
            return;
        }

        const resolveClub = async () => {
            const hostname = window.location.hostname;
            const clubDomain = process.env.NEXT_PUBLIC_DEV_CLUB_DOMAIN && (hostname === 'localhost' || hostname === '127.0.0.1') 
                ? process.env.NEXT_PUBLIC_DEV_CLUB_DOMAIN 
                : hostname;

            const q = query(collection(db, "clubs"), where("domain", "==", clubDomain));
            
            const unsubscribeSettings = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    setClubId(doc.id);
                    const data = doc.data();
                    setClubSettings({ name: data.name, logoUrl: data.logoUrl });
                    
                    if (userEmail && data.admins && data.admins.includes(userEmail)) {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } else {
                    setClubId(null);
                    setClubSettings(defaultSettings);
                    setIsAdmin(false);
                }
                setSettingsLoading(false);
            }, (error) => {
                console.error("Error fetching club settings:", error);
                setSettingsLoading(false);
            });

            return unsubscribeSettings;
        };

        let unsub: any;
        resolveClub().then((fn) => { unsub = fn; });

        return () => {
            if (unsub) unsub();
        };
    }, [userEmail]);
    
    // Fetch locations (public but scoped to clubId)
    useEffect(() => {
        if (!db || !clubId) {
            setLocations([]);
            setLocationsLoading(false);
            return;
        }
        
        setLocationsLoading(true);
        const locationsQuery = query(collection(db, "locations"), where("clubId", "==", clubId), orderBy("order"));
        const unsubscribeLocations = onSnapshot(locationsQuery, (snapshot) => {
            const locationsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ClubLocation));
            setLocations(locationsData);
            setLocationsLoading(false);
        }, (error) => {
            console.error("Error fetching locations:", error);
            setLocationsLoading(false);
        });
        
        return () => unsubscribeLocations();
    }, [clubId]);

    const value = { clubId, clubSettings, settingsLoading, locations, locationsLoading, isAdmin };

    return (
        <ClubSettingsContext.Provider value={value}>
            {children}
        </ClubSettingsContext.Provider>
    );
};

export const useClubSettings = (): ClubSettingsContextType => {
  const context = useContext(ClubSettingsContext);
  if (context === undefined) {
    throw new Error('useClubSettings must be used within a ClubSettingsProvider');
  }
  return context;
};
