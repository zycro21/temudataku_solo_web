// /elearning/[id]/[subchapterId]/page.tsx

import ElearningAccessGuard from "@/components/elearning/elearningdetail/ElearningAccessGuard";
import SubChapterDetail from "@/components/elearning/elearningdetail/elearningSubchapter/SubchapterDetail";

export default async function SubChapterPage({
  params,
}: {
  params: Promise<{ id: string; subchapterId: string }>;
}) {
  const { id, subchapterId } = await params;

  return (
    <ElearningAccessGuard>
      <SubChapterDetail practiceId={id} subChapterId={subchapterId} />
    </ElearningAccessGuard>
  );
}