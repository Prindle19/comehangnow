
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { families as initialFamilies, admins } from '@/lib/data';
import type { Family, FamilyMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from './use-toast';

interface AuthContextType {
  user: User | null;
  family: Family | null;
  familyMember: FamilyMember | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateFamilyData: (updatedFamily: Family) => void;
  createFamily: (familyName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMember, setFamilyMember] = useState<FamilyMember | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [families, setFamilies] = useState<Family[]>(initialFamilies);

  // On client-side mount, hydrate `families` state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedFamilies = window.localStorage.getItem('clubconnect_families');
        if (storedFamilies) {
          setFamilies(JSON.parse(storedFamilies));
        }
      } catch (error) {
        console.error("Could not load families from localStorage", error);
      }
    }
  }, []);

  // Persist `families` state to localStorage whenever it changes
  useEffect(() => {
    // We prevent writing the initial default data to storage before hydration
    if (families !== initialFamilies) {
      localStorage.setItem('clubconnect_families', JSON.stringify(families));
    }
  }, [families]);

  // Handle Firebase auth state changes
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // This will trigger the next effect
    });
    return () => unsubscribe();
  }, []);

  // Update user-specific context (family, roles, etc.) when user or families data changes
  useEffect(() => {
    setLoading(true);

    if (!user) {
      setFamily(null);
      setFamilyMember(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(admins.includes(user.email || ''));

    let userFamily: Family | null = null;
    let userFamilyMember: FamilyMember | null = null;
    let wasFamilyUpdated = false;
    const familiesCopy = JSON.parse(JSON.stringify(families));

    for (const f of familiesCopy) {
      const memberIndex = f.members.findIndex((m: FamilyMember) => m.email === user.email);
      if (memberIndex !== -1) {
        userFamily = f;
        userFamilyMember = f.members[memberIndex];

        if (userFamilyMember.status === 'pending') {
          f.members[memberIndex].status = 'active';
          if(f.members[memberIndex].name === user.email) {
            f.members[memberIndex].name = user.displayName || user.email;
          }
          f.members[memberIndex].avatarUrl = user.photoURL || f.members[memberIndex].avatarUrl;
          wasFamilyUpdated = true;
        }
        break;
      }
    }

    setFamily(userFamily);
    setFamilyMember(userFamilyMember);

    if (wasFamilyUpdated) {
      setFamilies(familiesCopy);
    }
    setLoading(false);
  }, [user, families]);

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
    } catch (error) {
      console.error("Error during sign-in:", error);
       toast({
            variant: "destructive",
            title: "Sign-in Error",
            description: "Could not sign in with Google. Check console for details.",
      });
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
  
  const updateFamilyData = (updatedFamily: Family) => {
    const familyIndex = families.findIndex(f => f.id === updatedFamily.id);
    if(familyIndex !== -1) {
        const newFamilies = [...families];
        newFamilies[familyIndex] = updatedFamily;
        setFamilies(newFamilies);
    }
  };

  const createFamily = (familyName: string) => {
    if (!user) return;

    const newFamilyMember: FamilyMember = {
        id: `mem${Date.now()}`,
        name: user.displayName || user.email || 'New User',
        email: user.email!,
        avatarUrl: user.photoURL || "https://placehold.co/100x100.png",
        role: 'owner',
        status: 'active'
    };

    const newFamily: Family = {
        id: `fam${Date.now()}`,
        name: familyName,
        members: [newFamilyMember]
    };
    
    setFamilies(prevFamilies => [...prevFamilies, newFamily]);
  };

  const value = { user, family, familyMember, isAdmin, loading, signIn, signOut, updateFamilyData, createFamily };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
         <div className="w-full h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-32" />
            </div>
         </div>
      ) : children}
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
