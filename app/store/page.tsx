import type { Metadata } from "next";
import StoreClient from "./store-client";
import { PageHeader } from "@/components/Headers";

export const metadata: Metadata = { title: "Store" };

export default function StorePage() {
  return (
    <div className="py-10">
      <PageHeader
        title="Store"
        description="Support MangoZ SMP and unlock ranks. Pay with UPI, submit your transaction ID, staff verify it manually."
      />
      <StoreClient />
    </div>
  );
}
