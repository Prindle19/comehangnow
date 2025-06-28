
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Family, ClubLocation, CheckIn } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const CheckInSchema = z.object({
  familyId: z.string(),
  memberIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one family member.",
  }),
  locationId: z.string({ required_error: "You have to select a location." }),
  duration: z.string().min(1, { message: "Please select a duration." }),
});

type CheckInFormValues = z.infer<typeof CheckInSchema>;

const durationOptions = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1 hour 30 minutes" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
];

interface CheckInDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  family: Family;
  locations: ClubLocation[];
  onCheckIn: (familyId: string, memberIds: string[], locationId: string, durationMinutes: number) => void;
  currentCheckIn?: CheckIn | null;
}

export function CheckInDialog({ isOpen, onOpenChange, family, locations, onCheckIn, currentCheckIn }: CheckInDialogProps) {
  const { toast } = useToast();

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(CheckInSchema),
    defaultValues: {
      familyId: family.id,
      memberIds: [],
      locationId: "",
      duration: "90",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
        form.reset({
            familyId: family.id,
            memberIds: currentCheckIn?.memberIds || [],
            locationId: currentCheckIn?.locationId || "",
            duration: "90",
        });
    }
  }, [isOpen, currentCheckIn, family, form]);
  
  const onSubmit = (data: CheckInFormValues) => {
    onCheckIn(data.familyId, data.memberIds, data.locationId, parseInt(data.duration, 10));
    toast({
      title: currentCheckIn ? "Check-in Updated!" : "Check-in successful!",
      description: `Have a great time at the club.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{currentCheckIn ? 'Update Your Check-in' : 'Heading to the Club'}</DialogTitle>
          <DialogDescription>Let everyone know where you'll be and for how long.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="memberIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Who is going?</FormLabel>
                    <FormDescription>Select all family members checking in.</FormDescription>
                  </div>
                  {family.members.filter(m => m.status === 'active').map((member) => (
                    <FormField
                      key={member.id}
                      control={form.control}
                      name="memberIds"
                      render={({ field }) => {
                        return (
                          <FormItem key={member.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(member.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), member.id])
                                    : field.onChange(field.value?.filter((value) => value !== member.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{member.name}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="mb-4">
                    <FormLabel className="text-base">Where to?</FormLabel>
                    <FormDescription>Pick your destination at the club.</FormDescription>
                  </div>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {locations.map((location) => (
                        <FormItem key={location.id} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={location.id} id={location.id} />
                          </FormControl>
                          <FormLabel htmlFor={location.id} className="font-normal">{location.name}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How long will you be there?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">{currentCheckIn ? 'Update Check-in' : 'Check In'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
