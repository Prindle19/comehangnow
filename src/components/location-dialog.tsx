
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { availableIcons, getIcon } from "@/lib/icons";
import { ClubLocation } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

const LocationSchema = z.object({
  name: z.string().min(2, { message: "Location name must be at least 2 characters." }),
  icon: z.string().min(1, { message: "An icon is required." }),
  operatingHours: z.object({
    enabled: z.boolean(),
    open: z.string(),
    close: z.string(),
  }),
}).refine(data => {
    if (data.operatingHours.enabled) {
        return data.operatingHours.open < data.operatingHours.close;
    }
    return true;
}, {
    message: "Opening time must be before closing time.",
    path: ["operatingHours", "close"],
});

type LocationFormValues = z.infer<typeof LocationSchema>;

interface LocationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: LocationFormValues) => void;
  location: ClubLocation | null;
}

export function LocationDialog({ isOpen, onOpenChange, onSave, location }: LocationDialogProps) {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(LocationSchema),
    defaultValues: {
      name: "",
      icon: "",
      operatingHours: {
        enabled: false,
        open: "09:00",
        close: "17:00",
      },
    },
  });
  
  React.useEffect(() => {
    if (isOpen) {
      form.reset(location || {
        name: "",
        icon: "",
        operatingHours: {
          enabled: false,
          open: "09:00",
          close: "17:00",
        },
      });
    }
  }, [isOpen, location, form]);

  const onSubmit = (data: LocationFormValues) => {
    onSave(data);
    onOpenChange(false);
  };
  
  const IconPreview = getIcon(form.watch("icon"));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{location ? "Edit Location" : "Add New Location"}</DialogTitle>
          <DialogDescription>
            {location ? "Update the details for this location." : "Create a new place for members to check into."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Main Pool" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                   <div className="flex items-center gap-2">
                    <IconPreview className="h-6 w-6 text-muted-foreground" />
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {availableIcons.map((iconName) => (
                            <SelectItem key={iconName} value={iconName}>
                            {iconName}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Advanced: Operating Hours</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="operatingHours.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Operating Hours</FormLabel>
                          <FormDescription>
                            Automatically check out members when the location closes.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {form.watch("operatingHours.enabled") && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="operatingHours.open"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opens At</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="operatingHours.close"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Closes At</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <DialogFooter>
              <Button type="submit">Save Location</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
