
import { Waves, Mountain, Building2, Sun, Moon, TreePine, Utensils, LifeBuoy, Dumbbell, Ship, Sailboat, Gamepad2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const iconMap: { [key: string]: LucideIcon } = {
  Waves,
  Mountain,
  Building2,
  Sun,
  Moon,
  TreePine,
  Utensils,
  LifeBuoy,
  Dumbbell,
  Ship,
  Sailboat,
  Gamepad2,
};

export const availableIcons = Object.keys(iconMap);

export const getIcon = (name: string): LucideIcon => {
  return iconMap[name] || Building2; // Default to Building2 if not found
};
