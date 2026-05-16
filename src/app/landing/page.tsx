import dynamic from "next/dynamic";

const LandingPage = dynamic(
  () => import("@/components/landing/LandingPage").then((m) => m.LandingPage),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center mesh-gradient">
        <p className="font-mono text-sm tracking-widest text-cyan-400/70 uppercase">
          Loading Sentinox…
        </p>
      </div>
    ),
  }
);

export default function LandingRoute() {
  return <LandingPage />;
}
