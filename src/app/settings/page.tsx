"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { families, admins } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user, family, isAdmin, signIn } = useAuth();
  
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

  const otherFamilies = families.filter(f => f.id !== family?.id);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Settings</h1>
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isAdmin && <TabsTrigger value="club">Club Customization</TabsTrigger>}
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

        {isAdmin && (
          <TabsContent value="club">
            <div className="grid gap-6">
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
                 <Card>
                    <CardHeader>
                    <CardTitle className="font-headline">Admin Management</CardTitle>
                    <CardDescription>
                        Users with these email addresses will have admin privileges.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <ul className="space-y-2">
                        {admins.map(email => (
                            <li key={email} className="text-sm p-2 border rounded-md bg-secondary/50">{email}</li>
                        ))}
                       </ul>
                       <p className="text-xs text-muted-foreground">To add or remove admins, please edit the `admins` array in `src/lib/data.ts`.</p>
                    </CardContent>
                </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
