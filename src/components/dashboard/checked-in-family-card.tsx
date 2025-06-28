
'use client';

import * as React from 'react';
import { differenceInMinutes } from 'date-fns';
import { Clock } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CheckIn, Family } from '@/lib/types';
import { getFirstName } from '@/lib/utils';

interface CheckedInFamilyCardProps {
  family: Family;
  checkIn: CheckIn;
  isCurrentUsersFamily: boolean;
}

export default function CheckedInFamilyCard({ family, checkIn }: CheckedInFamilyCardProps) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const membersPresent = family.members.filter(m => checkIn.memberIds.includes(m.id));

  const minutesRemaining = differenceInMinutes(checkIn.checkOutTime, now);

  const getBadgeVariant = () => {
    if (minutesRemaining < 15) return "destructive";
    if (minutesRemaining < 45) return "secondary";
    return "default";
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{family.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            {membersPresent.map((member) => (
              <Tooltip key={member.id}>
                <TooltipTrigger>
                  <Avatar data-ai-hint="person face">
                    <AvatarImage src={member.avatarUrl && !member.avatarUrl.includes('placehold.co') ? member.avatarUrl : undefined} alt={member.name} />
                    <AvatarFallback className="text-xs">{getFirstName(member.name)}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{member.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {minutesRemaining > 0 ? (
           <Badge variant={getBadgeVariant()} className="flex items-center gap-1.5">
             <Clock className="h-4 w-4" />
             <span>Leaving in ~{minutesRemaining} min</span>
           </Badge>
        ) : (
            <Badge variant="outline">Time is up</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
