import { LayoutGrid, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface ViewToggleProps {
  view: 'grid' | 'map';
  onViewChange: (view: 'grid' | 'map') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <ToggleGroup type="single" value={view} onValueChange={(value) => value && onViewChange(value as 'grid' | 'map')}>
      <ToggleGroupItem value="grid" aria-label="Grid View">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="map" aria-label="Map View">
        <Map className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
} 