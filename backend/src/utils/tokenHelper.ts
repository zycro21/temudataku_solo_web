import { Request } from "express";

export const getTokenFromCookies = (req: Request): string | null => {
  const token = req.cookies?.token;
  return token || null;
};