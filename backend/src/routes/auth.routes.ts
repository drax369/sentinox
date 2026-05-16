import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { OAuthProvider } from "@prisma/client";
import { authService } from "../modules/auth/auth.service.js";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = signupSchema;

const otpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const oauthSchema = z.object({
  provider: z.enum(["GOOGLE", "GITHUB"]),
  providerId: z.string(),
  email: z.string().email(),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/signup", async (request, reply) => {
    const body = signupSchema.parse(request.body);
    const fingerprint = request.headers["x-device-fingerprint"] as string | undefined;
    try {
      const result = await authService.signup(
        body.email,
        body.password,
        fingerprint,
        request.ip
      );
      return reply.status(201).send(result);
    } catch (e) {
      if ((e as Error).message === "EMAIL_EXISTS") {
        return reply.status(409).send({ error: "Email already registered" });
      }
      throw e;
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const fingerprint = request.headers["x-device-fingerprint"] as string | undefined;
    try {
      const tokens = await authService.login(
        body.email,
        body.password,
        fingerprint,
        request.ip,
        request.headers["user-agent"]
      );
      return tokens;
    } catch {
      return reply.status(401).send({ error: "Invalid credentials" });
    }
  });

  app.post("/auth/otp/verify", async (request, reply) => {
    const body = otpSchema.parse(request.body);
    const fingerprint = request.headers["x-device-fingerprint"] as string | undefined;
    try {
      const tokens = await authService.verifyOtp(
        body.email,
        body.code,
        fingerprint,
        request.ip
      );
      return tokens;
    } catch {
      return reply.status(400).send({ error: "Invalid or expired OTP" });
    }
  });

  app.post("/auth/refresh", async (request, reply) => {
    const { refreshToken } = z
      .object({ refreshToken: z.string() })
      .parse(request.body);
    try {
      return await authService.refresh(refreshToken);
    } catch {
      return reply.status(401).send({ error: "Invalid refresh token" });
    }
  });

  app.post("/auth/oauth", async (request) => {
    const body = oauthSchema.parse(request.body);
    const fingerprint = request.headers["x-device-fingerprint"] as string | undefined;
    const tokens = await authService.oauthLogin(
      body.provider as OAuthProvider,
      body.providerId,
      body.email,
      fingerprint,
      request.ip
    );
    return tokens;
  });
}
