import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface HeroProps {
  onSearch?: (query: string) => void;
  onReset?: () => void;
  hasSearchResults?: boolean;
  searchQuery?: string;
}

export function Hero({ onSearch, onReset, hasSearchResults, searchQuery }: HeroProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleReset = () => {
    const input = document.querySelector('input[name="search"]') as HTMLInputElement;
    input.value = '';
    if (onReset) {
      onReset();
    }
  };

  return (
    <section className="relative overflow-hidden bg-primary" aria-label="Find educators and learning opportunities">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-[40px] lg:px-[16px]">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Connect with Expert Educators & Learn New Skills
          </h1>
          <p className="mt-6 text-lg leading-8 text-white">
            Join our educational collaboration platform connecting students with expert teachers for personalized learning experiences
          </p>
          <form 
            onSubmit={handleSubmit} 
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            role="search"
            aria-label="Search for educators or skills"
          >
            <div className="relative w-full max-w-xs">
              <Input 
                type="search" 
                name="search"
                defaultValue={searchQuery}
                placeholder="Search for tutors, mentors, or skills..." 
                className="w-full" 
                aria-label="Search educators and skills"
              />
              {hasSearchResults && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
            <Button 
              type="submit" 
              className="bg-white text-primary hover:bg-white/90"
              aria-label="Start searching for educators"
            >
              Find Educators
            </Button>
          </form>
          <div className="mt-6 text-sm text-white/80">
            <p>Popular searches: virtual classrooms, online tutoring, teacher mentoring, educational resources</p>
          </div>
        </div>
      </div>
    </section>
  );
}
