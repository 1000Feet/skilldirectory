
import { Card } from "@/components/ui/card";

interface AboutSectionProps {
  about: string | null;
  description: string | null;
}

export const AboutSection = ({ about, description }: AboutSectionProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">About the Educator</h2>
      <p className="text-gray-600">
        {about || description}
      </p>
    </Card>
  );
};
