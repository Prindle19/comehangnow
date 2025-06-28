
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
