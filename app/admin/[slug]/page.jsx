import EventAdmin from "@/components/admin/EventAdmin";

export const metadata = {
  title: "Administration Passora",
  robots: { index: false, follow: false },
};

export default async function EventAdminPage({ params }) {
  const { slug } = await params;
  return <EventAdmin slug={slug} />;
}
