import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authenticate";
import { HttpError } from "../utils/httpError";
import * as MentoringSessionService from "../services/mentoring_session.service";
import { uploadPath } from "../middlewares/uploadImage";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
