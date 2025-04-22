import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Membaca file JSON secara manual
const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.resolve(
      __dirname,
      "../configs/temudataku-web-solo-firebase-adminsdk-fbsvc-4fe0d51db7.json"
    ),
    "utf-8"
  )
);

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("Firebase Admin SDK initialized");
