/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider } from "./AppContext";
import { Scene } from "./components/Scene";
import { MainUI } from "./components/UI";

const products = [
  {
    brand: "BeeTech",
    name: "Call Recorder",
    description: "Interactive 3D voice recorder demo with microphone recording, playback, Hebrew/English UI, and guided controls.",
    href: "./products/call-recorder-beetech/",
    accent: "from-emerald-300 to-yellow-300",
    mark: "BT",
  },
  {
    brand: "XTRIKE ME",
    name: "GP-52 Wireless Controller",
    description: "Standalone 3D controller viewer with retail package unboxing, 360-degree inspection, controls, and RGB lighting.",
    href: "./products/xtrike-me-gp52/index.html",
    accent: "from-cyan-300 to-rose-400",
    mark: "GP",
  },
];

function ProductLanding() {
  return (
    <main className="min-h-screen overflow-y-auto bg-[#090b10] text-white">
      <section className="relative min-h-screen px-5 py-6 sm:px-8 lg:px-12 flex flex-col">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,#090b10_0%,#111827_46%,#18130d_100%)]" />
        <div className="absolute inset-0 pointer-events-none opacity-25 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:38px_38px]" />

        <header className="relative z-10 flex items-center justify-between gap-4">
          <a href="./" className="flex items-center gap-3 text-white no-underline">
            <span className="grid h-10 w-10 place-items-center bg-white text-black font-black tracking-0">3D</span>
            <span>
              <strong className="block text-sm sm:text-base">Allphone 3D</strong>
              <span className="block text-[10px] sm:text-xs text-slate-400 uppercase">Product modeling workspace</span>
            </span>
          </a>
          <a
            href="./products/"
            className="hidden sm:inline-flex border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-0 text-slate-200 hover:bg-white/10"
          >
            Product Index
          </a>
        </header>

        <div className="relative z-10 flex flex-1 flex-col justify-center pt-14 pb-10">
          <div className="max-w-4xl">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Interactive product models</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
              Choose a 3D product experience
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              A clean workspace for product modeling, packaging demos, and interactive web presentations.
            </p>
          </div>

          <section className="mt-10 grid gap-4 lg:grid-cols-2">
            {products.map((product) => (
              <a
                key={product.href}
                href={product.href}
                className="group relative min-h-[260px] overflow-hidden border border-white/12 bg-black/32 p-5 text-white no-underline transition hover:-translate-y-1 hover:border-white/28 hover:bg-black/45 sm:p-7"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${product.accent}`} />
                <div className="flex h-full flex-col justify-between gap-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{product.brand}</span>
                      <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">{product.name}</h2>
                      <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">{product.description}</p>
                    </div>
                    <span className={`grid h-16 w-16 shrink-0 place-items-center bg-gradient-to-br ${product.accent} text-lg font-black text-black shadow-2xl transition group-hover:scale-105`}>
                      {product.mark}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-black uppercase text-slate-300">
                    <span>Open model</span>
                    <span className="text-xl transition group-hover:translate-x-1">-&gt;</span>
                  </div>
                </div>
              </a>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}

function RecorderProduct() {
  return (
    <AppProvider>
      <div className="w-full h-screen bg-[#181a1f] relative overflow-hidden font-sans flex flex-col">
          {/* 3D Canvas Layer */}
          <div className="absolute inset-0 z-0">
              <Scene />
          </div>

          {/* UI Overlay Layer */}
          <div className="absolute inset-0 z-10 pointer-events-none">
              <MainUI />
          </div>
      </div>
    </AppProvider>
  );
}

export default function App() {
  const pathname = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const isRecorderProduct =
    pathname.includes("/products/call-recorder-beetech") ||
    params.get("product") === "call-recorder";

  if (!isRecorderProduct) {
    return <ProductLanding />;
  }

  return (
    <RecorderProduct />
  );
}
