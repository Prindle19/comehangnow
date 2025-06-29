
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, setDoc } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import { admins } from '@/lib/data';
import type { Family, FamilyMember } from '@/lib/types';
import { useToast } from './use-toast';

interface ClubSettings {
  name: string;
  logoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  family: Family | null;
  allFamilies: Family[];
  familyMember: FamilyMember | null;
  isAdmin: boolean;
  loading: boolean;
  clubSettings: ClubSettings;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateFamilyData: (updatedFamily: Family) => void;
  createFamily: (familyName: string) => void;
  updateClubSettings: (newSettings: Partial<ClubSettings>) => Promise<void>;
  deleteFamily: (familyId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [allFamilies, setAllFamilies] = useState<Family[]>([]);
  const [familyMember, setFamilyMember] = useState<FamilyMember | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [familiesLoading, setFamiliesLoading] = useState<boolean>(true);
  const [clubSettings, setClubSettings] = useState<ClubSettings>({ name: "Come Hang Now", logoUrl: "" });
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (clubSettings.name && !settingsLoading) {
      document.title = clubSettings.name;
    }
  }, [clubSettings.name, settingsLoading]);

  useEffect(() => {
    if (!auth) {
        setAuthLoading(false);
        setSettingsLoading(false);
        setFamiliesLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (!user) {
            // Clear all user-specific state on sign-out
            setFamily(null);
            setFamilyMember(null);
            setIsAdmin(false);
            setAllFamilies([]);
        } else {
            setIsAdmin(admins.includes(user.email || ''));
        }
        setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) {
      setSettingsLoading(false);
      return;
    }

    // Fetch club settings regardless of auth state for branding
    const settingsDocRef = doc(db, "clubSettings", "main");
    const unsubscribeSettings = onSnapshot(settingsDocRef, async (docSnap) => {
        if (docSnap.exists()) {
            setClubSettings(docSnap.data() as ClubSettings);
        } else {
            const defaultSettings = { name: "Come Hang Now", logoUrl: "" };
            setClubSettings(defaultSettings);
            if (user && admins.includes(user.email || '')) {
                await setDoc(settingsDocRef, defaultSettings);
            }
        }
        setSettingsLoading(false);
    });

    // Only fetch families if user is logged in
    let unsubscribeFamilies = () => {};
    if (user) {
        setFamiliesLoading(true);
        const familiesCollection = collection(db, "families");
        unsubscribeFamilies = onSnapshot(familiesCollection, (snapshot) => {
            const familiesData = snapshot.docs.map(doc => ({ ...doc.data() as Omit<Family, 'id'>, id: doc.id }));
            setAllFamilies(familiesData);
            setFamiliesLoading(false);
        }, (error) => {
            console.error("Error fetching families:", error);
            if (error.code === 'permission-denied') {
                toast({
                    title: "Permission Denied",
                    description: "Please check your Firestore security rules.",
                    variant: "destructive"
                });
            }
            setFamiliesLoading(false);
        });
    } else {
      setFamiliesLoading(false);
    }

    return () => {
        unsubscribeSettings();
        unsubscribeFamilies();
    };
  }, [user, db]);

  useEffect(() => {
    if (!user) {
      setFamily(null);
      setFamilyMember(null);
      return;
    }

    const foundFamily = allFamilies.find(f => f.members.some(m => m.email === user.email));

    if (foundFamily) {
        setFamily(foundFamily);
        const member = foundFamily.members.find(m => m.email === user.email);
        if (member) {
            setFamilyMember(member);
            if (member.status === 'pending') {
                const updatedMembers = foundFamily.members.map(m => 
                    m.id === member.id 
                    ? { ...m, status: 'active', name: user.displayName || m.name, avatarUrl: user.photoURL || m.avatarUrl } 
                    : m
                );
                updateFamilyData({ ...foundFamily, members: updatedMembers });
            }
        }
    } else {
        setFamily(null);
        setFamilyMember(null);
    }
  }, [user, allFamilies]);

  const signIn = async () => {
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Firebase Not Configured",
            description: "Please provide Firebase credentials in a .env.local file to enable authentication.",
        });
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error: any) {
        console.error("Error during sign-in:", error);
        if (error.code !== 'auth/popup-closed-by-user') {
            toast({
                variant: "destructive",
                title: "Sign-in Error",
                description: error.message,
            });
        }
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };
  
  const updateFamilyData = async (updatedFamily: Family) => {
    if (!db) return;
    const familyDocRef = doc(db, "families", updatedFamily.id);
    const { id, ...familyData } = updatedFamily;
    await updateDoc(familyDocRef, familyData);
  };

  const createFamily = async (familyName: string) => {
    if (!user || !db) return;

    const newFamilyMember: FamilyMember = {
        id: `mem${Date.now()}`,
        name: user.displayName || user.email || 'New User',
        email: user.email!,
        avatarUrl: user.photoURL || "",
        role: 'owner',
        status: 'active'
    };

    const newFamily: Omit<Family, 'id'> = {
        name: familyName,
        members: [newFamilyMember]
    };
    
    await addDoc(collection(db, "families"), newFamily);
  };
  
  const updateClubSettings = async (newSettings: Partial<ClubSettings>) => {
    if (!db || !isAdmin) return;
    const settingsDocRef = doc(db, "clubSettings", "main");
    try {
        await setDoc(settingsDocRef, newSettings, { merge: true });
    } catch (error: any) {
        console.error("Error updating settings:", error);
        toast({ title: "Error updating settings", description: error.message, variant: "destructive" });
    }
  };

  const deleteFamily = async (familyId: string) => {
    if (!db || !isAdmin) return;
    try {
        await deleteDoc(doc(db, "families", familyId));
        toast({ title: "Family deleted successfully." });
    } catch (error: any) {
        console.error("Error deleting family:", error);
        toast({ title: "Error deleting family", description: error.message, variant: "destructive" });
    }
  };

  const overallLoading = authLoading || settingsLoading || (user && familiesLoading);

  const value = { user, family, allFamilies, familyMember, isAdmin, loading: overallLoading, clubSettings, signIn, signOut, updateFamilyData, createFamily, updateClubSettings, deleteFamily };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
