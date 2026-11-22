"use client";

import { motion } from "framer-motion";
import { BadgeCheck, HeartHandshake, MapPinned, Timer } from "lucide-react";

const reasons = [
  {
    icon: Timer,
    title: "Quick & easy ordering",
    text: "Find a pizza you love, choose a delivery time and you're done — no phone calls needed.",
  },
  {
    icon: BadgeCheck,
    title: "Verified local vendors",
    text: "Every pizza is reviewed by our team before it reaches the menu, so quality stays high.",
  },
  {
    icon: MapPinned,
    title: "Neighbourhood coverage",
    text: "Filter by location and discover great pizzerias right around the corner.",
  },
  {
    icon: HeartHandshake,
    title: "Support local business",
    text: "Every order goes directly to the restaurant that made your pizza.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-[#FFF3E9] py-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#E5484D]">Why SliceHub</p>
          <h2 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
            Made for pizza lovers
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            We bring great local pizza and the people who make it together in one simple place.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#FFE7DE] text-[#E5484D]">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
