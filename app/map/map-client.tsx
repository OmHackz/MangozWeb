"use client";

import { useState } from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Camera, ExternalLink, Map as MapIcon, RefreshCw } from "lucide-react";
import { siteConfig } from "@/config/site";

const MAP_URL = siteConfig.links.map;

export default function MapClient() {
  const [w, setW] = useState(1280);
  const [failed, setFailed] = useState(false);
  const shot = `https://s0.wp.com/mshots/v1/${encodeURIComponent(MAP_URL)}?w=${w}`;

  if (!MAP_URL) {
    return (
      <Card shadow="sm" className="border-2 border-black">
        <CardBody className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[2px] border-2 border-black bg-primary/15 text-primary-600">
            <MapIcon size={26} aria-hidden />
          </div>
          <p className="font-pixel text-sm">LIVE MAP COMING SOON</p>
          <p className="max-w-md text-sm text-default-500">
            The world map is not configured yet.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card shadow="sm" className="overflow-hidden border-2 border-black">
        {failed ? (
          <CardBody className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[2px] border-2 border-black bg-primary/15 text-primary-600">
              <MapIcon size={26} aria-hidden />
            </div>
            <p className="font-pixel text-sm">PREVIEW UNAVAILABLE</p>
            <p className="max-w-md text-sm text-default-500">
              Could not load a snapshot right now. The full map still opens fine in a new tab.
            </p>
          </CardBody>
        ) : (
          <a href={MAP_URL} target="_blank" rel="noreferrer" aria-label="Open the full live map">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot}
              alt="Snapshot preview of the MangoZ SMP live map — click to open"
              className="aspect-video w-full bg-default-100 object-cover"
              loading="lazy"
              onError={() => setFailed(true)}
            />
          </a>
        )}
        <CardBody className="flex flex-col gap-2 border-t-2 border-black p-4 sm:flex-row sm:items-center">
          <p className="flex flex-1 items-center gap-1.5 text-xs text-default-500">
            <Camera size={14} aria-hidden />
            Snapshot preview (refreshes every few minutes). Click the image to open the interactive map.
          </p>
          <div className="flex gap-2">
            <Chip size="sm" variant="flat" color="primary">Squaremap</Chip>
            <Button
              size="sm"
              variant="flat"
              onPress={() => {
                setFailed(false);
                setW((v) => (v === 1280 ? 1279 : 1280));
              }}
              startContent={<RefreshCw size={14} aria-hidden />}
            >
              Refresh
            </Button>
            <Button
              as="a"
              href={MAP_URL}
              target="_blank"
              rel="noreferrer"
              size="sm"
              variant="flat"
              color="primary"
              endContent={<ExternalLink size={14} aria-hidden />}
            >
              Open full map
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
