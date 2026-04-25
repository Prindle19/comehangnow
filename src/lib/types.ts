import type { Timestamp } from "firebase/firestore";

export type ClubSettings = {
  id?: string;
  domain?: string;
  name: string;
  logoUrl?: string;
  admins?: string[];
};

export type FamilyMember = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  role: 'owner' | 'member';
  notificationSubscriptions?: string[];
  fcmTokens?: string[];
};

export type Family = {
  id: string;
  clubId?: string;
  name: string;
  members: FamilyMember[];
};

export type TimeSlot = {
  open: string; // e.g., "09:00"
  close: string; // e.g., "17:00"
};

export type DailyHours = {
  enabled: boolean;
  slots: TimeSlot[];
};

export type OperatingHours = {
  enabled: boolean; // Master switch for operating hours
  monday: DailyHours;
  tuesday: DailyHours;
  wednesday: DailyHours;
  thursday: DailyHours;
  friday: DailyHours;
  saturday: DailyHours;
  sunday: DailyHours;
};

export type ClubLocation = {
  id: string;
  clubId?: string;
  name: string;
  icon: string;
  order: number;
  operatingHours: OperatingHours;
};

export type CheckIn = {
  id: string;
  clubId?: string;
  familyId: string;
  memberIds: string[];
  locationId: string;
  checkInTime: Date;
  checkOutTime: Date;
};

export type FirestoreCheckIn = Omit<CheckIn, 'id' | 'checkInTime' | 'checkOutTime'> & {
  checkInTime: Timestamp;
  checkOutTime: Timestamp;
};
