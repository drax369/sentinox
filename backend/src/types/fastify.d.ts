import type { User } from "@prisma/client";

declare module "fastify" {
  interface FastifyRequest {
    user?: Pick<User, "id" | "email">;
    deviceFingerprint?: string;
  }
}
