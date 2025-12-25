import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "@repo/common-backend";

export function middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1]??""; 

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded !== "object" || !("userId" in decoded)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    req.userId = decoded.userId as string; 
    next();
  } catch {
    return res.status(403).json({ message: "Unauthorized" });
  }
}
