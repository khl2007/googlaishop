import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Zain Inspired E-Shop.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
            <Twitter className="h-5 w-5" />
          </Link>
          <Link href="#" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
            <Github className="h-5 w-5" />
          </Link>
          <Link href="#" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
