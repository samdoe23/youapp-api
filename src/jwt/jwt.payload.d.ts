import { JWTPayload } from "jose";

export interface Payload extends Required<Pick<JWTPayload, "sub" | "exp">> {}
