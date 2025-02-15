
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ClaimBannerProps {
  onClose: () => void;
}

export const ClaimBanner = ({ onClose }: ClaimBannerProps) => {
  return (
    <div className="bg-[#F2F7ED] p-4 rounded-lg flex justify-between items-center">
      <p className="text-sm">
        Is this your business? <a href="#" className="text-[#70B62C] hover:underline">Sign up</a> to claim it.
      </p>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onClose}
        className="p-0 h-auto hover:bg-transparent"
      >
        <X className="h-4 w-4 text-gray-500" />
      </Button>
    </div>
  );
};
