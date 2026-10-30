import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  icon_name: string;
  is_active: boolean;
  display_order: number;
}

interface CategorySelectionProps {
  categories?: string[];
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export function CategorySelection({ selectedCategories, onChange }: CategorySelectionProps) {
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        setAvailableCategories(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    onChange(newCategories);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Categories</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {loading ? (
          <div className="col-span-full text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : availableCategories.length > 0 ? (
          availableCategories.map((category) => (
            <Button
              key={category.id}
              type="button"
              variant="outline"
              className={cn(
                "justify-start gap-2",
                selectedCategories.includes(category.name) && "bg-primary/5 text-primary"
              )}
              onClick={() => toggleCategory(category.name)}
            >
              {selectedCategories.includes(category.name) && (
                <Check className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{category.name}</span>
            </Button>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground">
            No categories available
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Select all categories that apply to your business
      </p>
    </div>
  );
}
