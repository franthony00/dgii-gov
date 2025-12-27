"use client";

import { ViewerContent } from "@/components/viewer-content";

export default function VerPage() {
  const search =
    typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(search);

  const code = params.get("c") ?? "";

  if (!code) {
    return (
      <div style={{ padding: 20 }}>
        ❌ No se recibió ningún código en la URL.
      </div>
    );
  }

  return <ViewerContent codigo={code} />;
}
