'use client';

import * as React from 'react';
import type { CheckIn, ClubLocation, Family } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CheckedInFamilyCard from './checked-in-family-card';

interface LocationSectionProps {
  location: ClubLocation;
  checkIns: CheckIn[];
  families: Family[];
  onLeave: (checkInId: string) => void;
  onLeaveAll: (familyId: string) => void;
}

export default function LocationSection({
  location,
  checkIns,
  families,
  onLeave,
  onLeaveAll
}: LocationSectionProps) {
  const familiesAtLocation = React.useMemo(() => {
    const familyMap = new Map<string, { family: Family; checkIns: CheckIn[] }>();
    checkIns.forEach((checkIn) => {
      const family = families.find((f) => f.id === checkIn.familyId);
      if (family) {
        if (!familyMap.has(family.id)) {
          familyMap.set(family.id, { family, checkIns: [] });
        }
        familyMap.get(family.id)!.checkIns.push(checkIn);
      }
    });
    return Array.from(familyMap.values());
  }, [checkIns, families]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
          <location.icon className="h-8 w-8 text-primary" />
          {location.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {familiesAtLocation.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {familiesAtLocation.map(({ family, checkIns }) => (
              <CheckedInFamilyCard
                key={family.id}
                family={family}
                checkIns={checkIns}
                onLeave={onLeave}
                onLeaveAll={onLeaveAll}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No one is here at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
