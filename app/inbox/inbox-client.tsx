"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody, Chip, Skeleton } from "@heroui/react";
import { Inbox as InboxIcon, Megaphone, Package } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import McButton from "@/components/McButton";
import McText from "@/components/McText";
import { EmptyState, ErrorState } from "@/components/States";
import type { NewsItem } from "@/config/news";
import { formatINR, timeAgo } from "@/lib/format";
import { getReceipts, type OrderReceipt } from "@/lib/orders";
import { SectionHeader } from "@/components/Headers";

export default function InboxClient() {
  const { username, ready } = useAuth();
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [newsFailed, setNewsFailed] = useState(false);
  const [orders, setOrders] = useState<OrderReceipt[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json?.success) setNews(json.items);
        else if (!cancelled) setNewsFailed(true);
      } catch {
        if (!cancelled) setNewsFailed(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ready) setOrders(getReceipts());
  }, [ready, username]);

  if (!ready || news === null) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-md" />
        <Skeleton className="h-24 rounded-md" />
      </div>
    );
  }

  const myOrders = username
    ? orders.filter((o) => o.username.toLowerCase() === username.toLowerCase())
    : [];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section aria-label="Server news">
        <SectionHeader title="Server news" />
        {newsFailed ? (
          <ErrorState title="Unable to load news" description="Please try again later." />
        ) : news.length === 0 ? (
          <EmptyState title="No news yet" description="Announcements from staff will appear here." />
        ) : (
          <ul className="space-y-3">
            {news.map((n) => (
              <li key={n.id}>
                <Card shadow="sm" className="border-2 border-black">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-2">
                      <Megaphone size={15} aria-hidden className="text-primary" />
                      <p className="font-pixel text-xs">{n.title}</p>
                    </div>
                    <p className="mt-1.5 text-sm text-default-600">{n.body}</p>
                    <p className="mt-1 text-xs text-default-400">{timeAgo(n.createdAt)}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="My orders">
        <SectionHeader title="My orders" />
        {!username ? (
          <Card shadow="sm" className="border-2 border-black">
            <CardBody className="flex flex-col items-center gap-2 p-6 text-center">
              <InboxIcon size={22} aria-hidden className="text-default-400" />
              <p className="text-sm text-default-600">
                Log in with your Minecraft username to see your store orders on this device.
              </p>
              <McButton as={Link} href="/login" size="sm">
                Login
              </McButton>
            </CardBody>
          </Card>
        ) : myOrders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description={`${username}, your rank purchases will show up here after you buy from the store.`}
            actionLabel="Open store"
            actionHref="/store"
          />
        ) : (
          <ul className="space-y-3">
            {myOrders.map((o, i) => (
              <li key={`${o.utr}-${i}`}>
                <Card shadow="sm" className="border-2 border-black">
                  <CardBody className="flex flex-row items-center gap-3 p-4">
                    <Package size={18} aria-hidden className="shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <McText code={o.itemName} className="font-pixel text-xs" />
                      <p className="mt-0.5 text-xs text-default-500">
                        {formatINR(o.amountInr)} · UTR {o.utr}
                      </p>
                    </div>
                    <Chip size="sm" variant="flat" color="warning">
                      Pending verification
                    </Chip>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
