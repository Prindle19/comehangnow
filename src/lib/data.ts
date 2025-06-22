import type { Family, ClubLocation } from "@/lib/types";
import { Waves, Mountain, Building2 } from "lucide-react";

// The user with this email will have admin privileges.
// You can add more emails to this list.
export const admins = ['wohltman@gmail.com'];

export const families: Family[] = [
  {
    id: "fam1",
    name: "The Millers",
    members: [
      { id: "mem1", name: "Sarah Miller", avatarUrl: "https://placehold.co/100x100.png", email: "sarah.miller@example.com", role: 'owner', status: 'active' },
      { id: "mem2", name: "Tom Miller", avatarUrl: "https://placehold.co/100x100.png", email: "tom.miller@example.com", role: 'owner', status: 'active' },
      { id: "mem3", name: "Leo Miller", avatarUrl: "https://placehold.co/100x100.png", email: "leo.miller@example.com", role: 'member', status: 'active' },
      { id: "mem4", name: "Mia Miller", avatarUrl: "https://placehold.co/100x100.png", email: "mia.miller@example.com", role: 'member', status: 'active' },
    ],
  },
  {
    id: "fam2",
    name: "The Johnsons",
    members: [
      { id: "mem5", name: "Chris Johnson", avatarUrl: "https://placehold.co/100x100.png", email: "chris.johnson@example.com", role: 'owner', status: 'active' },
      { id: "mem6", name: "Ava Johnson", avatarUrl: "https://placehold.co/100x100.png", email: "ava.johnson@example.com", role: 'member', status: 'active' },
    ],
  },
  {
    id: "fam3",
    name: "The Garcia Family",
    members: [
      { id: "mem7", name: "Maria Garcia", avatarUrl: "https://placehold.co/100x100.png", email: "maria.garcia@example.com", role: 'owner', status: 'active' },
      { id: "mem8", name: "David Garcia", avatarUrl: "https://placehold.co/100x100.png", email: "david.garcia@example.com", role: 'member', status: 'active' },
      { id: "mem9", name: "Sofia Garcia", avatarUrl: "https://placehold.co/100x100.png", email: "sofia.garcia@example.com", role: 'member', status: 'active' },
    ],
  },
];

export const clubLocations: ClubLocation[] = [
  { id: "loc1", name: "The Pool", icon: Waves },
  { id: "loc2", name: "The Bluffs", icon: Mountain },
  { id: "loc3", name: "The Upper Deck", icon: Building2 },
];
4