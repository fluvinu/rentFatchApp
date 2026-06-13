import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/resource-manager";

export const Route = createFileRoute("/_authenticated/vehicles")({
  head: () => ({ meta: [{ title: "Vehicles — Fleet Console" }] }),
  component: VehiclesPage,
});

function VehiclesPage() {
  return (
    <ResourceManager
      title="Vehicles"
      description="Your rentable fleet inventory."
      basePath="/veh"
      queryKey="vehicles"
      fields={[
        { name: "make", label: "Make", required: true, placeholder: "Toyota" },
        { name: "model", label: "Model", required: true, placeholder: "Corolla" },
        { name: "year", label: "Year", type: "number", placeholder: "2024" },
        { name: "plate", label: "License plate", placeholder: "ABC-1234" },
        { name: "pricePerDay", label: "Price / day", type: "number", placeholder: "49" },
        { name: "status", label: "Status", placeholder: "available" },
      ]}
      displayFields={["make", "model", "year", "plate", "status"]}
    />
  );
}