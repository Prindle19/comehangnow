"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const InviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type InviteFormValues = z.infer<typeof InviteSchema>;

interface InviteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onInvite: (email: string) => void;
}

export function InviteDialog({ isOpen, onOpenChange, onInvite }: InviteDialogProps) {
  const { toast } = useToast();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(InviteSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = (data: InviteFormValues) => {
    onInvite(data.email);
    toast({
      title: "Invitation Sent!",
      description: `An invitation has been sent to ${data.email}.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Invite a Family Member</DialogTitle>
          <DialogDescription>Enter the email of the person you want to invite to your family.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Send Invitation</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
