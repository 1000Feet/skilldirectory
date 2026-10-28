import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AIChatbotSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function AIChatbotSection({ value, onChange }: AIChatbotSectionProps) {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>AI Chatbot Knowledge Base</Label>
        <p className="text-sm text-gray-600">
          Enter the knowledge base content for your AI chatbot. This information will be used to train your chatbot to answer questions.
        </p>
        <Textarea
          placeholder="Enter information about your services, expertise, teaching methods, and any other relevant details..."
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[200px] resize-y"
        />
      </div>
    </div>
  );
}
