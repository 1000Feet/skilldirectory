
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Video, Calendar } from "lucide-react";

export const ActionCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold">Chat with AI Assistant</h3>
          <p className="text-sm text-gray-600">Ask about our services to our AI Voice Agent!</p>
          <Button variant="outline" className="w-full">Start Chat</Button>
        </div>
      </Card>

      <Card className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold">Watch Our Studio</h3>
          <p className="text-sm text-gray-600">YouTube video presentation of our work</p>
          <Button variant="outline" className="w-full">Watch Video</Button>
        </div>
      </Card>

      <Card className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-green-50 to-green-100">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold">Book a Lesson</h3>
          <p className="text-sm text-gray-600">Free introductory lesson (in person or online)</p>
          <Button variant="outline" className="w-full">Schedule Now</Button>
        </div>
      </Card>
    </div>
  );
};
