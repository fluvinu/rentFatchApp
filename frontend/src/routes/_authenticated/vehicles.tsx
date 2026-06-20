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
        { name: "vName", label: "Vehicle Name", required: true, placeholder: "Corolla" },
        { name: "vType", label: "Vehicle Type", required: true, placeholder: "Sedan" },
        { name: "vPrice", label: "Price", type: "number", placeholder: "49" },
        { name: "isAvailable", label: "Available", placeholder: "true" },
      ]}
      displayFields={["vName", "vType", "vPrice", "isAvailable"]}
    />
  );
}