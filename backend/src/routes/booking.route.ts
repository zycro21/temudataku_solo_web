import { Router } from "express";
import * as BookingController from "../controllers/booking.controller";
import { createBookingSchema} from "../validations/booking.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.post(
  "/createBooking",
  authenticate,
  validate(createBookingSchema),
 BookingController.createBookingController
);

export default router;