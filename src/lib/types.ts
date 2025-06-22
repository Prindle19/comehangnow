
import type { LucideIcon } from "lucide-react";

export type FamilyMember = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  role: 'owner' | 'member';
  status: 'active' | 'pending';
};

export type Family = {
  id:string;
  name: string;
  members: FamilyMember[];
};

export type ClubLocation = {
  id: string;
  name: string;
  icon: LucideIcon;
};

export type CheckIn = {
  id: string;
  familyId: string;
  memberIds: string[];
  locationId: string;
  checkInTime: Date;
  checkOutTime: Date;
};
