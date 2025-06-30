
'use client';

import * as React from 'react';
import type { CheckIn, ClubLocation, Family } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CheckedInFamilyCard from './checked-in-family-card';
import { getIcon } from '@/lib/icons';
import { isLocationOpen, formatOperatingHours, formatTime, formatNextChange } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Clock, CalendarDays } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import WeeklyHours from './weekly-hours';

interface LocationSectionProps {
  location: ClubLocation;
  checkIns: CheckIn[];
  families: Family[];
  currentFamilyId?: string | null;
}

const LocationStatus = ({ location }: { location: ClubLocation }) => {
  const [status, setStatus] = React.useState(isLocationOpen(location));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setStatus(isLocationOpen(location));
    }, 1000 * 30); // update every 30 seconds
    return () => clearInterval(timer);
  }, [location]);

  if (!location.operatingHours.enabled) {
    return null;
  }
  
  const { open, nextChangeDate } = status;

  if (open) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-green-500 hover:bg-green-500/90 text-white">Open</Badge>
        {nextChangeDate && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3"/>
                Closes {formatNextChange(nextChangeDate)}
            </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="destructive">Closed</Badge>
        {nextChangeDate && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3"/>
                Opens {formatNextChange(nextChangeDate)}
            </p>
        )}
    </div>
  );
};


export default function LocationSection({
  location,
  checkIns,
  families,
  currentFamilyId,
}: LocationSectionProps) {
  const familiesAtLocation = React.useMemo(() => {
    const familyMap = new Map<string, { family: Family; checkIn: CheckIn }>();
    checkIns.forEach((checkIn) => {
      const family = families.find((f) => f.id === checkIn.familyId);
      if (family && !familyMap.has(family.id)) {
        familyMap.set(family.id, { family, checkIn });
      }
    });
    return Array.from(familyMap.values());
  }, [checkIns, families]);

  const Icon = getIcon(location.icon);
  const locationStatus = isLocationOpen(location);

  return (
    <Card className={cn(!locationStatus.open && location.operatingHours.enabled && "bg-muted/50")}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                <Icon className="h-8 w-8 text-primary" />
                {location.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <LocationStatus location={location} />
              {location.operatingHours.enabled && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <CalendarDays className="h-4 w-4" />
                      <span className="sr-only">View weekly hours</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <WeeklyHours operatingHours={location.operatingHours} />
                  </PopoverContent>
                </Popover>
              )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {familiesAtLocation.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {familiesAtLocation.map(({ family, checkIn }) => (
              <CheckedInFamilyCard
                key={family.id}
                family={family}
                checkIn={checkIn}
                isCurrentUsersFamily={family.id === currentFamilyId}
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
