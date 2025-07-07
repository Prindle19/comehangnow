
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, UserCredential } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, setDoc, writeBatch, query, getDocs, getDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import { admins } from '@/lib/data';
import type { Family, FamilyMember, ClubLocation, ClubSettings, OperatingHours } from '@/lib/types';
import { useToast } from './use-toast';
import { useClubSettings } from './use-club-settings';

interface AuthContextType {
  user: User | null;
  family: Family | null;
  allFamilies: Family[];
  familyMember: FamilyMember | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateFamilyData: (updatedFamily: Family) => void;
  createFamily: (familyName: string) => void;
  updateClubSettings: (newSettings: Partial<ClubSettings>) => Promise<void>;
  deleteFamily: (familyId: string) => Promise<void>;
  addLocation: (locationData: Omit<ClubLocation, 'id' | 'order'>) => Promise<void>;
  updateLocation: (location: Omit<ClubLocation, 'order'>) => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
  moveLocation: (currentIndex: number, direction: 'up' | 'down') => Promise<void>;
  addUserToFamily: (user: User, familyId: string) => Promise<{ success: boolean; message?: string } | undefined>;
  updateNotificationPreferences: (familyIdToToggle: string, subscribe: boolean) => void;
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
  const { toast } = useToast();
  const { locations } = useClubSettings();

  // Auth state listener
  useEffect(() => {
    if (!auth) {
        setAuthLoading(false);
        return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (user) {
            setIsAdmin(admins.includes(user.email || ''));
        } else {
            // Clear all user-specific data on logout
            setFamily(null);
            setFamilyMember(null);
            setIsAdmin(false);
            setAllFamilies([]);
        }
        setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch families (private)
  useEffect(() => {
    if (!db || !user) {
        setFamiliesLoading(false);
        return;
    }
    setFamiliesLoading(true);
    const familiesCollection = collection(db, "families");
    const unsubscribeFamilies = onSnapshot(familiesCollection, (snapshot) => {
        const familiesData = snapshot.docs.map(doc => ({ ...doc.data() as Omit<Family, 'id'>, id: doc.id }));
        setAllFamilies(familiesData);
        setFamiliesLoading(false);
    }, (error) => {
        console.error("Error fetching families:", error);
        setFamiliesLoading(false);
    });

    return () => unsubscribeFamilies();
  }, [user, db]);

  // Derive user's family and member info
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
        setFamilyMember(member || null);
    } else {
        setFamily(null);
        setFamilyMember(null);
    }
  }, [user, allFamilies]);

  const signInWithGoogle = async () => {
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Firebase Not Configured",
            description: "Please provide Firebase credentials in a .env.local file to enable authentication.",
        });
        throw new Error("Firebase not configured.");
    }
    const provider = new GoogleAuthProvider();
    try {
        return await signInWithPopup(auth, provider);
    } catch (error: any) {
        console.error("Error during sign-in:", error);
        if (error.code !== 'auth/popup-closed-by-user') {
            toast({
                variant: "destructive",
                title: "Sign-in Error",
                description: error.message,
            });
        }
        throw error;
    }
  };
  
  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not configured.");
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const signUpWithEmail = async (name: string, email: string, password: string) => {
      if (!auth) throw new Error("Firebase not configured.");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // Re-set user to trigger profile update
      setUser({ ...userCredential.user, displayName: name });
      return userCredential;
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };
  
  const sendPasswordReset = async (email: string) => {
    if (!auth) throw new Error("Firebase not configured.");
    return sendPasswordResetEmail(auth, email);
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

  const addLocation = async (locationData: Omit<ClubLocation, 'id' | 'order'>) => {
    if (!db || !isAdmin) return;
    try {
        const newLocationData = {
            ...locationData,
            order: locations.length
        };
        await addDoc(collection(db, "locations"), newLocationData);
        toast({ title: "Location added" });
    } catch (error: any) {
        toast({ title: "Error adding location", description: error.message, variant: "destructive" });
    }
  };
  
  const updateLocation = async (location: Omit<ClubLocation, 'order'>) => {
    if (!db || !isAdmin) return;
    const { id, ...locationData } = location;
    try {
        await setDoc(doc(db, "locations", id), locationData, { merge: true });
        toast({ title: "Location updated" });
    } catch (error: any) {
        toast({ title: "Error updating location", description: error.message, variant: "destructive" });
    }
  };
  
  const deleteLocation = async (locationId: string) => {
    if (!db || !isAdmin) return;
    try {
        await deleteDoc(doc(db, "locations", locationId));
        // Note: This leaves a gap in the `order` sequence, which is fine.
        toast({ title: "Location deleted" });
    } catch (error: any) {
        toast({ title: "Error deleting location", description: error.message, variant: "destructive" });
    }
  };

  const moveLocation = async (currentIndex: number, direction: 'up' | 'down') => {
    if (!db || !isAdmin) return;
    const otherIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (otherIndex < 0 || otherIndex >= locations.length) {
      return;
    }

    const currentLoc = locations[currentIndex];
    const otherLoc = locations[otherIndex];

    try {
      const batch = writeBatch(db);
      
      const currentRef = doc(db, "locations", currentLoc.id);
      batch.update(currentRef, { order: otherLoc.order });
      
      const otherRef = doc(db, "locations", otherLoc.id);
      batch.update(otherRef, { order: currentLoc.order });

      await batch.commit();
      toast({ title: "Location order updated" });
    } catch (error: any) {
      toast({ title: "Error updating order", description: error.message, variant: "destructive" });
    }
  };

  const addUserToFamily = async (user: User, familyId: string) => {
    if (!db || !user.email) return;

    const familiesSnapshot = await getDocs(collection(db, "families"));
    for (const doc of familiesSnapshot.docs) {
        const family = doc.data() as Family;
        if (family.members.some(m => m.email === user.email)) {
            return { success: false, message: "This account is already part of a family." };
        }
    }

    const familyDocRef = doc(db, "families", familyId);
    const familyDoc = await getDoc(familyDocRef);

    if (!familyDoc.exists()) {
        return { success: false, message: "Invalid invitation link. The family may have been deleted." };
    }

    const newMember: FamilyMember = {
        id: `mem${Date.now()}`,
        name: user.displayName || 'New Member',
        email: user.email,
        avatarUrl: user.photoURL || "",
        role: 'member',
    };

    await updateDoc(familyDocRef, {
        members: arrayUnion(newMember)
    });
    return { success: true };
  };

  const updateNotificationPreferences = (familyIdToToggle: string, subscribe: boolean) => {
    if (!family || !familyMember) return;

    const currentSubscriptions = familyMember.notificationSubscriptions || [];
    let updatedSubscriptions: string[];

    if (subscribe) {
        if (!currentSubscriptions.includes(familyIdToToggle)) {
            updatedSubscriptions = [...currentSubscriptions, familyIdToToggle];
        } else {
            updatedSubscriptions = currentSubscriptions;
        }
    } else {
        updatedSubscriptions = currentSubscriptions.filter(id => id !== familyIdToToggle);
    }
    
    const updatedMembers = family.members.map(member => {
        if (member.id === familyMember.id) {
            return { ...member, notificationSubscriptions: updatedSubscriptions };
        }
        return member;
    });

    const updatedFamily = { ...family, members: updatedMembers };
    
    updateFamilyData(updatedFamily);
  };

  const loading = authLoading || (!!user && familiesLoading);

  const value = { user, family, allFamilies, familyMember, isAdmin, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, sendPasswordReset, updateFamilyData, createFamily, updateClubSettings, deleteFamily, addLocation, updateLocation, deleteLocation, moveLocation, addUserToFamily, updateNotificationPreferences };

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
