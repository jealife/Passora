import EventsList from "@/components/admin/EventsList";

export const metadata = {
  title: "Administration — Passora",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <EventsList />;
}
