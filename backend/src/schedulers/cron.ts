import cron from "node-cron";
import { updateUsersStatus } from "../services/user.service";

// Menjalankan setiap hari pukul 00:00
cron.schedule("0 0 * * *", async () => {
  await updateUsersStatus();
  console.log("User statuses updated!");
});
