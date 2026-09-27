import type { Metadata } from "next";
import MapClient from "./map-client";
import { PageHeader } from "@/components/Headers";

export const metadata: Metadata = { title: "Map" };
export const revalidate = 60;

export default function MapPage() {
  return (
    <div className="py-10">
      <PageHeader
        title="Server map"
        description="A snapshot of the MangoZ SMP world. Click through for the fully interactive map."
      />
      <MapClient />
    </div>
  );
}
