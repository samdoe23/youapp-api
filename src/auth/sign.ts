import { SignJWT } from "jose";

export const sign = async (
  authId: string,
  secret: Parameters<SignJWT["sign"]>[0],
) =>
  await new SignJWT({ sub: authId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(secret);
