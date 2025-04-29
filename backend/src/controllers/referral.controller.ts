import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestBehavior } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as BehaviorService from "../services/behavior.service";
import { PrismaClient, Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

