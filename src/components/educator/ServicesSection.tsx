
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EducatorService, ServiceFormData } from './types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ServicesSectionProps {
  educator_profile_id: string;
}

export const ServicesSection = ({ educator_profile_id }: ServicesSectionProps) => {
  const [services, setServices] = useState<EducatorService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingService, setIsAddingService] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    category: '',
    max_students: 1,
    location_type: 'online',
    status: 'draft'
  });

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('educator_services')
        .select('*')
        .eq('educator_profile_id', educator_profile_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('educator_services')
        .insert({
          ...formData,
          educator_profile_id
        })
        .select()
        .single();

      if (error) throw error;

      setServices([data, ...services]);
      setIsAddingService(false);
      setFormData({
        name: '',
        description: '',
        duration_minutes: 60,
        price: 0,
        category: '',
        max_students: 1,
        location_type: 'online',
        status: 'draft'
      });
      toast.success('Service created successfully');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    }
  };

  const handleStatusChange = async (serviceId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const { error } = await supabase
        .from('educator_services')
        .update({ status: newStatus })
        .eq('id', serviceId);

      if (error) throw error;

      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, status: newStatus }
          : service
      ));
      toast.success('Service status updated');
    } catch (error) {
      console.error('Error updating service status:', error);
      toast.error('Failed to update service status');
    }
  };

  useEffect(() => {
    fetchServices();
  }, [educator_profile_id]);

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Your Services</h3>
        <Button onClick={() => setIsAddingService(true)} disabled={isAddingService}>
          Add New Service
        </Button>
      </div>

      {isAddingService && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Service</CardTitle>
            <CardDescription>Create a new service offering for your students</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Students</label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location Type</label>
                <Select
                  value={formData.location_type}
                  onValueChange={(value) => setFormData({ ...formData, location_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingService(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Service
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </div>
                <Select
                  value={service.status}
                  onValueChange={(value: 'draft' | 'published' | 'archived') => 
                    handleStatusChange(service.id, value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Duration</p>
                  <p>{service.duration_minutes} minutes</p>
                </div>
                <div>
                  <p className="font-medium">Price</p>
                  <p>${service.price}</p>
                </div>
                <div>
                  <p className="font-medium">Max Students</p>
                  <p>{service.max_students}</p>
                </div>
                <div>
                  <p className="font-medium">Location</p>
                  <p className="capitalize">{service.location_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
