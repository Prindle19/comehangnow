"use client";

import * as React from "react";
import { CheckIn, ClubLocation, Family } from "@/lib/types";
import { clubLocations, families as allFamiliesData } from "@/lib/data";
import { CheckInDialog } from "@/components/check-in-dialog";
import LocationSection from "@/components/dashboard/location-section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function Home() {
  const { user, family, signIn } = useAuth();
  const [checkIns, setCheckIns] = React.useState<CheckIn[]>([]);
  const [isCheckInDialogOpen, setCheckInDialogOpen] = React.useState(false);
  const [families, setFamilies] = React.useState(allFamiliesData);

  const handleCheckIn = (
    familyId: string,
    memberIds: string[],
    locationIds: string[],
    durationMinutes: number
  ) => {
    const now = new Date();
    const newCheckIns: CheckIn[] = locationIds.map((locationId) => ({
      id: crypto.randomUUID(),
      familyId,
      memberIds,
      locationId,
      checkInTime: now,
      checkOutTime: new Date(now.getTime() + durationMinutes * 60000),
    }));

    const otherFamilyCheckins = checkIns.filter(c => c.familyId !== familyId);
    setCheckIns([...otherFamilyCheckins, ...newCheckIns]);
  };

  const handleLeave = (checkInId: string) => {
    setCheckIns((prev) => prev.filter((c) => c.id !== checkInId));
  };
  
  const handleLeaveAll = (familyId: string) => {
    setCheckIns((prev) => prev.filter((c) => c.familyId !== familyId));
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
            families={families}
            onLeave={handleLeave}
            onLeaveAll={handleLeaveAll}
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
