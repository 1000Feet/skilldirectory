import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Music,
  Palette,
  Utensils,
  Dog,
  Dumbbell,
  TreePine,
  Car,
  Target,
  Hammer,
  Waves,
  LucideIcon,
  Swords,
  Stethoscope,
  Smartphone,
  Mic2,
  Briefcase,
  Trophy,
  Sprout,
  Scissors,
  Globe,
  HelpCircle
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  icon_name: string;
  is_active: boolean;
  display_order: number;
}

// Map icon_name strings to Lucide icon components
const iconMap: Record<string, LucideIcon> = {
  // Updated icon mappings for each category
  'palette': Palette,           // Creative Arts
  'utensils': Utensils,         // Culinary Arts
  'dog': Dog,                   // Domestic Animals
  'stethoscope': Stethoscope,   // Health & First Aid
  'swords': Swords,             // Martial Arts
  'hammer': Hammer,             // Metal & Woodworking
  'smartphone': Smartphone,     // Mobile app development
  'car': Car,                   // Motor Sports
  'music': Music,               // Musical Instruments
  'tree-pine': TreePine,        // Outdoor Recreation
  'mic2': Mic2,                 // Performing Arts
  'dumbbell': Dumbbell,         // Personal Fitness
  'briefcase': Briefcase,       // Professional Development
  'target': Target,             // Shooting Sports
  'trophy': Trophy,             // Sports Training
  'sprout': Sprout,             // Sustainable Gardening
  'scissors': Scissors,         // Textile crafts
  'waves': Waves,               // Water Sports & Recreation
  'globe': Globe,               // Web
  'help-circle': HelpCircle     // Other
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;

        // Map the database records to our Category interface with icons
        const mappedCategories = data.map(category => {
          // Map category names to appropriate icons if icon_name is not set
          let iconKey = category.icon_name?.toLowerCase();
          
          // If no icon_name is set or it doesn't match our map, assign based on category name
          if (!iconKey || !iconMap[iconKey]) {
            const name = category.name.toLowerCase();
            if (name.includes('creative arts')) iconKey = 'palette';
            else if (name.includes('culinary')) iconKey = 'utensils';
            else if (name.includes('domestic animals')) iconKey = 'dog';
            else if (name.includes('health')) iconKey = 'stethoscope';
            else if (name.includes('martial arts')) iconKey = 'swords';
            else if (name.includes('metal') || name.includes('woodworking')) iconKey = 'hammer';
            else if (name.includes('mobile app')) iconKey = 'smartphone';
            else if (name.includes('motor sports')) iconKey = 'car';
            else if (name.includes('music')) iconKey = 'music';
            else if (name.includes('outdoor recreation')) iconKey = 'tree-pine';
            else if (name.includes('performing arts')) iconKey = 'mic2';
            else if (name.includes('fitness')) iconKey = 'dumbbell';
            else if (name.includes('professional development')) iconKey = 'briefcase';
            else if (name.includes('shooting')) iconKey = 'target';
            else if (name.includes('sports training')) iconKey = 'trophy';
            else if (name.includes('garden')) iconKey = 'sprout';
            else if (name.includes('textile')) iconKey = 'scissors';
            else if (name.includes('water sports')) iconKey = 'waves';
            else if (name.includes('web')) iconKey = 'globe';
            else iconKey = 'help-circle'; // Default for "Other" or unmatched categories
          }

          return {
            ...category,
            icon: iconMap[iconKey] || HelpCircle // Fallback to HelpCircle icon
          };
        });

        setCategories(mappedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
