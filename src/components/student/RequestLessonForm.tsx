
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const requestLessonSchema = z.object({
  proposedDate: z.date({
    required_error: "Please select a date and time",
  }),
  message: z.string().optional(),
});

type RequestLessonForm = z.infer<typeof requestLessonSchema>;

interface RequestLessonFormProps {
  educatorId: string;
  educatorProfileId: string;
}

export function RequestLessonForm({ educatorId, educatorProfileId }: RequestLessonFormProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const form = useForm<RequestLessonForm>({
    resolver: zodResolver(requestLessonSchema),
  });

  const onSubmit = async (data: RequestLessonForm) => {
    try {
      if (!user) {
        toast.error("Please sign in to request a lesson");
        return;
      }

      const { error } = await supabase
        .from('lesson_requests')
        .insert({
          student_id: user.id,
          educator_id: educatorId,
          educator_profile_id: educatorProfileId,
          proposed_date: data.proposedDate.toISOString(),
          message: data.message || null,
        });

      if (error) throw error;

      toast.success("Lesson request sent successfully!");
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Error submitting lesson request:', error);
      toast.error("Failed to send lesson request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Schedule Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a Lesson</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="proposedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date and Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Educator</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a message to the educator..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Send Request
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
