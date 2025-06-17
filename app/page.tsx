import FeaturesSection from "@/components/landing-page/features-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <div className="max-w-screen-md mx-auto text-center font-bold p-4">
        <h1>
          <span className="text-transparent text-4xl md:text-7xl px-2 bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text">
            Tutora
          </span>
          <p className="text-3xl md:text-6xl">Simplify online lessons</p>
        </h1>
      </div>

      <div className="flex justify-center items-center p-2">
        <Button asChild variant="secondary" size="lg" className="text-xl">
          <Link href="/login">Get started</Link>
        </Button>
      </div>

      <FeaturesSection />
    </>
  );
}
