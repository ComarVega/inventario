import { SignJWT, jwtVerify, type JWTPayload } from "jose"

export const SESSION_COOKIE_NAME = "session"
const SESSION_DURATION = "8h"

export type SessionClaims = JWTPayload & {
  sub: string
  email: string
  name: string
  role: "ADMIN" | "EDITOR" | "VIEWER"
}

function getSecretKey() {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    "dev-secret-change-me"

  return new TextEncoder().encode(secret)
}

export async function signSession(claims: SessionClaims) {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey())
}

export async function verifySessionToken(token: string) {
  return jwtVerify<SessionClaims>(token, getSecretKey())
}
