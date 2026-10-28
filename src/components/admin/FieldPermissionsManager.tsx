import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EDUCATOR_PROFILE_FIELDS, MembershipFieldPermissions, DEFAULT_FIELD_PERMISSIONS } from '@/types/membership-fields';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";

interface FieldPermissionsData {
  id: number;
  permissions: MembershipFieldPermissions;
  created_at: string;
  updated_at: string;
}

export function FieldPermissionsManager() {
  const [permissions, setPermissions] = useState<MembershipFieldPermissions>(DEFAULT_FIELD_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('field_permissions')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, use defaults
          setPermissions(DEFAULT_FIELD_PERMISSIONS);
        } else {
          throw error;
        }
      } else if (data) {
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to fetch field permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: string, plan: 'basic' | 'standard' | 'premium') => {
    setPermissions(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [plan]: !prev[field][plan]
      }
    }));
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('field_permissions')
        .upsert({ 
          id: 1, 
          permissions,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      toast.success('Field permissions saved successfully');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to save field permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Field Permissions</h2>
        <Button onClick={savePermissions} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>Basic</TableHead>
            <TableHead>Standard</TableHead>
            <TableHead>Premium</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {EDUCATOR_PROFILE_FIELDS.map((field) => (
            <TableRow key={field}>
              <TableCell className="font-medium capitalize">
                {field.replace(/_/g, ' ')}
              </TableCell>
              <TableCell>
                <Switch
                  checked={permissions[field]?.basic ?? false}
                  onCheckedChange={() => handleToggle(field, 'basic')}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={permissions[field]?.standard ?? false}
                  onCheckedChange={() => handleToggle(field, 'standard')}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={permissions[field]?.premium ?? true}
                  onCheckedChange={() => handleToggle(field, 'premium')}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
