'use client';

import * as React from 'react';
import { differenceInMinutes } from 'date-fns';
import { Clock, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CheckIn, Family } from '@/lib/types';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CheckedInFamilyCardProps {
  family: Family;
  checkIns: CheckIn[];
  onLeave: (checkInId: string) => void;
  onLeaveAll: (familyId: string) => void;
}

export default function CheckedInFamilyCard({ family, checkIns, onLeave, onLeaveAll }: CheckedInFamilyCardProps) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const uniqueMemberIds = React.useMemo(() => {
    const allMemberIds = checkIns.flatMap(c => c.memberIds);
    return [...new Set(allMemberIds)];
  }, [checkIns]);
  
  const membersPresent = family.members.filter(m => uniqueMemberIds.includes(m.id));
  const earliestCheckOut = React.useMemo(() => {
    return new Date(Math.max(...checkIns.map(c => c.checkOutTime.getTime())));
  }, [checkIns]);

  const minutesRemaining = differenceInMinutes(earliestCheckOut, now);

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
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Leave
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {checkIns.map(checkIn => (
                    <DropdownMenuItem key={checkIn.id} onClick={() => onLeave(checkIn.id)}>
                        Leave from this location
                    </DropdownMenuItem>
                ))}
                 <DropdownMenuItem onClick={() => onLeaveAll(family.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    Leave from all locations
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
