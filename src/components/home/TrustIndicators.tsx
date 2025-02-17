
import { CheckCircle } from "lucide-react";

export const TrustIndicators = () => {
  return (
    <section className="py-8 border-t border-gray-100 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 items-center">
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Verified Educators</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Money Back Guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};
