import * as argon2 from "argon2";

export const hash = (plain: string) => argon2.hash(plain);
