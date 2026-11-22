"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Truck } from "lucide-react";

const steps = [
  { number: "01", icon: Search, title: "Explore the menu", text: "Search, filter and compare pizzas from approved local vendors." },
  { number: "02", icon: ShoppingBag, title: "Place your order", text: "Pick a delivery date, add your address and confirm in seconds." },
  { number: "03", icon: Truck, title: "Track & enjoy", text: "Watch your order status change from pending to accepted, then dig in." },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#E5484D]">How it works</p>
          <h2 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
            Three steps to your next favourite slice
          </h2>
        </div>

        <div className="relative mt-14 grid gap-8 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-10 hidden h-0.5 bg-gradient-to-r from-orange-200 via-[#E5484D] to-orange-200 md:block" />
          {steps.map(({ number, icon: Icon, title, text }, index) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              <span className="relative z-10 flex size-20 items-center justify-center rounded-full border-4 border-white bg-[#E5484D] text-white shadow-lg">
                <Icon className="size-8" />
              </span>
              <span className="mt-4 text-xs font-bold tracking-widest text-[#E5484D]">STEP {number}</span>
              <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-2 max-w-xs text-sm text-gray-600 dark:text-gray-400">{text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-[#2A1512] px-6 py-10 text-center text-white sm:px-12">
          <h3 className="text-2xl font-black sm:text-3xl">Hungry yet?</h3>
          <p className="mt-2 text-sm text-orange-100/70">Your next slice is only a few clicks away.</p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E5484D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d43b40]"
          >
            Browse pizzas
          </Link>
        </div>
      </div>
    </section>
  );
}
