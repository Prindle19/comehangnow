
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClubLocation, DailyHours, OperatingHours, TimeSlot } from "./types";
import { format, getDay } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string): string => {
  if (!name) return "";
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return "";

  let initials = parts[0]?.[0] || "";
  if (parts.length > 1) {
    initials += parts[parts.length - 1]?.[0] || "";
  }
  
  return initials.toUpperCase();
}

export const getFirstName = (name: string): string => {
  if (!name) return "";
  return name.split(' ')[0] || "";
}

export const isLocationOpen = (location: ClubLocation): { open: boolean, nextChange?: string, currentSlots?: TimeSlot[] } => {
  if (!location.operatingHours.enabled) {
    return { open: true };
  }

  const now = new Date();
  const dayIndex = getDay(now); // Sunday = 0, Monday = 1, etc.
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayIndex] as keyof Omit<OperatingHours, 'enabled'>;
  const currentTime = format(now, 'HH:mm');

  const todaysHours = location.operatingHours[dayOfWeek];

  if (!todaysHours || !todaysHours.enabled || todaysHours.slots.length === 0) {
    return { open: false };
  }

  const sortedSlots = [...todaysHours.slots].sort((a, b) => a.open.localeCompare(b.open));

  for (const slot of sortedSlots) {
    if (currentTime >= slot.open && currentTime < slot.close) {
      return { open: true, nextChange: slot.close, currentSlots: sortedSlots };
    }
  }

  // If not currently open, find when it opens next
  const nextOpeningSlot = sortedSlots.find(slot => currentTime < slot.open);
  if (nextOpeningSlot) {
    return { open: false, nextChange: nextOpeningSlot.open, currentSlots: sortedSlots };
  }

  return { open: false, currentSlots: sortedSlots };
};

export const formatOperatingHours = (hours: DailyHours): string => {
  if (!hours.enabled || hours.slots.length === 0) {
    return "Closed today";
  }
  return hours.slots
    .map(slot => `${formatTime(slot.open)} - ${formatTime(slot.close)}`)
    .join(', ');
};

export const formatTime = (time: string) => {
    if (!time) return '';
    const [hourStr, minute] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute} ${ampm}`;
};
