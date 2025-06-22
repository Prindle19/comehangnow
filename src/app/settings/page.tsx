"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { families } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export default function SettingsPage() {
  // Mock current user's family ID
  const myFamilyId = "fam1";
  const otherFamilies = families.filter(f => f.id !== myFamilyId);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Settings</h1>
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="club">Club Customization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Notification Preferences</CardTitle>
              <CardDescription>
                Choose which families you want to receive check-in notifications from.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {otherFamilies.map((family) => (
                <div key={family.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                        <Avatar data-ai-hint="family logo">
                            <AvatarImage src={`https://placehold.co/100x100.png`} />
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{family.name}</span>
                    </div>
                  <Switch id={`notifications-${family.id}`} defaultChecked={Math.random() > 0.5} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="club">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Club Customization</CardTitle>
              <CardDescription>
                Customize the app with your club's branding. This is an administrator feature.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="club-name">Club Name</Label>
                <Input id="club-name" defaultValue="My Country Club" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="club-logo">Club Logo</Label>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16" data-ai-hint="club logo">
                        <AvatarImage src="https://placehold.co/100x100.png" />
                        <AvatarFallback>CC</AvatarFallback>
                    </Avatar>
                    <Input id="club-logo" type="file" className="max-w-xs"/>
                </div>
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
