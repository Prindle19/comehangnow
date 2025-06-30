
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClubLocation, DailyHours, OperatingHours, TimeSlot } from "./types";
import { format, getDay, isToday, isTomorrow } from 'date-fns';

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

export const isLocationOpen = (location: ClubLocation): { open: boolean, nextChangeDate?: Date, currentSlots?: TimeSlot[] } => {
  if (!location.operatingHours.enabled) {
    return { open: true };
  }

  const now = new Date();
  const dayIndex = getDay(now); // Sunday = 0, Monday = 1, etc.
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayIndex] as keyof Omit<OperatingHours, 'enabled'>;
  const currentTime = format(now, 'HH:mm');

  const todaysHours = location.operatingHours[dayOfWeek];

  if (todaysHours && todaysHours.enabled && todaysHours.slots.length > 0) {
    const sortedSlots = [...todaysHours.slots].sort((a, b) => a.open.localeCompare(b.open));

    for (const slot of sortedSlots) {
      if (currentTime >= slot.open && currentTime < slot.close) {
        const closingDate = new Date(now);
        const [hours, minutes] = slot.close.split(':').map(Number);
        closingDate.setHours(hours, minutes, 0, 0);
        return { open: true, nextChangeDate: closingDate, currentSlots: sortedSlots };
      }
    }
  }

  // If not currently open, find when it opens next within the week
  for (let i = 0; i < 7; i++) {
    const checkDayIndex = (dayIndex + i) % 7;
    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][checkDayIndex] as keyof Omit<OperatingHours, 'enabled'>;
    const dayHours = location.operatingHours[dayKey];

    if (dayHours && dayHours.enabled && dayHours.slots.length > 0) {
      const sortedSlots = [...dayHours.slots].sort((a, b) => a.open.localeCompare(b.open));
      const firstFutureSlot = sortedSlots.find(slot => {
        // If it's today, check if the slot is in the future.
        // If it's a future day, any slot is a future slot.
        return i > 0 || (i === 0 && currentTime < slot.open);
      });
      
      if (firstFutureSlot) {
        const nextOpeningDate = new Date(now);
        nextOpeningDate.setDate(now.getDate() + i);
        const [hours, minutes] = firstFutureSlot.open.split(':').map(Number);
        nextOpeningDate.setHours(hours, minutes, 0, 0);
        return { open: false, nextChangeDate: nextOpeningDate, currentSlots: todaysHours?.slots };
      }
    }
  }
  
  return { open: false, currentSlots: todaysHours?.slots };
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

export const formatNextChange = (date: Date): string => {
    if (isToday(date)) {
        return `at ${formatTime(format(date, 'HH:mm'))}`;
    }
    if (isTomorrow(date)) {
        return `tomorrow at ${formatTime(format(date, 'HH:mm'))}`;
    }
    return `on ${format(date, 'EEEE')} at ${formatTime(format(date, 'HH:mm'))}`;
};
