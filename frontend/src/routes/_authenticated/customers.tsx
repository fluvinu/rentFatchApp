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
        { name: "name", label: "Full name", required: true, placeholder: "Jane Doe" },
        { name: "email", label: "Email", type: "email", placeholder: "jane@example.com" },
        { name: "phone", label: "Phone", placeholder: "+1 555 0123" },
        { name: "licenseNumber", label: "Driver license", placeholder: "DL-1234567" },
      ]}
      displayFields={["name", "email", "phone", "licenseNumber"]}
    />
  );
}