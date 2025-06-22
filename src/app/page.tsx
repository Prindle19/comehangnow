"use client";

import * as React from "react";
import { CheckIn, ClubLocation, Family } from "@/lib/types";
import { clubLocations, families } from "@/lib/data";
import { CheckInDialog } from "@/components/check-in-dialog";
import LocationSection from "@/components/dashboard/location-section";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [checkIns, setCheckIns] = React.useState<CheckIn[]>([]);
  const [isCheckInDialogOpen, setCheckInDialogOpen] = React.useState(false);

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

    // For simplicity, we assume one check-in per family can be active across multiple locations.
    // A more robust solution would handle updates vs. new check-ins.
    const otherFamilyCheckins = checkIns.filter(c => c.familyId !== familyId);
    setCheckIns([...otherFamilyCheckins, ...newCheckIns]);
  };

  const handleLeave = (checkInId: string) => {
    setCheckIns((prev) => prev.filter((c) => c.id !== checkInId));
  };
  
  const handleLeaveAll = (familyId: string) => {
    setCheckIns((prev) => prev.filter((c) => c.familyId !== familyId));
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
        families={families}
        locations={clubLocations}
        onCheckIn={handleCheckIn}
      />
    </div>
  );
}
