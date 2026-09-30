import { PermSet } from "../types/index";

export function countPerms(perms: PermSet) {
  return Object.values(perms).reduce((s, m) => s + Object.values(m).filter(Boolean).length, 0);
}

export function nowTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}