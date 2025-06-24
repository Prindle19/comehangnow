
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { admins } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, family, allFamilies, signIn, isAdmin } = useAuth();
  
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

  const otherFamilies = allFamilies.filter(f => f.id !== family?.id);

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
            <TabsContent value="customization">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Club Customization</CardTitle>
                        <CardDescription>
                            Update your club's branding and settings. Note: Saving these settings is not yet implemented.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="clubName">Club Name</Label>
                            <Input id="clubName" defaultValue="ClubConnect" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logo">Club Logo</Label>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16" data-ai-hint="club logo">
                                    <AvatarImage src="https://placehold.co/100x100.png" />
                                    <AvatarFallback>CC</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">Upload New Logo</Button>
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
                        <Button disabled className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
                    </CardContent>
                </Card>
            </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
