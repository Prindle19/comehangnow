
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { availableIcons, getIcon } from "@/lib/icons";
import { ClubLocation, DailyHours, OperatingHours, TimeSlot } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Trash2, PlusCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

const timeSlotSchema = z.object({
  open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
}).refine(data => data.open < data.close, {
  message: "Opening time must be before closing time.",
  path: ["close"],
});

const dailyHoursSchema = z.object({
  enabled: z.boolean(),
  slots: z.array(timeSlotSchema),
});

const operatingHoursSchema = z.object({
    enabled: z.boolean(),
    monday: dailyHoursSchema,
    tuesday: dailyHoursSchema,
    wednesday: dailyHoursSchema,
    thursday: dailyHoursSchema,
    friday: dailyHoursSchema,
    saturday: dailyHoursSchema,
    sunday: dailyHoursSchema,
});

const LocationSchema = z.object({
  name: z.string().min(2, { message: "Location name must be at least 2 characters." }),
  icon: z.string().min(1, { message: "An icon is required." }),
  operatingHours: operatingHoursSchema,
});

type LocationFormValues = z.infer<typeof LocationSchema>;

const getDefaultOperatingHours = (): OperatingHours => ({
    enabled: false,
    monday: { enabled: false, slots: [] },
    tuesday: { enabled: false, slots: [] },
    wednesday: { enabled: false, slots: [] },
    thursday: { enabled: false, slots: [] },
    friday: { enabled: false, slots: [] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
});


const DaySchedule = ({ day, control }: { day: keyof Omit<OperatingHours, 'enabled'>; control: any }) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `operatingHours.${day}.slots`,
    });
  
    return (
      <div className="space-y-4">
        <FormField
          control={control}
          name={`operatingHours.${day}.enabled`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <FormLabel>Open on {day.charAt(0).toUpperCase() + day.slice(1)}</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <Controller
            control={control}
            name={`operatingHours.${day}.enabled`}
            render={({ field }) => field.value && (
                <div className="pl-2 space-y-2">
                {fields.map((item, index) => (
                    <div key={item.id} className="flex items-end gap-2">
                    <FormField
                        control={control}
                        name={`operatingHours.${day}.slots.${index}.open`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Open</FormLabel>
                            <FormControl><Input type="time" {...field} /></FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`operatingHours.${day}.slots.${index}.close`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Close</FormLabel>
                            <FormControl><Input type="time" {...field} /></FormControl>
                        </FormItem>
                        )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ open: '09:00', close: '17:00' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Slot
                </Button>
                <FormMessage>{(control.getFieldState(`operatingHours.${day}.slots`).error as any)?.message}</FormMessage>
                </div>
            )}
        />
      </div>
    );
  };
  
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
      operatingHours: getDefaultOperatingHours(),
    },
  });
  
  React.useEffect(() => {
    if (isOpen) {
      const defaultValues = {
        name: "",
        icon: "",
        operatingHours: getDefaultOperatingHours(),
      };
      form.reset(location || defaultValues);
    }
  }, [isOpen, location, form]);

  const onSubmit = (data: LocationFormValues) => {
    onSave(data);
    onOpenChange(false);
  };
  
  const IconPreview = getIcon(form.watch("icon"));
  const days: (keyof Omit<OperatingHours, 'enabled'>)[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">{location ? "Edit Location" : "Add New Location"}</DialogTitle>
          <DialogDescription>
            {location ? "Update the details for this location." : "Create a new place for members to check into."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
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
            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Operating Hours</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="operatingHours.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Operating Hours</FormLabel>
                          <FormDescription>
                            Set custom hours. If disabled, the location is always open.
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
                     <Accordion type="multiple" className="w-full space-y-2">
                        {days.map(day => (
                            <AccordionItem value={day} key={day} className="border rounded-md px-2">
                                <AccordionTrigger className="py-2 capitalize">{day}</AccordionTrigger>
                                <AccordionContent>
                                    <DaySchedule day={day} control={form.control} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                     </Accordion>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Location</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
