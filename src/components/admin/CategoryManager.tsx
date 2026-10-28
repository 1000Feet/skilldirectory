import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from '@/integrations/supabase/types';

// Define the Category type based on the Supabase database schema
type Category = Database['public']['Tables']['categories']['Row'];

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<{
    name: string;
    icon_name: string;
    is_active: boolean;
    display_order: number;
  }>({
    name: '',
    icon_name: '',
    is_active: true,
    display_order: 0
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toggle category active status
  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setCategories(categories.map(category => 
        category.id === id ? { ...category, is_active: !currentStatus } : category
      ));
      
      toast.success(`Category ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Failed to update category status');
    }
  };

  // Create new category
  const createCategory = async () => {
    try {
      if (!newCategory.name || !newCategory.icon_name) {
        toast.error('Name and icon name are required');
        return;
      }

      // Get max display order if not provided
      let displayOrder = newCategory.display_order;
      if (displayOrder === undefined || displayOrder === null || displayOrder === 0) {
        const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.display_order || 0), 0);
        displayOrder = maxOrder + 1;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCategory.name,
          icon_name: newCategory.icon_name,
          is_active: newCategory.is_active,
          display_order: displayOrder
        })
        .select();
      
      if (error) throw error;
      
      // Update local state
      if (data && data.length > 0) {
        setCategories([...categories, data[0]]);
      }
      
      // Reset form
      setNewCategory({
        name: '',
        icon_name: '',
        is_active: true,
        display_order: 0
      });
      
      setIsCreating(false);
      toast.success('Category created successfully');
    } catch (error: any) {
      console.error('Error creating category:', error);
      // Check for unique constraint violation
      if (error.code === '23505') {
        toast.error('A category with this name already exists');
      } else {
        toast.error('Failed to create category');
      }
    }
  };

  // Update category
  const updateCategory = async () => {
    try {
      if (!editingCategory) return;
      
      if (!editingCategory.name || !editingCategory.icon_name) {
        toast.error('Name and icon name are required');
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          icon_name: editingCategory.icon_name,
          is_active: editingCategory.is_active,
          display_order: editingCategory.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCategory.id)
        .select();
      
      if (error) throw error;
      
      // Update local state
      if (data && data.length > 0) {
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? data[0] : cat
        ));
      }
      
      setEditingCategory(null);
      setIsEditing(false);
      toast.success('Category updated successfully');
    } catch (error: any) {
      console.error('Error updating category:', error);
      // Check for unique constraint violation
      if (error.code === '23505') {
        toast.error('A category with this name already exists');
      } else {
        toast.error('Failed to update category');
      }
    }
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setCategories(categories.filter(category => category.id !== id));
      
      setCategoryToDelete(null);
      setDeleteDialogOpen(false);
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  // Move category up or down in display order
  const moveCategory = async (id: string, direction: 'up' | 'down') => {
    try {
      const index = categories.findIndex(c => c.id === id);
      if (index === -1) return;
      
      // Can't move up if already at the top
      if (direction === 'up' && index === 0) return;
      
      // Can't move down if already at the bottom
      if (direction === 'down' && index === categories.length - 1) return;
      
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Get the categories to swap
      const category = categories[index];
      const swapCategory = categories[swapIndex];
      
      // Swap display orders
      const tempOrder = category.display_order;
      category.display_order = swapCategory.display_order;
      swapCategory.display_order = tempOrder;
      
      // Update in database
      const updates = [
        supabase
          .from('categories')
          .update({ display_order: category.display_order })
          .eq('id', category.id),
        supabase
          .from('categories')
          .update({ display_order: swapCategory.display_order })
          .eq('id', swapCategory.id)
      ];
      
      await Promise.all(updates);
      
      // Update local state with new order
      const newCategories = [...categories];
      [newCategories[index], newCategories[swapIndex]] = [newCategories[swapIndex], newCategories[index]];
      setCategories(newCategories);
      
      toast.success('Category order updated');
    } catch (error) {
      console.error('Error moving category:', error);
      toast.error('Failed to update category order');
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory({ ...category });
    setIsEditing(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Category Management</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to the system. Categories are used to organize educator skills and services.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon_name" className="text-right">
                  Icon Name
                </Label>
                <Input
                  id="icon_name"
                  value={newCategory.icon_name}
                  onChange={(e) => setNewCategory({ ...newCategory, icon_name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., calculator"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="display_order" className="text-right">
                  Display Order
                </Label>
                <Input
                  id="display_order"
                  type="number"
                  value={newCategory.display_order?.toString() || "0"}
                  onChange={(e) => setNewCategory({ ...newCategory, display_order: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right">
                  Active
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="is_active"
                    checked={newCategory.is_active}
                    onCheckedChange={(checked) => setNewCategory({ ...newCategory, is_active: checked })}
                  />
                  <span className="ml-2">{newCategory.is_active ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={createCategory}>Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Display Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Skeleton loading state
            Array(5).fill(0).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[120px]" /></TableCell>
              </TableRow>
            ))
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                No categories found. Create your first category to get started.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.icon_name}</TableCell>
                <TableCell>{category.display_order}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => moveCategory(category.id, 'up')}
                      disabled={categories.indexOf(category) === 0}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => moveCategory(category.id, 'down')}
                      disabled={categories.indexOf(category) === categories.length - 1}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={category.is_active}
                      onCheckedChange={() => toggleCategoryStatus(category.id, category.is_active)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditDialog(category)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openDeleteDialog(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Category Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details.
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-icon_name" className="text-right">
                  Icon Name
                </Label>
                <Input
                  id="edit-icon_name"
                  value={editingCategory.icon_name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, icon_name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-display_order" className="text-right">
                  Display Order
                </Label>
                <Input
                  id="edit-display_order"
                  type="number"
                  value={editingCategory.display_order.toString()}
                  onChange={(e) => setEditingCategory({ ...editingCategory, display_order: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-is_active" className="text-right">
                  Active
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="edit-is_active"
                    checked={editingCategory.is_active}
                    onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, is_active: checked })}
                  />
                  <span className="ml-2">{editingCategory.is_active ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={updateCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <div>
              <p>Are you sure you want to delete this category?</p>
              {categoryToDelete && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <p><strong>Name:</strong> {categoryToDelete.name}</p>
                  <p><strong>Icon:</strong> {categoryToDelete.icon_name}</p>
                </div>
              )}
              <p className="mt-2 text-red-500">This action cannot be undone.</p>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => categoryToDelete && deleteCategory(categoryToDelete.id)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Category'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
