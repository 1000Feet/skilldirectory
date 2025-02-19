
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ELEVENLABS_VOICES = [
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily' },
];

export const VoiceSelection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice</CardTitle>
        <CardDescription>
          Select the ElevenLabs voice you want to use for the agent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select defaultValue={ELEVENLABS_VOICES[0].id}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ELEVENLABS_VOICES.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
