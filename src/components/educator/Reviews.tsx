import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReviews } from '@/hooks/useReviews';
import { useReviewInteractions } from '@/hooks/useReviewInteractions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Trash, Edit, LogIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ReviewsProps {
  educatorId: string;
}

export const Reviews = ({ educatorId }: ReviewsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reviews, userReview, averageRating, loading, addReview, updateReview, deleteReview, isStudent } = useReviews(educatorId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(userReview?.rating || 5);
  const [reviewText, setReviewText] = useState(userReview?.review_text || '');
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState('');

  const handleLoginRedirect = () => {
    navigate('/auth', { state: { from: window.location.pathname } });
  };

  const handleSubmit = async () => {
    if (userReview) {
      await updateReview(rating, reviewText);
    } else {
      await addReview(rating, reviewText);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    await deleteReview();
    setIsDialogOpen(false);
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(null) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
              star <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            disabled={!interactive}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: any }) => {
    const { 
      reactions, 
      replies, 
      userReaction, 
      addReaction, 
      addReply, 
      deleteReply, 
      updateReply,
      getLikeCount,
      getDislikeCount
    } = useReviewInteractions(review.id);

    return (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{review.student_name || 'Anonymous'}</span>
            {renderStars(review.rating)}
          </div>
          <span className="text-sm text-gray-500">
            {format(new Date(review.created_at), 'MMM d, yyyy')}
          </span>
        </div>
        
        {review.review_text && (
          <p className="text-gray-700">{review.review_text}</p>
        )}

        <div className="flex items-center gap-4 pt-2">
          {user ? (
            <>
              <button
                onClick={() => addReaction('like')}
                className={`flex items-center gap-1 ${
                  userReaction?.reaction_type === 'like' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{getLikeCount()}</span>
              </button>
              
              <button
                onClick={() => addReaction('dislike')}
                className={`flex items-center gap-1 ${
                  userReaction?.reaction_type === 'dislike' ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>{getDislikeCount()}</span>
              </button>

              <button
                onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                className="flex items-center gap-1 text-gray-500"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Reply</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 text-gray-500">
                <ThumbsUp className="h-4 w-4" />
                <span>{getLikeCount()}</span>
              </div>
              
              <div className="flex items-center gap-1 text-gray-500">
                <ThumbsDown className="h-4 w-4" />
                <span>{getDislikeCount()}</span>
              </div>

              <button
                onClick={handleLoginRedirect}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
              >
                <LogIn className="h-4 w-4" />
                <span>Login to interact</span>
              </button>
            </>
          )}
        </div>

        {replyingTo === review.id && (
          <div className="mt-2 space-y-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await addReply(replyText);
                  setReplyingTo(null);
                  setReplyText('');
                }}
                disabled={!replyText.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        )}

        {replies.length > 0 && (
          <div className="ml-8 mt-4 space-y-4">
            {replies.map((reply) => (
              <div key={reply.id} className="border-l-2 border-gray-200 pl-4 py-2">
                {editingReply === reply.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editReplyText}
                      onChange={(e) => setEditReplyText(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingReply(null);
                          setEditReplyText('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          await updateReply(reply.id, editReplyText);
                          setEditingReply(null);
                          setEditReplyText('');
                        }}
                        disabled={!editReplyText.trim()}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Reply</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(reply.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{reply.reply_text}</p>
                    {user?.id === reply.user_id && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setEditingReply(reply.id);
                            setEditReplyText(reply.reply_text);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteReply(reply.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="animate-pulse">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-400 fill-current" />
            <span className="text-2xl font-bold">{averageRating || 0}</span>
          </div>
          <span className="text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
        </div>
        
        {user ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={userReview ? "outline" : "default"}>
                {userReview ? 'Edit Review' : 'Write Review'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{userReview ? 'Edit Your Review' : 'Write a Review'}</DialogTitle>
                <DialogDescription>
                  Share your experience with this educator
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex justify-center">
                  {renderStars(rating, true)}
                </div>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review here..."
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  {userReview && (
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  )}
                  <Button onClick={handleSubmit}>
                    {userReview ? 'Update' : 'Submit'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button onClick={handleLoginRedirect}>
            Login to Write Review
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};
