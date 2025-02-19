
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VoiceAgent {
  knowledge_base: string[];
  voice_id: string;
}

interface VoiceAgentSectionProps {
  voiceAgent: VoiceAgent;
  onChange: (voiceAgent: VoiceAgent) => void;
}

export function VoiceAgentSection({ voiceAgent, onChange }: VoiceAgentSectionProps) {
  const [newUrl, setNewUrl] = useState('');

  const addUrl = () => {
    if (newUrl && !voiceAgent.knowledge_base.includes(newUrl)) {
      onChange({
        ...voiceAgent,
        knowledge_base: [...voiceAgent.knowledge_base, newUrl]
      });
      setNewUrl('');
    }
  };

  const removeUrl = (urlToRemove: string) => {
    onChange({
      ...voiceAgent,
      knowledge_base: voiceAgent.knowledge_base.filter(url => url !== urlToRemove)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Voice Selection</Label>
        <Select
          value={voiceAgent.voice_id}
          onValueChange={(value) => onChange({ ...voiceAgent, voice_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cjVigY5qzO86Huf0OWal">Eric (Default)</SelectItem>
            <SelectItem value="21m00Tcm4TlvDq8ikWAM">Rachel</SelectItem>
            <SelectItem value="AZnzlk1XvdvUeBnXmlld">Domi</SelectItem>
            <SelectItem value="EXAVITQu4vr4xnSDxMaL">Bella</SelectItem>
            <SelectItem value="MF3mGyEYCl7XYWbV9V6O">Dave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Voice Agent Knowledge Base</Label>
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
        {voiceAgent.knowledge_base.map((url, index) => (
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
