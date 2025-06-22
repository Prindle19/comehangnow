import type { Family, ClubLocation } from "@/lib/types";
import { Waves, Mountain, Building2 } from "lucide-react";

export const families: Family[] = [
  {
    id: "fam1",
    name: "The Millers",
    members: [
      { id: "mem1", name: "Sarah Miller", avatarUrl: "https://placehold.co/100x100.png" },
      { id: "mem2", name: "Tom Miller", avatarUrl: "https://placehold.co/100x100.png" },
      { id: "mem3", name: "Leo Miller", avatarUrl: "https://placehold.co/100x100.png" },
      { id: "mem4", name: "Mia Miller", avatarUrl: "https://placehold.co/100x100.png" },
    ],
  },
  {
    id: "fam2",
    name: "The Johnsons",
    members: [
      { id: "mem5", name: "Chris Johnson", avatarUrl: "https://placehold.co/100x100.png" },
      { id: "mem6", name: "Ava Johnson", avatarUrl: "https://placehold.co/100x100.png" },
    ],
  },
  {
    id: "fam3",
    name: "The Garcia Family",
    members: [
      { id: "mem7", name: "Maria Garcia", avatarUrl: "https://placehold.co/100x100.png" },
      { id: "mem8", name: "David Garcia", avatarUrl: "https://placehold.co/100x100.png" },
      { id: "mem9", name: "Sofia Garcia", avatarUrl: "https://placehold.co/100x100.png" },
    ],
  },
];

export const clubLocations: ClubLocation[] = [
  { id: "loc1", name: "The Pool", icon: Waves },
  { id: "loc2", name: "The Bluffs", icon: Mountain },
  { id: "loc3", name: "The Upper Deck", icon: Building2 },
];

// This represents the current user's family for configuration purposes
export const myFamily: Family = families[0];
