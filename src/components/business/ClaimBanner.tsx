
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ClaimBannerProps {
  onClose: () => void;
}

export const ClaimBanner = ({ onClose }: ClaimBannerProps) => {
  return (
    <Card className="mb-8 p-4 bg-primary/10 border-primary">
      <div className="flex justify-between items-center">
        <p className="text-sm">
          Is this your business? <a href="#" className="text-primary font-semibold">Sign up</a> to claim it.
        </p>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>
    </Card>
  );
};
