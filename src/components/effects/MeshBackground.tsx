"use client";

import dynamic from "next/dynamic";

const MeshCanvas = dynamic(
  () => import("@/components/three/MeshCanvas").then((m) => m.MeshCanvas),
  { ssr: false, loading: () => <div className="fixed inset-0 mesh-gradient -z-10" /> }
);

export function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 mesh-gradient" />
      <MeshCanvas />
    </div>
  );
}

