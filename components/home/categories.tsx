"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/use-api";

type CategoryData = { categories: string[]; locations: string[] };

const fallback = ["Classic", "Cheese", "Veggie", "Pepperoni", "BBQ", "Seafood"];

const categoryEmoji: Record<string, string> = {
  classic: "🍕",
  cheese: "🧀",
  veggie: "🥦",
  pepperoni: "🌶️",
  bbq: "🔥",
  seafood: "🦐",
  dessert: "🍰",
  chicken: "🍗",
  meat: "🥩",
  margherita: "🍅",
};

function emojiFor(category: string) {
  const key = category.toLowerCase();
  return categoryEmoji[key] || "🍕";
}

export function Categories() {
  const { data } = useApi<CategoryData>("/menu-items/categories");
  const categories = data?.categories?.length ? data.categories : fallback;

  return (
    <section className="bg-white py-20 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#E5484D]">Something for everyone</p>
          <h2 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
            Browse by Category
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 12).map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                href={`/menu?category=${encodeURIComponent(category)}`}
                className="flex flex-col items-center gap-3 rounded-2xl border border-orange-100 bg-[#FFFBF7] p-5 text-center transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <span className="text-4xl">{emojiFor(category)}</span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">{category}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
