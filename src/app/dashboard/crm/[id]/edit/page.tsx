import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCustomerForm from "./EditCustomerForm";

export default async function EditCustomerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const customer = await prisma.customer.findUnique({
    where: { id: params.id }
  });

  if (!customer) {
    notFound();
  }

  return <EditCustomerForm customer={customer} />;
}
