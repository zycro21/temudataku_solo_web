import ElearningDetail from "@/components/elearning/elearningdetail/ElearningDetail";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function ElearningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <ElearningDetail id={id} />
      <Footer />
    </>
  );
}
