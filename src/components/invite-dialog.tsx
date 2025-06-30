
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const AddMemberSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

type AddMemberFormValues = z.infer<typeof AddMemberSchema>;

interface InviteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddMember: (details: { name: string }) => void;
  familyId: string;
}

export function InviteDialog({ isOpen, onOpenChange, onAddMember, familyId }: InviteDialogProps) {
  const [appUrl, setAppUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin);
    }
  }, []);

  const invitationLink = `${appUrl}/signup?invite=${familyId}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(AddMemberSchema),
    defaultValues: {
      name: "",
    },
  });
  
  const onSubmit = (data: AddMemberFormValues) => {
    onAddMember(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add or Invite Member</DialogTitle>
          <DialogDescription>
            Add a member directly (like a child) or invite someone to join your family with a unique link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <h4 className="font-medium">Invite a member</h4>
                <p className="text-sm text-muted-foreground">
                    Share this link with family members you want to invite. They will be able to create their own account.
                </p>
                <div className="relative">
                    <Input
                        readOnly
                        value={invitationLink}
                        className="pr-12"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-1.5 h-7 w-7 -translate-y-1/2"
                        onClick={handleCopy}
                    >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">Copy Invitation Link</span>
                    </Button>
                </div>
            </div>

            <Separator />
            
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <h4 className="font-medium">Add member without an account</h4>
                    <p className="text-sm text-muted-foreground">
                        For family members who won't be logging in, like children.
                    </p>
                </div>

                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter className="pt-2">
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Add Member</Button>
                </DialogFooter>
            </form>
            </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
