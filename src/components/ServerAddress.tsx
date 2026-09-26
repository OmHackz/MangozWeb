import { Card, CardBody } from "@heroui/react";
import { Coins, MonitorSmartphone } from "lucide-react";
import { serverConfig } from "@/config/server";
import CopyButton from "./CopyButton";

export default function ServerAddress() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border border-default-200" shadow="sm">
        <CardBody className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MonitorSmartphone size={16} aria-hidden /> Java Edition
          </p>
          <code className="mt-2 block truncate rounded-lg bg-default-100 px-3 py-2 text-sm">
            {serverConfig.java.address}
          </code>
          <div className="mt-3">
            <CopyButton value={serverConfig.java.address} label="Copy IP" />
          </div>
        </CardBody>
      </Card>
      <Card className="border border-default-200" shadow="sm">
        <CardBody className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Coins size={16} aria-hidden className="hidden" />
            Bedrock (console / mobile)
          </p>
          <code className="mt-2 block truncate rounded-lg bg-default-100 px-3 py-2 text-sm">
            {serverConfig.bedrock.address}:{serverConfig.bedrock.port}
          </code>
          <div className="mt-3 flex gap-2">
            <CopyButton value={serverConfig.bedrock.address} label="Copy IP" />
            <CopyButton value={serverConfig.bedrock.port} label="Copy Port" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
