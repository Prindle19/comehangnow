"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { myFamily } from "@/lib/data";
import { FamilyMember } from "@/lib/types";
import { PlusCircle, User } from "lucide-react";

// In a real app, this state would be managed via API calls and a global state manager.
export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>(myFamily.members);

  const handleAddMember = () => {
    // This is a placeholder for a real "add member" flow, which would likely involve a dialog/form.
    const newMember: FamilyMember = {
      id: `mem${members.length + 10}`,
      name: `New Member ${members.length - 3}`,
      avatarUrl: "https://placehold.co/100x100.png"
    };
    setMembers([...members, newMember]);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline">Family Members</CardTitle>
              <CardDescription>Manage your family member profiles.</CardDescription>
            </div>
            <Button onClick={handleAddMember} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id} className="flex flex-col items-center justify-center p-6 text-center">
                <Avatar className="w-24 h-24 mb-4" data-ai-hint="person face">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">{member.name}</p>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
