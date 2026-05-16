import { prisma } from "../../lib/prisma.js";
import type { Profile } from "@prisma/client";

export interface ProfileUpdateInput {
  age?: number;
  gender?: string;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  dietaryPreferences?: string[];
  region?: string;
  languagePreference?: string;
}

export class ProfileService {
  async getProfile(userId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({ where: { userId } });
  }

  async updateProfile(userId: string, data: ProfileUpdateInput): Promise<Profile> {
    return prisma.profile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async getPersonalizationContext(userId: string) {
    const profile = await this.getProfile(userId);
    return {
      age: profile?.age,
      gender: profile?.gender,
      allergies: profile?.allergies ?? [],
      chronicConditions: profile?.chronicConditions ?? [],
      currentMedications: profile?.currentMedications ?? [],
      dietaryPreferences: profile?.dietaryPreferences ?? [],
      region: profile?.region,
      language: profile?.languagePreference ?? "en",
    };
  }
}

export const profileService = new ProfileService();
