// /elearning/[id]/[subchapterId]/page.tsx
import SubChapterDetail from "@/components/elearning/elearningdetail/elearningSubchapter/SubchapterDetail";

export default async function SubChapterPage({
  params,
}: {
  params: Promise<{ id: string; subchapterId: string }>;
}) {
  const { id, subchapterId } = await params;

  return <SubChapterDetail practiceId={id} subChapterId={subchapterId} />;
}
