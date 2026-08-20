// Jalankan SEKALI saja (mis. `npx tsx backfill_tasktype.ts`) untuk mengisi
// taskType semua ELearningSubChapter yang masih NULL, berdasarkan
// keberadaan quiz/assignment yang sudah ada sekarang.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const subChapters = await prisma.eLearningSubChapter.findMany({
    select: { id: true, title: true, taskType: true },
  });

  let updated = 0;

  for (const sc of subChapters) {
    const [hasQuiz, hasAssignment] = await Promise.all([
      prisma.eLearningQuiz.findFirst({
        where: { text: { subBab: { subChapterId: sc.id } } },
        select: { id: true },
      }),
      prisma.eLearningAssignment.findFirst({
        where: { text: { subBab: { subChapterId: sc.id } } },
        select: { id: true },
      }),
    ]);

    const correctTaskType =
      hasQuiz && hasAssignment
        ? "QUIZ_AND_PROJECT"
        : hasQuiz
          ? "QUIZ"
          : hasAssignment
            ? "PROJECT"
            : null;

    if (sc.taskType !== correctTaskType) {
      await prisma.eLearningSubChapter.update({
        where: { id: sc.id },
        data: { taskType: correctTaskType as any },
      });
      console.log(
        `[update] ${sc.title} (${sc.id}): ${sc.taskType} -> ${correctTaskType}`,
      );
      updated++;
    }
  }

  console.log(
    `Selesai. ${updated} dari ${subChapters.length} sub-chapter di-update.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
