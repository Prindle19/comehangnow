
"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogIn, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { admins } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Family } from "@/lib/types";
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';

const ClubSettingsSchema = z.object({
  name: z.string().min(2, { message: "Club name must be at least 2 characters." }),
});

type ClubSettingsFormValues = z.infer<typeof ClubSettingsSchema>;


export default function SettingsPage() {
  const { user, family, allFamilies, signIn, isAdmin, clubSettings, updateClubSettings, deleteFamily } = useAuth();
  const { toast } = useToast();
  const [familyToDelete, setFamilyToDelete] = React.useState<Family | null>(null);

  const form = useForm<ClubSettingsFormValues>({
    resolver: zodResolver(ClubSettingsSchema),
    values: {
      name: clubSettings.name,
    },
  });

  React.useEffect(() => {
    form.reset({ name: clubSettings.name });
  }, [clubSettings, form]);

  const onSubmit = (data: ClubSettingsFormValues) => {
    updateClubSettings(data);
  };

  const handleDeleteFamily = () => {
    if (familyToDelete) {
        if (familyToDelete.id === family?.id) {
            toast({
                title: "Cannot delete your own family",
                description: "Admins cannot delete the family they belong to.",
                variant: "destructive"
            });
        } else {
             deleteFamily(familyToDelete.id);
        }
        setFamilyToDelete(null);
    }
  };
  
  if (!user) {
    return (
        <div className="container mx-auto p-4 md:p-8 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline">Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-muted-foreground">Please sign in to manage your settings.</p>
                    <Button onClick={signIn} size="lg">
                        <LogIn className="mr-2 h-5 w-5" /> Sign In with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const familiesForAdminView = isAdmin ? allFamilies : allFamilies.filter(f => f.id !== family?.id);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Settings</h1>
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className={cn("grid w-full grid-cols-1", isAdmin ? "md:grid-cols-2 md:w-auto" : "md:w-[200px]")}>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isAdmin && <TabsTrigger value="customization">Club Customization</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{isAdmin ? "Family Management" : "Notification Preferences"}</CardTitle>
              <CardDescription>
                {isAdmin ? "Manage all families in the club." : "Choose which families you want to receive check-in notifications from."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {familiesForAdminView.map((fam) => (
                <div key={fam.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                        <Avatar data-ai-hint="family logo">
                            <AvatarImage src={`https://placehold.co/100x100.png`} />
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{fam.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {!isAdmin && <Switch id={`notifications-${fam.id}`} defaultChecked={Math.random() > 0.5} />}
                        {isAdmin && fam.id !== family?.id && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" onClick={() => setFamilyToDelete(fam)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                {familyToDelete?.id === fam.id && (
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the <strong>{familyToDelete.name}</strong> family and all of its data.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setFamilyToDelete(null)}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteFamily}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                )}
                            </AlertDialog>
                        )}
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {isAdmin && (
            <TabsContent value="customization">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Club Customization</CardTitle>
                        <CardDescription>
                            Update your club's branding and settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="clubName">Club Name</Label>
                                    <FormControl>
                                        <Input id="clubName" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                            <Label htmlFor="logo">Club Logo</Label>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16" data-ai-hint="club logo">
                                    <AvatarImage src="https://placehold.co/100x100.png" />
                                    <AvatarFallback>CC</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" type="button">Upload New Logo</Button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label>Admin Users</Label>
                            <CardDescription>
                                Admins can manage club settings. This list is managed in the file <code>src/lib/data.ts</code>.
                            </CardDescription>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {admins.map(email => <li key={email}>{email}</li>)}
                            </ul>
                        </div>
                        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
                    </CardContent>
                </Card>
                </form>
                </Form>
            </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
