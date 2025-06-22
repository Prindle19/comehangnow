
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

const CreateFamilySchema = z.object({
  name: z.string().min(2, { message: "Family name must be at least 2 characters." }),
});

type CreateFamilyFormValues = z.infer<typeof CreateFamilySchema>;

interface CreateFamilyDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreateFamily: (name: string) => void;
}

export function CreateFamilyDialog({ isOpen, onOpenChange, onCreateFamily }: CreateFamilyDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateFamilyFormValues>({
    resolver: zodResolver(CreateFamilySchema),
    defaultValues: {
      name: "",
    },
  });
  
  const onSubmit = (data: CreateFamilyFormValues) => {
    onCreateFamily(data.name);
    toast({
      title: "Family Created!",
      description: `The "${data.name}" family has been created.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create Your Family</DialogTitle>
          <DialogDescription>Give your family a name. You can invite other members after creation.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Millers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Create Family</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
