
// "use client";

// import { useMemo, useState } from "react";
// import Link from "next/link";
// import { ArrowRight } from "lucide-react";
// import { useApi } from "@/hooks/use-api";
// import type { Pizza } from "@/lib/types";
// import { PizzaCard } from "@/components/menu/pizza-card";
// import { EmptyState, LoadingState } from "@/components/ui/states";

// export function FeaturedPizzas() {
//   const [showAll, setShowAll] = useState(false);

//   const featured = useApi<Pizza[]>("/menu-items?featured=true&limit=6");
//   const all = useApi<Pizza[]>("/menu-items?limit=50");

//   const items = useMemo(() => {
//     const combined = [...(featured.data || [])];
//     const seen = new Set(combined.map((pizza) => pizza._id));

//     for (const pizza of all.data || []) {
//       if (seen.has(pizza._id)) continue;
//       combined.push(pizza);
//       seen.add(pizza._id);
//     }

//     return combined.slice(0, 18);
//   }, [featured.data, all.data]);

//   const loading = featured.loading || all.loading;
//   const error = featured.error || all.error;

//   const visibleItems = showAll ? items : items.slice(0, 6);

//   return (
//     <section className="bg-[#FFFBF7] py-20 dark:bg-slate-950">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

//         <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
//           <div>
//             <p className="text-sm font-bold uppercase tracking-widest text-[#E5484D]">
//               Popular right now
//             </p>

//             <h2 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
//               Featured Menu Items
//             </h2>

//             <p className="mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400">
//               Hand-picked pizzas from approved vendors, ready for delivery.
//             </p>
//           </div>

//           <Link
//             href="/menu"
//             className="inline-flex items-center gap-2 text-sm font-bold text-[#E5484D] hover:underline"
//           >
//             See the full menu <ArrowRight className="size-4" />
//           </Link>
//         </div>

//         <div className="mt-10">
//           {loading && <LoadingState label="Loading featured pizzas..." />}

//           {error && !loading && (
//             <EmptyState
//               title="Could not load pizzas"
//               message={error}
//             />
//           )}

//           {!loading && !error && items.length === 0 && (
//             <EmptyState
//               title="No approved pizzas yet"
//               message="Vendors are preparing their menus. Check back soon for fresh slices!"
//             />
//           )}

//           {!loading && !error && items.length > 0 && (
//             <>
//               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                 {visibleItems.map((pizza, index) => (
//                   <PizzaCard
//                     key={pizza._id}
//                     pizza={pizza}
//                     index={index}
//                   />
//                 ))}
//               </div>

//               {items.length > 6 && (
//                 <div className="mt-12 text-center">
//                   <button
//                     onClick={() => setShowAll(!showAll)}
//                     className="rounded-xl bg-[#E5484D] px-8 py-3 font-bold text-white transition hover:bg-[#c9363b]"
//                   >
//                     {showAll ? "See Less" : "See More"}
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Pizza } from "@/lib/types";
import { PizzaCard } from "@/components/menu/pizza-card";
import { EmptyState, LoadingState } from "@/components/ui/states";

export function FeaturedPizzas() {
  const featured = useApi<Pizza[]>("/menu-items?featured=true&limit=6");
  const all = useApi<Pizza[]>("/menu-items?limit=50");

  const items = useMemo(() => {
    let combined = [...(featured.data || [])];
    const seen = new Set(combined.map((pizza) => pizza._id));

    for (const pizza of all.data || []) {
      if (seen.has(pizza._id)) continue;
      combined.push(pizza);
      seen.add(pizza._id);
    }

    if (combined.length === 0) {
      combined = [
        {
          _id: "fallback-classic-margherita",
          itemName: "Classic Margherita",
          description: "San Marzano tomato, fresh mozzarella, basil and extra virgin olive oil.",
          price: 450,
          images: ["https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80"],
          category: "Classic",
          location: "Dhaka",
          status: "approved",
          isAvailable: true,
          featured: true,
          vendorName: "SliceHub Kitchen",
          averageRating: 4.9,
        },
        {
          _id: "fallback-pepperoni-supreme",
          itemName: "Pepperoni Supreme",
          description: "A generous layer of pepperoni, mozzarella and our signature tomato sauce.",
          price: 520,
          images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"],
          category: "Spicy",
          location: "Dhaka",
          status: "approved",
          isAvailable: true,
          featured: true,
          vendorName: "SliceHub Kitchen",
          averageRating: 4.8,
        },
        {
          _id: "fallback-truffle-mushroom",
          itemName: "Truffle Mushroom",
          description: "Wild mushrooms, truffle cream, mozzarella and a touch of fresh thyme.",
          price: 580,
          images: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"],
          category: "Premium",
          location: "Chittagong",
          status: "approved",
          isAvailable: true,
          featured: true,
          vendorName: "SliceHub Kitchen",
          averageRating: 4.9,
        },
        {
          _id: "fallback-smoky-bbq-chicken",
          itemName: "Smoky BBQ Chicken",
          description: "Tender chicken, smoky BBQ sauce, red onion and melted mozzarella.",
          price: 560,
          images: ["https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=800&q=80"],
          category: "BBQ",
          location: "Dhaka",
          status: "approved",
          isAvailable: true,
          featured: true,
          vendorName: "SliceHub Kitchen",
          averageRating: 4.7,
        },
        {
          _id: "fallback-four-cheese",
          itemName: "Four Cheese",
          description: "Mozzarella, cheddar, parmesan and gorgonzola blended to perfection.",
          price: 540,
          images: ["https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80"],
          category: "Cheese Lovers",
          location: "Chittagong",
          status: "approved",
          isAvailable: true,
          featured: true,
          vendorName: "SliceHub Kitchen",
          averageRating: 4.8,
        },
        {
          _id: "fallback-garlic-shrimp",
          itemName: "Garlic Shrimp",
          description: "Juicy shrimp, garlic butter, fresh parsley and a hint of chili.",
          price: 620,
          images: ["https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80"],
          category: "Seafood",
          location: "Dhaka",
          status: "approved",
          isAvailable: true,
          featured: true,
          vendorName: "SliceHub Kitchen",
          averageRating: 4.9,
        },
      ] as Pizza[];
    }

    return combined.slice(0, 18);
  }, [featured.data, all.data]);

  const loading = featured.loading || all.loading;
  const error = featured.error || all.error;

  const visibleItems = items.slice(0, 6);

  return (
    <section className="bg-[#FFFBF7] py-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#E5484D]">
              Popular right now
            </p>

            <h2 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
              Featured Menu Items
            </h2>

            <p className="mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400">
              Hand-picked pizzas from approved vendors, ready for delivery.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#E5484D] hover:underline"
          >
            See the full menu <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10">
          {loading && <LoadingState label="Loading featured pizzas..." />}

          {error && !loading && (
            <EmptyState
              title="Could not load pizzas"
              message={error}
            />
          )}

          {!loading && !error && visibleItems.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((pizza, index) => (
                <PizzaCard
                  key={pizza._id || index}
                  pizza={pizza}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}