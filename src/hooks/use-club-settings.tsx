
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { ClubSettings, ClubLocation } from '@/lib/types';

interface ClubSettingsContextType {
  clubSettings: ClubSettings;
  settingsLoading: boolean;
  locations: ClubLocation[];
  locationsLoading: boolean;
}

const ClubSettingsContext = createContext<ClubSettingsContextType | undefined>(undefined);

const defaultSettings = { name: "Come Hang Now", logoUrl: "" };

export const ClubSettingsProvider = ({ children }: { children: ReactNode }) => {
    const [clubSettings, setClubSettings] = useState<ClubSettings>(defaultSettings);
    const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
    const [locations, setLocations] = useState<ClubLocation[]>([]);
    const [locationsLoading, setLocationsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (typeof document !== 'undefined' && clubSettings.name) {
            document.title = clubSettings.name;
        }
    }, [clubSettings.name]);

    // Fetch settings (public)
    useEffect(() => {
        if (!db) {
            setSettingsLoading(false);
            return;
        }
        const settingsDocRef = doc(db, "clubSettings", "main");
        const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setClubSettings(docSnap.data() as ClubSettings);
            } else {
                setClubSettings(defaultSettings);
            }
            setSettingsLoading(false);
        }, (error) => {
            console.error("Error fetching club settings:", error);
            setSettingsLoading(false);
        });

        return () => unsubscribeSettings();
    }, []);
    
    // Fetch locations (public)
    useEffect(() => {
        if (!db) {
            setLocationsLoading(false);
            return;
        }
        const locationsQuery = query(collection(db, "locations"), orderBy("order"));
        const unsubscribeLocations = onSnapshot(locationsQuery, (snapshot) => {
            const locationsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ClubLocation));
            setLocations(locationsData);
            setLocationsLoading(false);
        }, (error) => {
            console.error("Error fetching locations:", error);
            setLocationsLoading(false);
        });
        
        return () => unsubscribeLocations();
    }, []);

    const value = { clubSettings, settingsLoading, locations, locationsLoading };

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
