import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayoutClient userName={session.user?.name} userEmail={session.user?.email}>
      {children}
    </DashboardLayoutClient>
  );
}
