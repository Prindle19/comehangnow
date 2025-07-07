
"use client";

import * as React from "react";
import Link from "next/link";
import { CheckIn, ClubLocation, Family } from "@/lib/types";
import { CheckInDialog } from "@/components/check-in-dialog";
import LocationSection from "@/components/dashboard/location-section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useClubSettings } from "@/hooks/use-club-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { collection, addDoc, deleteDoc, onSnapshot, Timestamp, doc, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { isLocationOpen } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user, family, allFamilies, loading: authLoading } = useAuth();
  const { clubSettings, settingsLoading, locations, locationsLoading } = useClubSettings();
  const [allCheckIns, setAllCheckIns] = React.useState<CheckIn[]>([]);
  const [activeCheckIns, setActiveCheckIns] = React.useState<CheckIn[]>([]);
  const [isCheckInDialogOpen, setCheckInDialogOpen] = React.useState(false);
  const [familyCheckIn, setFamilyCheckIn] = React.useState<CheckIn | null>(null);
  const { toast } = useToast();

  const loading = authLoading || settingsLoading || locationsLoading;

  React.useEffect(() => {
    if (!user || !db) {
      setAllCheckIns([]);
      return;
    }
    const checkInsCollection = collection(db, "checkins");
    const unsubscribe = onSnapshot(checkInsCollection, (snapshot) => {
      const checkinsData = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          ...data,
          id: docSnapshot.id,
          checkInTime: (data.checkInTime as Timestamp).toDate(),
          checkOutTime: (data.checkOutTime as Timestamp).toDate(),
        } as CheckIn;
      });
      setAllCheckIns(checkinsData);
    }, (error) => {
        console.error("Error fetching check-ins:", error);
        toast({
            title: "Error fetching data",
            description: "Could not load check-in information. Please check your connection and permissions.",
            variant: "destructive",
        });
    });

    return () => unsubscribe();
  }, [user, db, toast]);
  
  React.useEffect(() => {
    const processCheckIns = () => {
      if (!allCheckIns.length || !locations.length) {
        setActiveCheckIns([]);
        return;
      };

      const now = new Date();
      const active: CheckIn[] = [];
      const expiredIds: string[] = [];
      
      allCheckIns.forEach((checkIn) => {
        let isExpired = checkIn.checkOutTime <= now;

        const location = locations.find(l => l.id === checkIn.locationId);
        if (location && location.operatingHours.enabled) {
          if (!isLocationOpen(location).open) {
            isExpired = true;
          }
        }
        
        if (!isExpired) {
          active.push(checkIn);
        } else {
          expiredIds.push(checkIn.id);
        }
      });

      setActiveCheckIns(active);

      if (db && expiredIds.length > 0) {
        expiredIds.forEach(async (id) => {
          await deleteDoc(doc(db, "checkins", id));
        });
      }
    };
    
    processCheckIns();
    
    const intervalId = setInterval(processCheckIns, 1000 * 10);

    return () => clearInterval(intervalId);
  }, [allCheckIns, db, locations]);


  React.useEffect(() => {
    const currentFamilyCheckIn = activeCheckIns.find(c => c.familyId === family?.id) || null;
    setFamilyCheckIn(currentFamilyCheckIn);
  }, [activeCheckIns, family]);

  const handleCheckIn = async (
    familyId: string,
    memberIds: string[],
    locationId: string,
    durationMinutes: number
  ) => {
    if (!db) return;
    const now = new Date();
    const checkOutTime = new Date(now.getTime() + durationMinutes * 60000);

    const newCheckInData = {
      familyId,
      memberIds,
      locationId,
      checkInTime: Timestamp.fromDate(now),
      checkOutTime: Timestamp.fromDate(checkOutTime),
    };

    try {
        const checkinsRef = collection(db, "checkins");
        const q = query(checkinsRef, where("familyId", "==", familyId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
        await addDoc(collection(db, "checkins"), newCheckInData);
        } else {
        const docId = querySnapshot.docs[0].id;
        await updateDoc(doc(db, "checkins", docId), newCheckInData);
        }
    } catch (error: any) {
        console.error("Error during check-in:", error);
        toast({
            variant: "destructive",
            title: "Check-in failed",
            description: error.message || "An unexpected error occurred.",
        });
    }
  };
  
  const handleLeave = async (familyId: string) => {
    if (!db || !familyId) return;
    
    try {
        const checkinsRef = collection(db, "checkins");
        const q = query(checkinsRef, where("familyId", "==", familyId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            await deleteDoc(doc(db, "checkins", docId));
        }
    } catch (error: any) {
        console.error("Error during leave:", error);
        toast({
            variant: "destructive",
            title: "Leave failed",
            description: error.message || "An unexpected error occurred.",
        });
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-11 w-28 rounded-md" />
        </div>
        <div className="grid gap-8">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="container mx-auto p-4 md:p-8 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline">Welcome to {clubSettings.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-muted-foreground">Please sign in to see who's hanging out and let folks know you're here.</p>
                    <Button asChild size="lg">
                        <Link href="/login"><LogIn className="mr-2 h-5 w-5" /> Sign In</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Who's Hanging?</h1>
        {family && (
          <div className="flex gap-2">
            <Button onClick={() => setCheckInDialogOpen(true)} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {familyCheckIn ? "Update Hang" : "Hang Now"}
            </Button>
            {familyCheckIn && (
              <Button onClick={() => handleLeave(family.id)} size="lg" variant="destructive">
                Leave
              </Button>
            )}
          </div>
        )}
      </div>

      {!family && (
         <Card className="mb-8">
            <CardHeader>
                <CardTitle>Welcome!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You're logged in, but not yet part of a family.</p>
                <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/family">Go to the Family page to create or join one.</Link>
                </Button>
            </CardContent>
         </Card>
      )}

      <div className="grid gap-8">
        {locations.map((location) => (
          <LocationSection
            key={location.id}
            location={location}
            checkIns={activeCheckIns.filter((c) => c.locationId === location.id)}
            families={allFamilies}
            currentFamilyId={family?.id}
          />
        ))}
      </div>
      
      {family && (
        <CheckInDialog
            isOpen={isCheckInDialogOpen}
            onOpenChange={setCheckInDialogOpen}
            family={family}
            locations={locations}
            onCheckIn={handleCheckIn}
            currentCheckIn={familyCheckIn}
        />
      )}
    </div>
  );
}
