import fs from "fs/promises";
import path from "path";
import similarity from "string-similarity";
import { parseNotebookToText } from "./parser-ipynb";
import { parsePptxToText } from "./parser-pptx";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const comparePlagiarismScore = async ({
  projectId,
  currentFilePaths,
  fileType,
}: {
  projectId: string;
  currentFilePaths: string[];
  fileType: "pptx" | "ipynb";
}): Promise<number> => {
  // Validasi fileType
  if (!["pptx", "ipynb"].includes(fileType)) {
    throw new Error("Invalid fileType: Must be 'pptx' or 'ipynb'");
  }

  // Ambil submissions
  const submissions = await prisma.projectSubmission.findMany({
    where: { projectId },
    select: { filePaths: true },
  });

  // Ekstrak teks dari file saat ini
  const currentContents = await Promise.all(
    currentFilePaths
      .filter((f) => f.endsWith(`.${fileType}`))
      .map(async (file) => {
        // Asumsi file sudah berformat submissions/filename.ext
        const fullPath = path.join("uploads", file); // uploads/submissions/filename.ext
        await fs.access(fullPath);
        return extractText(fullPath, fileType);
      })
  );

  // Ekstrak teks dari file sebelumnya
  const previousContents: string[] = [];
  for (const s of submissions) {
    for (const file of s.filePaths) {
      if (file.endsWith(`.${fileType}`)) {
        try {
          const fullPath = path.join("uploads", file); // uploads/submissions/filename.ext
          await fs.access(fullPath);
          const content = await extractText(fullPath, fileType);
          previousContents.push(content);
        } catch (err: any) {
          console.error(`Error processing file ${file}:`, err.message);
        }
      }
    }
  }

  // Jika tidak ada konten untuk dibandingkan
  if (previousContents.length === 0 || currentContents.length === 0) return 0;

  // Hitung skor kemiripan
  const scores = currentContents.flatMap((curr) =>
    previousContents.map((prev) => similarity.compareTwoStrings(curr, prev))
  );

  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  return parseFloat((maxScore * 100).toFixed(2));
};

const extractText = async (
  filePath: string,
  fileType: string
): Promise<string> => {
  if (fileType === "pptx") return await parsePptxToText(filePath);
  if (fileType === "ipynb") return await parseNotebookToText(filePath);
  throw new Error(`Unsupported fileType: ${fileType}`);
};
