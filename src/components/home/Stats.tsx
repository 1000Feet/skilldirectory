
import { Users, GraduationCap, Trophy, CheckCircle } from "lucide-react";

export const Stats = () => {
  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
        <div className="text-center p-6 space-y-2 animate-fadeIn">
          <Users className="w-8 h-8 mx-auto text-primary mb-2" />
          <h3 className="text-3xl font-bold text-gray-900">5,000+</h3>
          <p className="text-gray-600">Active Educators</p>
        </div>
        <div className="text-center p-6 space-y-2 animate-fadeIn [animation-delay:200ms]">
          <GraduationCap className="w-8 h-8 mx-auto text-primary mb-2" />
          <h3 className="text-3xl font-bold text-gray-900">20,000+</h3>
          <p className="text-gray-600">Students Taught</p>
        </div>
        <div className="text-center p-6 space-y-2 animate-fadeIn [animation-delay:400ms]">
          <Trophy className="w-8 h-8 mx-auto text-primary mb-2" />
          <h3 className="text-3xl font-bold text-gray-900">4.8/5</h3>
          <p className="text-gray-600">Average Rating</p>
        </div>
        <div className="text-center p-6 space-y-2 animate-fadeIn [animation-delay:600ms]">
          <CheckCircle className="w-8 h-8 mx-auto text-primary mb-2" />
          <h3 className="text-3xl font-bold text-gray-900">98%</h3>
          <p className="text-gray-600">Satisfaction Rate</p>
        </div>
      </div>
    </section>
  );
};
