import { Hero } from "@/components/home/hero";
import { FeaturedPizzas } from "@/components/home/featured-pizzas";
import { Categories } from "@/components/home/categories";
import { WhyUs } from "@/components/home/why-us";
import { HowItWorks } from "@/components/home/how-it-works";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturedPizzas />
      <Categories />
      <WhyUs />
      <HowItWorks />
    </main>
  );
}
