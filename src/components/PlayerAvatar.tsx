import Image from "next/image";
import { avatarUrl } from "@/lib/minecraft";

export default function PlayerAvatar({
  username,
  size = 64,
  className = "",
}: {
  username: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={avatarUrl(username, 64)}
      alt={`${username} avatar`}
      width={size}
      height={size}
      className={`rounded-lg image-pixelated ${className}`}
      loading="lazy"
      unoptimized={false}
    />
  );
}
