import AyclClient from "./AyclClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const params = await searchParams;

  return <AyclClient slug={params.slug} />;
}
