import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-transparent bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            <span className="text-2xl font-bold font-headline">Zain</span>
          </Link>
          <p className="mt-4 text-sm text-sidebar-foreground/70">
            Your destination for the latest in tech.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Link href="#" target="_blank" rel="noreferrer" className="hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" target="_blank" rel="noreferrer" className="hover:text-primary">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" target="_blank" rel="noreferrer" className="hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2">
            <h3 className="font-bold">Shop</h3>
            <Link href="/products" className="text-sm text-sidebar-foreground/70 hover:text-primary">All Products</Link>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">Smartphones</Link>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">Laptops</Link>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">Accessories</Link>
        </div>

        <div className="flex flex-col gap-2">
            <h3 className="font-bold">About</h3>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">About Us</Link>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">Careers</Link>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">Press</Link>
        </div>
        
        <div className="flex flex-col gap-2">
            <h3 className="font-bold">Support</h3>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">Contact</Link>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">FAQ</Link>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">Shipping</Link>
        </div>
        
         <div className="flex flex-col gap-2">
            <h3 className="font-bold">Legal</h3>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm text-sidebar-foreground/70 hover:text-primary">Terms of Service</Link>
        </div>
      </div>
       <div className="border-t border-sidebar-border/50">
        <div className="container mx-auto py-4 text-center text-xs text-sidebar-foreground/50">
          <p>&copy; {new Date().getFullYear()} Zain. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
