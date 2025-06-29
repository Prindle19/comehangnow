
'use client';

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CheckIn, Family } from '@/lib/types';
import { getFirstName } from '@/lib/utils';

interface CheckedInFamilyCardProps {
  family: Family;
  checkIn: CheckIn;
  isCurrentUsersFamily: boolean;
}

export default function CheckedInFamilyCard({ family, checkIn }: CheckedInFamilyCardProps) {

  const membersPresent = family.members.filter(m => checkIn.memberIds.includes(m.id));

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
    </Card>
  );
}
