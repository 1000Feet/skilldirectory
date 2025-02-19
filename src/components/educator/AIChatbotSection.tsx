import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface AIChatbot {
  knowledge_base: string[];
}

interface AIChatbotSectionProps {
  chatbot: AIChatbot;
  onChange: (chatbot: AIChatbot) => void;
}

export function AIChatbotSection({ chatbot, onChange }: AIChatbotSectionProps) {
  const [newUrl, setNewUrl] = useState('');

  const addUrl = () => {
    if (newUrl && !chatbot.knowledge_base.includes(newUrl)) {
      onChange({
        ...chatbot,
        knowledge_base: [...chatbot.knowledge_base, newUrl]
      });
      setNewUrl('');
    }
  };

  const removeUrl = (urlToRemove: string) => {
    onChange({
      ...chatbot,
      knowledge_base: chatbot.knowledge_base.filter(url => url !== urlToRemove)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>AI Chatbot Knowledge Base</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add URL to knowledge base"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <Button 
            type="button"
            onClick={addUrl}
            variant="outline"
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {chatbot.knowledge_base.map((url, index) => (
          <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
            <span className="flex-1 truncate text-sm">{url}</span>
            <Button
              type="button"
              onClick={() => removeUrl(url)}
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
