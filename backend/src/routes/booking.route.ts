import { Router } from "express";
import * as BookingController from "../controllers/booking.controller";
import {
  createBookingSchema,
  getMenteeBookingsSchema,
  getMenteeBookingDetailSchema,
  updateMenteeBookingSchema,
  getAdminBookingsValidator,
  getAdminBookingDetailValidator,
  updateAdminBookingStatusValidator,
  exportAdminBookingsValidator,
  getBookingParticipantsIdValidator,
} from "../validations/booking.validation";
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

router.get(
  "/mentee/bookings",
  authenticate,
  validate(getMenteeBookingsSchema),
  BookingController.getMenteeBookingsController
);

router.get(
  "/mentee/bookings/:id",
  authenticate,
  validate(getMenteeBookingDetailSchema),
  BookingController.getMenteeBookingDetailController
);

router.patch(
  "/mentee/bookings/:id",
  authenticate,
  validate(updateMenteeBookingSchema),
  BookingController.updateMenteeBookingController
);

router.delete(
  "/mentee/bookings/:id",
  authenticate,
  BookingController.cancelMenteeBookingController
);

router.get(
  "/admin/bookings",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminBookingsValidator),
  BookingController.getAdminBookingsController
);

router.get(
  "/admin/bookings/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminBookingDetailValidator),
  BookingController.getAdminBookingDetailController
);

router.patch(
  "/admin/bookings/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateAdminBookingStatusValidator),
  BookingController.updateAdminBookingStatusController
);

router.get(
  "/adminExportBook",
  authenticate,
  authorizeRoles("admin"),
  validate(exportAdminBookingsValidator),
  BookingController.exportAdminBookings
);

router.get(
  "/menteeParticipants/bookings/:id",
  authenticate,
  validate(getBookingParticipantsIdValidator), // validasi ID booking
  BookingController.getBookingParticipantsController
);

export default router;
