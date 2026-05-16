import { OAuthProvider } from "@prisma/client";
import { env } from "../../config/env.js";
import { generateOtp, hashPassword, hashToken, verifyPassword } from "../../lib/crypto.js";
import { prisma } from "../../lib/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
} from "../../middleware/auth.js";
import { writeAuditLog } from "../../services/audit.service.js";

export class AuthService {
  async signup(email: string, password: string, fingerprint?: string, ip?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("EMAIL_EXISTS");

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: { create: {} },
      },
    });

    await this.sendOtp(email, user.id);
    await writeAuditLog({
      userId: user.id,
      action: "auth.signup",
      ipAddress: ip,
      metadata: { fingerprint },
    });

    return { userId: user.id, message: "OTP sent for verification" };
  }

  async login(
    email: string,
    password: string,
    fingerprint?: string,
    ip?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new Error("INVALID_CREDENTIALS");

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error("INVALID_CREDENTIALS");

    return this.createSession(user.id, user.email, fingerprint, ip, userAgent);
  }

  async verifyOtp(email: string, code: string, fingerprint?: string, ip?: string) {
    const otp = await prisma.otpCode.findFirst({
      where: { email, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otp || hashToken(code) !== otp.codeHash) throw new Error("INVALID_OTP");

    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });

    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    return this.createSession(user.id, user.email, fingerprint, ip);
  }

  async refresh(refreshToken: string) {
    const jwt = await import("jsonwebtoken");
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      sub: string;
      email: string;
      type: string;
    };
    if (payload.type !== "refresh") throw new Error("INVALID_TOKEN");

    const stored = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash: hashToken(refreshToken),
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
    if (!stored) throw new Error("INVALID_TOKEN");

    return {
      accessToken: signAccessToken(payload.sub, payload.email),
    };
  }

  async oauthLogin(
    provider: OAuthProvider,
    providerId: string,
    email: string,
    fingerprint?: string,
    ip?: string
  ) {
    let account = await prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider, providerId } },
      include: { user: true },
    });

    if (!account) {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            emailVerified: true,
            profile: { create: {} },
            oauthAccounts: { create: { provider, providerId } },
          },
        });
      } else {
        await prisma.oAuthAccount.create({
          data: { userId: user.id, provider, providerId },
        });
      }
      account = await prisma.oAuthAccount.findUniqueOrThrow({
        where: { provider_providerId: { provider, providerId } },
        include: { user: true },
      });
    }

    return this.createSession(
      account.user.id,
      account.user.email,
      fingerprint,
      ip
    );
  }

  private async sendOtp(email: string, userId?: string) {
    const code = generateOtp(6);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60_000);
    await prisma.otpCode.create({
      data: {
        email,
        userId,
        codeHash: hashToken(code),
        expiresAt,
      },
    });
    // In production: send via email/SMS provider
    if (env.NODE_ENV === "development") {
      console.info(`[DEV OTP] ${email}: ${code}`);
    }
    return code;
  }

  private async createSession(
    userId: string,
    email: string,
    fingerprint?: string,
    ip?: string,
    userAgent?: string
  ) {
    const accessToken = signAccessToken(userId, email);
    const refreshToken = signRefreshToken(userId, email);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.session.create({
        data: {
          userId,
          deviceFingerprint: fingerprint,
          ipAddress: ip,
          userAgent,
          expiresAt,
        },
      }),
      prisma.refreshToken.create({
        data: {
          userId,
          tokenHash: hashToken(refreshToken),
          expiresAt,
        },
      }),
    ]);

    await writeAuditLog({
      userId,
      action: "auth.login",
      ipAddress: ip,
      metadata: { fingerprint },
    });

    return { accessToken, refreshToken, userId, email };
  }
}

export const authService = new AuthService();
