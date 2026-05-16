/** Map rare / unsupported UI locales to nearest full pack */
const LANG_FALLBACK: Record<string, string> = {
  kok: "hi",
  mni: "hi",
  mai: "hi",
  sat: "hi",
  doi: "hi",
  brx: "hi",
  sa: "hi",
  sd: "hi",
  ks: "hi",
  ne: "hi",
};

export function resolveLang(code: string): string {
  return LANG_FALLBACK[code] ?? code;
}
