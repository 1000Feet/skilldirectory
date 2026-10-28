import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ImageIcon, Heart, Star, Loader2, CircleDot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface EducatorProfile {
  id: string;
  name: string;
  description: string;
  image: string;
  categories: string[];
  address: string;
  distance?: {
    miles: number;
    kilometers: number;
  } | null;
  is_active: boolean;
}

interface BusinessCardProps {
  profile: EducatorProfile;
  showDistance?: boolean;
}

export function BusinessCard({ profile, showDistance = false }: BusinessCardProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isUserOnline } = useOnlineStatus();
  const isStudent = user?.user_metadata?.user_type === 'student';
  
  // Create URL-friendly slug from business name
  const createSlug = (name: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      // Replace ampersand with 'and' before general replacement
      .replace(/&/g, 'and')
      // Then replace all non-alphanumeric characters with hyphens
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const { data: reviewsData, error } = await supabase
          .from('educator_profiles')
          .select('reviews:reviews(*)')
          .eq('id', profile.id)
          .single();

        if (!error && reviewsData?.reviews) {
          const reviews = reviewsData.reviews;
          setReviewCount(reviews.length);
          if (reviews.length > 0) {
            const avg = reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviews.length;
            setAverageRating(Math.round(avg * 10) / 10);
          }
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    if (profile.id) {
      fetchRatings();
    }
  }, [profile.id]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card navigation
    if (profile.id) {
      toggleFavorite(profile.id);
    }
  };

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow duration-300 mb-4 relative">
      <div className="w-full h-48 md:w-48 md:h-48 flex-shrink-0 bg-gray-50">
        {profile.image ? (
          <img 
            src={profile.image} 
            alt={profile.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/192?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      <CardContent className="flex-1 p-4 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-2 line-clamp-1">{profile.name}</h3>
              {profile.id && isUserOnline(profile.id) && (
                <div className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                  <CircleDot className="h-3 w-3 fill-green-600" />
                  <span>Online</span>
                </div>
              )}
            </div>
            {isStudent && profile.id && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9 shrink-0"
                onClick={handleFavoriteClick}
              >
                <Heart 
                  className={cn(
                    "h-5 w-5",
                    isFavorite(profile.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                  )} 
                />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-sm md:text-base line-clamp-2">{profile.description || 'No description available'}</p>
          <div className="flex items-center gap-1 text-sm mt-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span>{averageRating || 0}</span>
            <span className="text-gray-500">({reviewCount})</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4">
          <div className="inline-flex items-center">
            {showDistance && profile.distance && (
              <span className="inline-flex items-center rounded-full bg-gray-600 px-3 py-1 text-xs md:text-sm text-white">
                {`${profile.distance.miles.toFixed(1)} Miles Away`}
              </span>
            )}
          </div>
          <Link 
            to={`/educator/${encodeURIComponent(createSlug(profile.name))}`}
            state={{ id: profile.id }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#88C440] text-primary-foreground hover:bg-[#78ac37] h-9 px-4 py-2 w-full sm:w-auto"
          >
            DETAILS
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
