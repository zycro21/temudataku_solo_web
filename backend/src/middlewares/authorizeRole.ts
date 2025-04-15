import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles;

    if (!userRoles || !userRoles.some((role) => allowedRoles.includes(role))) {
      res.status(403).json({ message: "Forbidden: Insufficient role" });
      return;
    }

    next();
  };
};
