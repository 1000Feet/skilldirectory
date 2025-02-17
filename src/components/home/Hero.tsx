
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-blue-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            *** DEPLOYMENT TEST FEB 21 ***
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            If you can see this message and blue background, the deployment is working!
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Input 
              type="text" 
              placeholder="Search skills or educators..." 
              className="max-w-xs"
            />
            <Button>
              Find Skills
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
