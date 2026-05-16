import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { profileService } from "../modules/profile/profile.service.js";

const profileSchema = z.object({
  age: z.number().int().min(0).max(130).optional(),
  gender: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  region: z.string().optional(),
  languagePreference: z.string().optional(),
});

export async function profileRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/profile", async (request) => {
    const profile = await profileService.getProfile(request.user!.id);
    return profile ?? { message: "Profile not initialized" };
  });

  app.put("/profile/update", async (request) => {
    const body = profileSchema.parse(request.body);
    return profileService.updateProfile(request.user!.id, body);
  });
}
