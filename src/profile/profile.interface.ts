import { Iso5218Sex } from "src/profile/iso-5218-sex.enum";

export interface IProfile {
  username: string;
  realname: string;
  email: string;
  password: string;
  isoSex: Iso5218Sex;
  birthday: Date;
  heightInCm: number;
  weightInKg: number;
}
