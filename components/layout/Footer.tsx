import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-[#2A1512] text-orange-50 dark:bg-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-2xl font-black">
            <span className="text-3xl">🍕</span> SliceHub
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-orange-100/70">
            Discover neighborhood pizzerias, order your favourites and track every slice from oven
            to doorstep.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-orange-100/70">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/menu" className="hover:text-white">Browse Menu</Link></li>
            <li><Link href="/sign-up" className="hover:text-white">Join SliceHub</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Accounts</h4>
          <ul className="mt-4 space-y-2 text-sm text-orange-100/70">
            <li><Link href="/customer" className="hover:text-white">Customer Dashboard</Link></li>
            <li><Link href="/vendor" className="hover:text-white">Vendor Dashboard</Link></li>
            <li><Link href="/admin" className="hover:text-white">Admin Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Your account</h4>
          <ul className="mt-4 space-y-2 text-sm text-orange-100/70">
            <li><Link href="/sign-up" className="hover:text-white">Create an account</Link></li>
            <li><Link href="/sign-in" className="hover:text-white">Sign in</Link></li>
            <li><Link href="/customer/orders" className="hover:text-white">Track an order</Link></li>
            <li><Link href="/vendor/subscription" className="hover:text-white">Vendor plans</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-orange-100/50">
        © {new Date().getFullYear()} SliceHub. All rights reserved.
      </div>
    </footer>
  );
}
