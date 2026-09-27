import type { Metadata } from "next";
import InboxClient from "./inbox-client";
import { PageHeader } from "@/components/Headers";

export const metadata: Metadata = { title: "Inbox" };

export default function InboxPage() {
  return (
    <div className="py-10">
      <PageHeader title="Inbox" description="Server news and your store orders." />
      <InboxClient />
    </div>
  );
}
