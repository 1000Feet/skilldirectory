import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReviewReaction {
  id: string;
  review_id: string;
  user_id: string;
  reaction_type: 'like' | 'dislike';
}

interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  reply_text: string;
  created_at: string;
}

export const useReviewInteractions = (reviewId: string) => {
  const [reactions, setReactions] = useState<ReviewReaction[]>([]);
  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [userReaction, setUserReaction] = useState<ReviewReaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInteractions();
  }, [reviewId]);

  const fetchInteractions = async () => {
    try {
      const [reactionsResponse, repliesResponse] = await Promise.all([
        supabase
          .from('review_reactions')
          .select('*')
          .eq('review_id', reviewId),
        supabase
          .from('review_replies')
          .select('*')
          .eq('review_id', reviewId)
          .order('created_at', { ascending: true })
      ]);

      if (reactionsResponse.error) throw reactionsResponse.error;
      if (repliesResponse.error) throw repliesResponse.error;

      setReactions((reactionsResponse.data || []) as ReviewReaction[]);
      setReplies(repliesResponse.data || []);

      // Get current user's reaction if they're logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userReaction = reactionsResponse.data?.find(r => r.user_id === user.id) || null;
        setUserReaction(userReaction as ReviewReaction | null);
      }
    } catch (error) {
      console.error('Error fetching review interactions:', error);
      toast.error('Failed to load review interactions');
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (type: 'like' | 'dislike') => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error('Please sign in to react to reviews');
        return;
      }

      if (userReaction) {
        if (userReaction.reaction_type === type) {
          // Remove reaction if clicking the same type
          const { error } = await supabase
            .from('review_reactions')
            .delete()
            .eq('id', userReaction.id);

          if (error) throw error;
          setUserReaction(null);
        } else {
          // Update reaction type if different
          const { error } = await supabase
            .from('review_reactions')
            .update({ reaction_type: type })
            .eq('id', userReaction.id);

          if (error) throw error;
          setUserReaction({ ...userReaction, reaction_type: type });
        }
      } else {
        // Add new reaction
        const { data, error } = await supabase
          .from('review_reactions')
          .insert({
            review_id: reviewId,
            user_id: user.id,
            reaction_type: type
          })
          .select()
          .single();

        if (error) throw error;
        setUserReaction(data as ReviewReaction);
      }

      await fetchInteractions();
    } catch (error) {
      console.error('Error managing reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  const addReply = async (replyText: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error('Please sign in to reply to reviews');
        return;
      }

      const { error } = await supabase
        .from('review_replies')
        .insert({
          review_id: reviewId,
          user_id: user.id,
          reply_text: replyText
        });

      if (error) throw error;
      await fetchInteractions();
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const deleteReply = async (replyId: string) => {
    try {
      const { error } = await supabase
        .from('review_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
      await fetchInteractions();
      toast.success('Reply deleted successfully');
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply');
    }
  };

  const updateReply = async (replyId: string, newText: string) => {
    try {
      const { error } = await supabase
        .from('review_replies')
        .update({ reply_text: newText })
        .eq('id', replyId);

      if (error) throw error;
      await fetchInteractions();
      toast.success('Reply updated successfully');
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Failed to update reply');
    }
  };

  return {
    reactions,
    replies,
    userReaction,
    loading,
    addReaction,
    addReply,
    deleteReply,
    updateReply,
    getLikeCount: () => reactions.filter(r => r.reaction_type === 'like').length,
    getDislikeCount: () => reactions.filter(r => r.reaction_type === 'dislike').length
  };
}; 