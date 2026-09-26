/**
 * Minecraft avatar / skin helpers.
 * Uses free public render APIs (mc-heads.net, crafatar, visage).
 * Falls back gracefully to generated initials when offline.
 */

export function avatarUrl(username: string, size = 64): string {
  const name = encodeURIComponent(username);
  return `https://mc-heads.net/avatar/${name}/${size}`;
}

export function headUrl(username: string, size = 128): string {
  const name = encodeURIComponent(username);
  return `https://mc-heads.net/head/${name}/${size}`;
}

export function bodyUrl(username: string, size = 128): string {
  const name = encodeURIComponent(username);
  return `https://mc-heads.net/player/${name}/${size}`;
}

export function skinUrlByUuid(uuid: string): string {
  const clean = uuid.replace(/-/g, "");
  return `https://crafatar.com/skins/${clean}?overlay`;
}
