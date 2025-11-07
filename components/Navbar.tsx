"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react"; // Icon for mobile menu

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
];

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 ">
      <nav className="w-full max-w-5xl mx-auto py-3 px-3 flex justify-between items-center bg-transparent backdrop-blur-2xl text-card-foreground rounded-full shadow-lg border">
        <Link href="/" className="text-xl font-bold ml-3">
          Logo
        </Link>

        <div className="hidden md:flex gap-2">
          {navItems.map((item) => (
            <Button key={item.label} asChild variant="ghost" className="hover:rounded-full">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>

        <div className="hidden md:flex gap-2 mr-1">
          <Button asChild variant="ghost">
            <Link href="/sign-in">Login</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="text-lg py-2 px-3 rounded-md hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}

                <hr className="border-border my-4" />

                <SheetClose asChild>
                  <Button
                    asChild
                    variant="ghost"
                    className="justify-start text-lg py-2 px-3"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="justify-start text-lg py-2 px-3">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
