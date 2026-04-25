
"use client";

import React from 'react';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogIn, Trash2, Package2, PlusCircle, Pencil, ArrowDown, ArrowUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useClubSettings } from "@/hooks/use-club-settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn, getInitials } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Family, ClubLocation } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { LocationDialog } from '@/components/location-dialog';
import { getIcon } from '@/lib/icons';

const ClubSettingsSchema = z.object({
  name: z.string().min(2, { message: "Community name must be at least 2 characters." }),
  logoUrl: z.string().optional(),
});

type ClubSettingsFormValues = z.infer<typeof ClubSettingsSchema>;


export default function SettingsPage() {
  const { user, family, allFamilies, updateClubSettings, deleteFamily, loading: authLoading, addLocation, updateLocation, deleteLocation, moveLocation, familyMember, updateNotificationPreferences } = useAuth();
  const { isAdmin, clubSettings, settingsLoading, locations, locationsLoading } = useClubSettings();
  const { toast } = useToast();
  const [familyToDelete, setFamilyToDelete] = React.useState<Family | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isLocationDialogOpen, setLocationDialogOpen] = React.useState(false);
  const [locationToEdit, setLocationToEdit] = React.useState<ClubLocation | null>(null);
  const [locationToDelete, setLocationToDelete] = React.useState<ClubLocation | null>(null);

  const loading = authLoading || settingsLoading || locationsLoading;

  const form = useForm<ClubSettingsFormValues>({
    resolver: zodResolver(ClubSettingsSchema),
    defaultValues: {
        name: "Come Hang Now",
        logoUrl: "",
    },
  });

  const logoUrl = form.watch("logoUrl");

  React.useEffect(() => {
    if (clubSettings) {
      form.reset({
        name: clubSettings.name,
        logoUrl: clubSettings.logoUrl || "",
      });
    }
  }, [clubSettings, form]);

  const onSubmit = (data: ClubSettingsFormValues) => {
    updateClubSettings(data);
    toast({ title: "Settings saved!" });
    form.reset(data);
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("logoUrl", reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
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
  
  const handleOpenLocationDialog = (location: ClubLocation | null = null) => {
    setLocationToEdit(location);
    setLocationDialogOpen(true);
  };

  const handleLocationSave = (locationData: any) => {
    const { id, ...dataToSave } = locationData;
    if (locationToEdit) {
      updateLocation({ id: locationToEdit.id, ...dataToSave });
    } else {
      addLocation(dataToSave);
    }
  };

  const handleDeleteLocation = () => {
    if (locationToDelete) {
      deleteLocation(locationToDelete.id);
      setLocationToDelete(null);
    }
  };
  
  if (loading) {
     return (
        <div className="container mx-auto p-4 md:p-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="w-full">
                <Skeleton className="h-10 w-64 mb-2" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="container mx-auto p-4 md:p-8 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline">Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-muted-foreground">Please sign in to manage your settings.</p>
                    <Button asChild size="lg">
                        <Link href="/login"><LogIn className="mr-2 h-5 w-5" /> Sign In</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Settings</h1>
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className={cn(
          "w-full",
          isAdmin ? "grid h-auto grid-cols-1 sm:h-10 sm:grid-cols-4" : "grid grid-cols-1"
        )}>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isAdmin && <TabsTrigger value="customization">Community Customization</TabsTrigger>}
          {isAdmin && <TabsTrigger value="locations">Locations</TabsTrigger>}
          {isAdmin && <TabsTrigger value="family-management">Family Management</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Notification Preferences</CardTitle>
              <CardDescription>
                Choose which families you want to receive notifications from when they hang out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border">
                <div>
                  <h3 className="font-medium">System Notifications</h3>
                  <p className="text-sm text-muted-foreground">Allow your browser to receive push alerts.</p>
                </div>
                <Button onClick={requestNotificationPermission}>Enable Push Notifications</Button>
              </div>

              {allFamilies.filter(f => f.id !== family?.id).map((fam) => {
                const isSubscribed = familyMember?.notificationSubscriptions?.includes(fam.id) || false;
                return (
                    <div key={fam.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center space-x-4">
                            <Avatar data-ai-hint="family logo">
                                <AvatarImage src={undefined} />
                                <AvatarFallback>{getInitials(fam.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{fam.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Switch
                                id={`notifications-${fam.id}`}
                                checked={isSubscribed}
                                onCheckedChange={(checked) => {
                                    if (familyMember) {
                                        updateNotificationPreferences(fam.id, checked);
                                    }
                                }}
                            />
                        </div>
                    </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
        
        {isAdmin && (
            <>
                <TabsContent value="customization">
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Community Customization</CardTitle>
                            <CardDescription>
                                Update your community's branding and settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="clubName">Community Name</Label>
                                        <FormControl>
                                            <Input id="clubName" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <Label htmlFor="logo">Community Logo</Label>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16" data-ai-hint="community logo">
                                        <AvatarImage src={logoUrl || undefined} />
                                        <AvatarFallback><Package2 className="h-8 w-8" /></AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()}>Upload New Logo</Button>
                                    <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label>Admin Users</Label>
                                <CardDescription>
                                    Admins can manage community settings. This list is configured for your specific club domain.
                                </CardDescription>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                    {clubSettings.admins?.map(email => <li key={email}>{email}</li>) || <li>No admins configured.</li>}
                                </ul>
                            </div>
                            <Button type="submit" disabled={!form.formState.isDirty} className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
                        </CardContent>
                    </Card>
                    </form>
                    </Form>
                </TabsContent>
            
                <TabsContent value="locations">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="font-headline">Manage Locations</CardTitle>
                                    <CardDescription>Add, edit, or delete check-in locations.</CardDescription>
                                </div>
                                <Button onClick={() => handleOpenLocationDialog()}>
                                    <PlusCircle className="mr-2 h-4 w-4"/> Add Location
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {locations.map((loc, index) => {
                                const Icon = getIcon(loc.icon);
                                return (
                                    <div key={loc.id} className="flex items-center justify-between p-4 rounded-lg border">
                                        <div className="flex items-center space-x-4">
                                            <Icon className="h-6 w-6 text-muted-foreground" />
                                            <div>
                                                <span className="font-medium">{loc.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" onClick={() => moveLocation(index, 'up')} disabled={index === 0}>
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => moveLocation(index, 'down')} disabled={index === locations.length - 1}>
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleOpenLocationDialog(loc)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" onClick={() => setLocationToDelete(loc)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                {locationToDelete?.id === loc.id && (
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will permanently delete the <strong>{locationToDelete.name}</strong> location.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel onClick={() => setLocationToDelete(null)}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleDeleteLocation}>Continue</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                )}
                                            </AlertDialog>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="family-management">
                    <Card>
                        <CardHeader>
                        <CardTitle className="font-headline">Family Management</CardTitle>
                        <CardDescription>
                            Manage all families in the community.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        {allFamilies.map((fam) => (
                            <div key={fam.id} className="flex items-center justify-between p-4 rounded-lg border">
                                <div className="flex items-center space-x-4">
                                    <Avatar data-ai-hint="family logo">
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback>{getInitials(fam.name)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{fam.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {fam.id !== family?.id && (
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
            </>
        )}
      </Tabs>
      <LocationDialog
        isOpen={isLocationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        onSave={handleLocationSave}
        location={locationToEdit}
    />
    </div>
  );
}
