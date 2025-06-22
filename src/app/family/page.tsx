"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FamilyMember } from "@/lib/types";
import { PlusCircle, User, Crown, Trash2, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { InviteDialog } from "@/components/invite-dialog";
import { cn } from "@/lib/utils";

export default function FamilyPage() {
  const { user, family, familyMember, updateFamilyData, signIn } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    if (family) {
      setMembers(family.members);
    }
  }, [family]);

  const handleInviteMember = (email: string) => {
    if (!family) return;

    const newMember: FamilyMember = {
      id: `mem${Date.now()}`,
      name: email, // Placeholder name
      email: email,
      avatarUrl: "https://placehold.co/100x100.png",
      role: 'member',
      status: 'pending'
    };
    
    const updatedFamily = { ...family, members: [...members, newMember] };
    setMembers(updatedFamily.members);
    updateFamilyData(updatedFamily);
  };

  const handleRemoveMember = (memberId: string) => {
    if (!family) return;
    const updatedMembers = members.filter(m => m.id !== memberId);
    const updatedFamily = { ...family, members: updatedMembers };
    setMembers(updatedFamily.members);
    updateFamilyData(updatedFamily);
  };

  const isOwner = familyMember?.role === 'owner';

  if (!user) {
     return (
        <div className="container mx-auto p-4 md:p-8 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline">Manage Your Family</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-muted-foreground">Please sign in to view and manage your family members.</p>
                    <Button onClick={signIn} size="lg">
                        <LogIn className="mr-2 h-5 w-5" /> Sign In with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!family) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">No Family Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Your account is not associated with a family. If you've been invited, please make sure you signed in with the correct email. Otherwise, an admin can create a family for you.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline">{family.name}</CardTitle>
              <CardDescription>Manage your family member profiles.</CardDescription>
            </div>
            {isOwner && (
                <Button onClick={() => setInviteDialogOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id} className={cn("flex flex-col items-center justify-center p-6 text-center relative", member.status === 'pending' && "bg-muted/50")}>
                {isOwner && member.id !== familyMember?.id && (
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => handleRemoveMember(member.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
                <Avatar className="w-24 h-24 mb-4" data-ai-hint="person face">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold flex items-center gap-2">
                    {member.name} 
                    {member.role === 'owner' && <Crown className="w-4 h-4 text-amber-500" />}
                </p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                {member.status === 'pending' && <Badge variant="secondary" className="mt-2">Pending</Badge>}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      {isOwner && (
        <InviteDialog 
            isOpen={isInviteDialogOpen} 
            onOpenChange={setInviteDialogOpen} 
            onInvite={handleInviteMember}
        />
      )}
    </div>
  );
}
