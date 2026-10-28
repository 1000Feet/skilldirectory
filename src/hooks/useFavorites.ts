import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export const useFavorites = () => {
  const { user, userType } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user || userType !== 'student') {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data: studentProfile, error: studentError } = await supabase
        .from('student_profiles')
        .select('id, favorites')
        .eq('user_id', user.id)
        .single();

      if (studentError) {
        console.error('Error fetching favorites:', studentError);
        toast.error('Failed to load favorites');
        return;
      }

      // Handle case where favorites column doesn't exist yet
      setFavorites(studentProfile?.favorites || []);
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [user, userType]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (educatorId: string) => {
    if (!user || userType !== 'student') {
      toast.error('Please sign in as a student to favorite educators');
      return;
    }

    try {
      const { data: studentProfile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id, favorites')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const currentFavorites = studentProfile?.favorites || [];
      const newFavorites = currentFavorites.includes(educatorId)
        ? currentFavorites.filter(id => id !== educatorId)
        : [...currentFavorites, educatorId];

      const { error } = await supabase
        .from('student_profiles')
        .update({ favorites: newFavorites })
        .eq('id', studentProfile.id);

      if (error) throw error;

      setFavorites(newFavorites);
      toast.success(
        currentFavorites.includes(educatorId)
          ? 'Removed from favorites'
          : 'Added to favorites'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const isFavorite = (educatorId: string) => favorites.includes(educatorId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    fetchFavorites
  };
};
