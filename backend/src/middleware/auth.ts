import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export interface JwtPayload {
  sub: string;
  email: string;
  type: "access" | "refresh";
}

export function signAccessToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email, type: "access" }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email, type: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  if (payload.type !== "access") throw new Error("Invalid token type");
  return payload;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });
    if (!user) return reply.status(401).send({ error: "User not found" });
    request.user = user;
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}

export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return;
  try {
    const payload = verifyAccessToken(header.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });
    if (user) request.user = user;
  } catch {
    /* optional */
  }
}
