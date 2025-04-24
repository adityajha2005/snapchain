import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border-t border-border">
      <div className="mb-6">
        <Logo iconOnly  className="text-emerald-900 size-8"/>
      </div>
      <h2 className="text-4xl font-semibold mb-2">Build with SnapChain</h2>
      <p className="text-lg mb-8 text-muted-foreground">Develop Solana applications faster and more securely. Get started today.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/start-building" 
          className="px-6 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center justify-center border border-border"
        >
          Start Building
          <ArrowRight className="ml-2 size-4" />
        </Link>
        <Link 
          href="/documentation" 
          className="px-6 py-2 border border-border text-foreground hover:bg-muted transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default CTA;
