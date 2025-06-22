
"use client";

import * as React from "react";
import { CheckIn, ClubLocation, Family } from "@/lib/types";
import { clubLocations } from "@/lib/data";
import { CheckInDialog } from "@/components/check-in-dialog";
import LocationSection from "@/components/dashboard/location-section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { collection, addDoc, deleteDoc, onSnapshot, Timestamp, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  const { user, family, allFamilies } = useAuth();
  const [checkIns, setCheckIns] = React.useState<CheckIn[]>([]);
  const [isCheckInDialogOpen, setCheckInDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!db) return;
    const checkInsCollection = collection(db, "checkins");
    const unsubscribe = onSnapshot(checkInsCollection, (snapshot) => {
      const checkInsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          checkInTime: (data.checkInTime as Timestamp).toDate(),
          checkOutTime: (data.checkOutTime as Timestamp).toDate(),
        } as CheckIn
      });
      setCheckIns(checkInsData);
    });
    return () => unsubscribe();
  }, []);


  const handleCheckIn = async (
    familyId: string,
    memberIds: string[],
    locationIds: string[],
    durationMinutes: number
  ) => {
    if (!db) return;
    const now = new Date();
    const checkOutTime = new Date(now.getTime() + durationMinutes * 60000);

    const checkInPromises = locationIds.map((locationId) => {
      const newCheckIn = {
        familyId,
        memberIds,
        locationId,
        checkInTime: Timestamp.fromDate(now),
        checkOutTime: Timestamp.fromDate(checkOutTime),
      };
      return addDoc(collection(db, "checkins"), newCheckIn);
    });

    await Promise.all(checkInPromises);
  };

  const handleLeave = async (checkInId: string) => {
    if (!db) return;
    await deleteDoc(doc(db, "checkins", checkInId));
  };
  
  const handleLeaveAll = async (familyId: string) => {
    if (!db) return;
    const checkInsToDelete = checkIns.filter(c => c.familyId === familyId);
    const deletePromises = checkInsToDelete.map(c => deleteDoc(doc(db, "checkins", c.id)));
    await Promise.all(deletePromises);
  }

  if (!user || !family) {
    return (
        <div className="container mx-auto p-4 md:p-8 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline">Welcome to ClubConnect</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-muted-foreground">Please sign in to see who's at the club and check in your family.</p>
                    <Button onClick={useAuth().signIn} size="lg">
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
        <Button onClick={() => setCheckInDialogOpen(true)} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          Check In
        </Button>
      </div>

      <div className="grid gap-8">
        {clubLocations.map((location) => (
          <LocationSection
            key={location.id}
            location={location}
            checkIns={checkIns.filter((c) => c.locationId === location.id)}
            families={allFamilies}
            onLeave={handleLeave}
            onLeaveAll={handleLeaveAll}
            currentFamilyId={family?.id}
          />
        ))}
      </div>
      
      <CheckInDialog
        isOpen={isCheckInDialogOpen}
        onOpenChange={setCheckInDialogOpen}
        family={family}
        locations={clubLocations}
        onCheckIn={handleCheckIn}
      />
    </div>
  );
}
