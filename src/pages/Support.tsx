import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@supabase/supabase-js';
import { SEO } from "@/components/SEO";
import { getPageSEO } from "@/config/seoConfig";

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  issueType: z.enum(["general", "bug", "feature", "account", "other"], {
    required_error: "Please select an issue type",
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const SupportPage = () => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      issueType: "general",
      message: "",
    },
  });

  const sendSupportEmail = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-support-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
            "apikey": supabaseAnonKey
          },
          body: JSON.stringify({
            userEmail: {
              to: values.email,
              subject: `SkillDirectory Support - ${values.issueType.charAt(0).toUpperCase() + values.issueType.slice(1)} Issue`,
              html: `
                <h2>Thank you for contacting SkillDirectory Support</h2>
                <p>We have received your support request and will get back to you as soon as possible.</p>
                <h3>Your Request Details:</h3>
                <p><strong>Name:</strong> ${values.firstName} ${values.lastName}</p>
                <p><strong>Issue Type:</strong> ${values.issueType}</p>
                <p><strong>Message:</strong></p>
                <p>${values.message}</p>
                <br>
                <p>Best regards,</p>
                <p>The SkillDirectory Support Team</p>
              `,
              firstName: values.firstName,
              lastName: values.lastName
            },
            adminEmail: {
              subject: `New Support Request - ${values.issueType}`,
              html: `
                <h2>New Support Request Received</h2>
                <p><strong>From:</strong> ${values.firstName} ${values.lastName} (${values.email})</p>
                <p><strong>Issue Type:</strong> ${values.issueType}</p>
                <p><strong>Message:</strong></p>
                <p>${values.message}</p>
              `
            }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to send emails:", response.status, errorData);
        throw new Error('Failed to send emails');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send confirmation email');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Send emails using Edge Function (which also stores in database)
      await sendSupportEmail(values);

      toast({
        title: "Support request submitted",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting support request:", error);
      toast({
        title: "Error",
        description: "Failed to submit support request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SEO {...getPageSEO('support')} />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50 py-16" role="main" aria-label="Support Form">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                <span className="text-primary">SKILL</span>DIRECTORY Support
                <span className="text-neutral-700"> – Get Help with Your Account & Listings</span>
              </h1>
              <p className="text-lg text-gray-600 mt-4">
                Need assistance? Our support team is here to help you with any questions or concerns.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <Label>First Name <span className="text-red-500">*</span></Label>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Last Name <span className="text-red-500">*</span></Label>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Email <span className="text-red-500">*</span></Label>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issueType"
                  render={({ field }) => (
                    <FormItem>
                      <Label>What can we help you with today? <span className="text-red-500">*</span></Label>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="general" id="general" />
                            <Label htmlFor="general">General question</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="feature" id="feature" />
                            <Label htmlFor="feature">Feature request</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bug" id="bug" />
                            <Label htmlFor="bug">Bug report</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="account" id="account" />
                            <Label htmlFor="account">My account</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Issues / Message <span className="text-red-500">*</span></Label>
                      <FormControl>
                        <Textarea 
                          placeholder="Please describe your issue or message..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-32">Submit</Button>
              </form>
            </Form>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SupportPage;