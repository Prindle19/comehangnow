
"use client";

import * as React from "react";
import Link from "next/link";
import { CheckIn, ClubLocation, Family } from "@/lib/types";
import { clubLocations } from "@/lib/data";
import { CheckInDialog } from "@/components/check-in-dialog";
import LocationSection from "@/components/dashboard/location-section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { collection, addDoc, deleteDoc, onSnapshot, Timestamp, doc, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  const { user, family, allFamilies, signIn } = useAuth();
  const [checkIns, setCheckIns] = React.useState<CheckIn[]>([]);
  const [isCheckInDialogOpen, setCheckInDialogOpen] = React.useState(false);
  const [familyCheckIn, setFamilyCheckIn] = React.useState<CheckIn | null>(null);

  React.useEffect(() => {
    if (!db) return;
    const checkInsCollection = collection(db, "checkins");

    const unsubscribe = onSnapshot(checkInsCollection, (snapshot) => {
      const now = new Date();
      const activeCheckins: CheckIn[] = [];
      const expiredCheckinIds: string[] = [];

      snapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const checkOutTime = (data.checkOutTime as Timestamp).toDate();
        
        if (checkOutTime > now) {
          activeCheckins.push({
            ...data,
            id: docSnapshot.id,
            checkInTime: (data.checkInTime as Timestamp).toDate(),
            checkOutTime: checkOutTime,
          } as CheckIn);
        } else {
          expiredCheckinIds.push(docSnapshot.id);
        }
      });
      
      setCheckIns(activeCheckins);

      // Delete expired check-ins in the background
      expiredCheckinIds.forEach(async (id) => {
        await deleteDoc(doc(db, "checkins", id));
      });
    });

    return () => unsubscribe();
  }, [db]);

  React.useEffect(() => {
    const currentFamilyCheckIn = checkIns.find(c => c.familyId === family?.id) || null;
    setFamilyCheckIn(currentFamilyCheckIn);
  }, [checkIns, family]);

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

    const checkinsRef = collection(db, "checkins");
    const q = query(checkinsRef, where("familyId", "==", familyId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(collection(db, "checkins"), newCheckInData);
    } else {
      const docId = querySnapshot.docs[0].id;
      await updateDoc(doc(db, "checkins", docId), newCheckInData);
    }
  };
  
  const handleLeave = async (familyId: string) => {
    if (!db || !familyId) return;
    
    const checkinsRef = collection(db, "checkins");
    const q = query(checkinsRef, where("familyId", "==", familyId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        await deleteDoc(doc(db, "checkins", docId));
    }
  };
  
  if (!user) {
    return (
        <div className="container mx-auto p-4 md:p-8 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline">Welcome to ClubConnect</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-muted-foreground">Please sign in to see who's at the club and check in your family.</p>
                    <Button onClick={signIn} size="lg">
                        <LogIn className="mr-2 h-5 w-5" /> Sign In with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">At the Club</h1>
        {family && (
          <div className="flex gap-2">
            <Button onClick={() => setCheckInDialogOpen(true)} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {familyCheckIn ? "Update Check-in" : "Check In"}
            </Button>
            {familyCheckIn && (
              <Button onClick={() => handleLeave(family.id)} size="lg" variant="destructive">
                Leave Club
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
        {clubLocations.map((location) => (
          <LocationSection
            key={location.id}
            location={location}
            checkIns={checkIns.filter((c) => c.locationId === location.id)}
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
            locations={clubLocations}
            onCheckIn={handleCheckIn}
            currentCheckIn={familyCheckIn}
        />
      )}
    </div>
  );
}
