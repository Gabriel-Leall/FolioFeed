const URL_PROTOCOL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//;

function parseHostAsIpv4(hostname: string): number[] | null {
  const segments = hostname.split(".");
  if (segments.length !== 4) {
    return null;
  }

  const octets = segments.map((segment) => Number(segment));
  if (octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) {
    return null;
  }

  return octets;
}

export function normalizeUrl(raw: string): string {
  const input = raw.trim();
  if (input.length === 0) {
    throw new Error("Invalid URL");
  }

  const withProtocol = URL_PROTOCOL_PATTERN.test(input)
    ? input
    : `https://${input}`;
  const parsed = new URL(withProtocol);

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const port = parsed.port && parsed.port !== "443" ? `:${parsed.port}` : "";
  const pathname = parsed.pathname.replace(/\/+$/, "");
  const normalizedPathname = pathname === "/" ? "" : pathname;

  return `https://${host}${port}${normalizedPathname}${parsed.search}${parsed.hash}`;
}

export function isSafeUrl(url: string): boolean {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return false;
  }

  if (hostname === "169.254.169.254") {
    return false;
  }

  const ipv4 = parseHostAsIpv4(hostname);
  if (!ipv4) {
    return true;
  }

  const [first, second] = ipv4;

  if (first === 127) {
    return false;
  }

  if (first === 10) {
    return false;
  }

  if (first === 192 && second === 168) {
    return false;
  }

  return true;
}
