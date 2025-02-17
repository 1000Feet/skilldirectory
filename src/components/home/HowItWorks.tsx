
import { ArrowRight } from "lucide-react";

export const HowItWorks = () => {
  return (
    <section className="py-6 bg-[#F1F1F1]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -top-4 left-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
            <h3 className="text-xl font-semibold mb-3 mt-2">Search Educators</h3>
            <p className="text-gray-600 mb-4">Browse through our verified educators and find the perfect match for your learning needs.</p>
            <ArrowRight className="w-5 h-5 text-primary absolute bottom-6 right-6" />
          </div>
          <div className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -top-4 left-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
            <h3 className="text-xl font-semibold mb-3 mt-2">Connect & Learn</h3>
            <p className="text-gray-600 mb-4">Schedule sessions and start learning with personalized attention from expert educators.</p>
            <ArrowRight className="w-5 h-5 text-primary absolute bottom-6 right-6" />
          </div>
          <div className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -top-4 left-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
            <h3 className="text-xl font-semibold mb-3 mt-2">Achieve Goals</h3>
            <p className="text-gray-600 mb-4">Track your progress and celebrate achievements as you master new skills.</p>
            <ArrowRight className="w-5 h-5 text-primary absolute bottom-6 right-6" />
          </div>
        </div>
      </div>
    </section>
  );
};
