import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/resource-manager";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({ meta: [{ title: "Customers — Fleet Console" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <ResourceManager
      title="Customers"
      description="People who rent from your fleet."
      basePath="/cus"
      queryKey="customers"
      fields={[
        { name: "cName", label: "Customer Name", required: true, placeholder: "Jane Doe" },
        { name: "mobileNo", label: "Mobile Number", type: "number", placeholder: "1234567890" },
      ]}
      displayFields={["cName", "mobileNo"]}
    />
  );
}