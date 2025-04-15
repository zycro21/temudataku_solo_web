import jwt from "jsonwebtoken";

type JwtPayloadWithUserId = {
  userId: string;
  roles: string[];
  iat?: number;
  exp?: number;
};

export const decodeToken = (
  token: string,
  secret: string
): JwtPayloadWithUserId => {
  const decoded = jwt.verify(token, secret);

  if (typeof decoded === "string" || !("userId" in decoded)) {
    throw new Error("Invalid token payload");
  }

  return decoded as JwtPayloadWithUserId;
};
