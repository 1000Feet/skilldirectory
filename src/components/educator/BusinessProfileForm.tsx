import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { BusinessProfileFormProps } from './types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BusinessProfileForm({ initialData, onSuccess }: BusinessProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    website: initialData?.website || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || user?.email || '',
    about_business: initialData?.about_business || '',
    social: initialData?.social || { facebook: '', instagram: '', youtube: '' },
    ai_chatbot: initialData?.ai_chatbot || { knowledge_base: [] },
    ai_voice_agent: initialData?.ai_voice_agent || { knowledge_base: [], voice_id: 'cjVigY5qzO86Huf0OWal' }
  });

  const [chatbotUrl, setChatbotUrl] = useState('');
  const [voiceAgentUrl, setVoiceAgentUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const profileData = {
        ...formData,
        user_id: user.id,
      };

      const { error } = initialData?.id
        ? await supabase
            .from('business_profiles')
            .update(profileData)
            .eq('id', initialData.id)
        : await supabase
            .from('business_profiles')
            .insert([profileData]);

      if (error) throw error;
      onSuccess?.();
      toast.success(initialData ? 'Profile updated successfully' : 'Profile created successfully');
    } catch (error: any) {
      toast.error('Error saving business profile');
    } finally {
      setLoading(false);
    }
  };

  const addChatbotUrl = () => {
    if (chatbotUrl && !formData.ai_chatbot.knowledge_base.includes(chatbotUrl)) {
      setFormData(prev => ({
        ...prev,
        ai_chatbot: {
          ...prev.ai_chatbot,
          knowledge_base: [...prev.ai_chatbot.knowledge_base, chatbotUrl]
        }
      }));
      setChatbotUrl('');
    }
  };

  const addVoiceAgentUrl = () => {
    if (voiceAgentUrl && !formData.ai_voice_agent.knowledge_base.includes(voiceAgentUrl)) {
      setFormData(prev => ({
        ...prev,
        ai_voice_agent: {
          ...prev.ai_voice_agent,
          knowledge_base: [...prev.ai_voice_agent.knowledge_base, voiceAgentUrl]
        }
      }));
      setVoiceAgentUrl('');
    }
  };

  const removeChatbotUrl = (url: string) => {
    setFormData(prev => ({
      ...prev,
      ai_chatbot: {
        ...prev.ai_chatbot,
        knowledge_base: prev.ai_chatbot.knowledge_base.filter(u => u !== url)
      }
    }));
  };

  const removeVoiceAgentUrl = (url: string) => {
    setFormData(prev => ({
      ...prev,
      ai_voice_agent: {
        ...prev.ai_voice_agent,
        knowledge_base: prev.ai_voice_agent.knowledge_base.filter(u => u !== url)
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aboutBusiness">About Your Business</Label>
          <Textarea
            id="aboutBusiness"
            value={formData.about_business}
            onChange={(e) => setFormData(prev => ({ ...prev, about_business: e.target.value }))}
            className="h-32"
          />
        </div>

        <div className="space-y-2">
          <Label>Social Media</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Facebook URL"
              value={formData.social.facebook}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                social: { ...prev.social, facebook: e.target.value }
              }))}
            />
            <Input
              placeholder="Instagram URL"
              value={formData.social.instagram}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                social: { ...prev.social, instagram: e.target.value }
              }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Introduction Video</Label>
          <Input
            placeholder="YouTube Video URL"
            value={formData.social.youtube}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              social: { ...prev.social, youtube: e.target.value }
            }))}
          />
          <p className="text-sm text-gray-600">Add the URL of your introductory video from YouTube</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI Chatbot</h3>
          <p className="text-sm text-gray-600">Provide URLs or documents to help the chatbot answer questions more accurately.</p>
          
          <div className="flex gap-2">
            <Input
              placeholder="Enter URL or upload document"
              value={chatbotUrl}
              onChange={(e) => setChatbotUrl(e.target.value)}
            />
            <Button type="button" onClick={addChatbotUrl}>Add</Button>
          </div>
          
          <div className="space-y-2">
            {formData.ai_chatbot.knowledge_base.map((url, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm truncate flex-1">{url}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChatbotUrl(url)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI Voice Agent</h3>
          <p className="text-sm text-gray-600">Select a voice and provide knowledge base for the voice agent.</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select
                value={formData.ai_voice_agent.voice_id}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  ai_voice_agent: { ...prev.ai_voice_agent, voice_id: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cjVigY5qzO86Huf0OWal">Eric</SelectItem>
                  <SelectItem value="CwhRBWXzGAHq8TQ4Fs17">Roger</SelectItem>
                  <SelectItem value="EXAVITQu4vr4xnSDxMaL">Sarah</SelectItem>
                  <SelectItem value="IKne3meq5aSn9XLyUdCD">Charlie</SelectItem>
                  <SelectItem value="XB0fDUnXU5powFXDhCwa">Charlotte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter URL or upload document"
                value={voiceAgentUrl}
                onChange={(e) => setVoiceAgentUrl(e.target.value)}
              />
              <Button type="button" onClick={addVoiceAgentUrl}>Add</Button>
            </div>
            
            <div className="space-y-2">
              {formData.ai_voice_agent.knowledge_base.map((url, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm truncate flex-1">{url}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVoiceAgentUrl(url)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Update Profile'}
      </Button>
    </form>
  );
}
