import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <Briefcase className="h-8 w-8" />
          <span>ResumAI</span>
        </Link>
        {/* Navigation items can be added here if needed */}
      </div>
    </header>
  );
}
