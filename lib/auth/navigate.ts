import type { useRouter } from "next/navigation";

// Builds the `navigate` callback Clerk's finalize() calls once the session is
// active. decorateUrl may return an absolute URL (Safari ITP cookie refresh),
// which needs a full page load instead of a client-side push.
export function finalizeNavigate(router: ReturnType<typeof useRouter>, destination: string) {
  return ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
    const url = decorateUrl(destination);
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };
}
