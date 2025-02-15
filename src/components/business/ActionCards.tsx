
import { Button } from "@/components/ui/button";
import { MessageSquare, Video, Calendar } from "lucide-react";

export const ActionCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-6 bg-[#F9FBF7] rounded-lg border hover:shadow-md transition-all">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-[#F2F7ED] rounded-full">
            <MessageSquare className="w-6 h-6 text-[#70B62C]" />
          </div>
          <h3 className="font-semibold">Chat with AI Assistant</h3>
          <p className="text-sm text-gray-600">Ask about our services to our AI Voice Agent!</p>
          <Button variant="outline" className="w-full">Start Chat</Button>
        </div>
      </div>

      <div className="p-6 bg-[#F9FBF7] rounded-lg border hover:shadow-md transition-all">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-[#F2F7ED] rounded-full">
            <Video className="w-6 h-6 text-[#70B62C]" />
          </div>
          <h3 className="font-semibold">Watch Our Studio</h3>
          <p className="text-sm text-gray-600">YouTube video presentation of our work</p>
          <Button variant="outline" className="w-full">Watch Video</Button>
        </div>
      </div>

      <div className="p-6 bg-[#F9FBF7] rounded-lg border hover:shadow-md transition-all">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-[#F2F7ED] rounded-full">
            <Calendar className="w-6 h-6 text-[#70B62C]" />
          </div>
          <h3 className="font-semibold">Book a Lesson</h3>
          <p className="text-sm text-gray-600">Free introductory lesson (in person or online)</p>
          <Button variant="outline" className="w-full">Schedule Now</Button>
        </div>
      </div>
    </div>
  );
};
