
import * as React from 'react';
import { OperatingHours } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '../ui/separator';

interface WeeklyHoursProps {
  operatingHours: OperatingHours;
}

const daysOfWeek: (keyof Omit<OperatingHours, 'enabled'>)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function WeeklyHours({ operatingHours }: WeeklyHoursProps) {
  return (
    <div className="p-1">
      <h4 className="font-semibold text-center mb-2">Weekly Hours</h4>
      <Separator className="mb-4"/>
      <div className="space-y-2">
        {daysOfWeek.map(day => {
          const dayHours = operatingHours[day];
          return (
            <div key={day} className="grid grid-cols-3 gap-2 text-sm items-center">
              <span className="font-medium capitalize col-span-1">{day}</span>
              <div className="col-span-2 text-right">
                {dayHours.enabled && dayHours.slots.length > 0 ? (
                  dayHours.slots.map((slot, index) => (
                    <div key={index}>
                      {formatTime(slot.open)} - {formatTime(slot.close)}
                    </div>
                  ))
                ) : (
                  <span className="text-muted-foreground">Closed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
