"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";

const heroImage = "/background.png.avif";

const highlights = [
  { icon: Clock3, label: "Fast delivery" },
  { icon: ShieldCheck, label: "Trusted vendors" },
  { icon: Sparkles, label: "Freshly baked" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#2A1512] text-white">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt="Fresh pizza"
          className="size-full object-cover opacity-50"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1512] via-[#2A1512]/85 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-500/20 px-4 py-1.5 text-sm font-medium text-orange-100">
            🍕 SliceHub — your neighbourhood pizza marketplace
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Really good pizza,
            <span className="block text-[#FF8A4C]">
              delivered to your door.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-orange-50/80 sm:text-lg">
            Explore local pizzerias, discover your next favourite slice and follow
            your order from the oven straight to your table.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-xl bg-[#E5484D] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition hover:bg-[#d43b40]"
            >
              Explore Pizza Menu
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Join SliceHub
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6">
            {highlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-orange-100/80"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <Icon className="size-4 text-[#FF8A4C]" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}