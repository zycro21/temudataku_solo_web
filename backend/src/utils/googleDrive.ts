import { google } from "googleapis";
import fs from "fs";

const auth = new google.auth.GoogleAuth({
  keyFile: "src/configs/temudataku-web-solo-cc104c240de6.json",
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

export async function uploadToGoogleDrive(
  filePath: string,
  fileName: string,
  folderId?: string
) {
  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
  };

  const media = {
    mimeType: "application/pdf",
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, webViewLink, webContentLink",
  });

  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return response.data;
}
