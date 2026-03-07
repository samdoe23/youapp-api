import { Iso5218Sex } from "./iso-5218-sex.enum";

export interface IProfile {
  name: string;
  isoSex: Iso5218Sex;
  birthday: Date;
  heightInCm: number;
  weightInKg: number;
}
