"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Area {
  id: number;
  name: string;
  city_id: number;
}

interface City {
    id: number;
    name: string;
    country_name: string;
}

export default function ManageAreasPage({ params }: { params: { countryName: string, cityId: string } }) {
  const countryName = decodeURIComponent(params.countryName);
  const cityId = params.cityId;
  
  const [areas, setAreas] = useState<Area[]>([]);
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [newAreaName, setNewAreaName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [areasRes, cityRes] = await Promise.all([
        fetch(`/api/admin/cities/${cityId}/areas`),
        fetch(`/api/admin/cities/${cityId}`) // You might need to create this simple API endpoint
      ]);
      
      if (!areasRes.ok) throw new Error('Failed to fetch areas');
      const areasData = await areasRes.json();
      setAreas(areasData);

      if (cityRes.ok) {
          const cityData = await cityRes.json();
          setCity(cityData);
      }

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cityId]);
  
  const handleOpenDialog = (area: Area | null = null) => {
    setCurrentArea(area);
    setNewAreaName(area ? area.name : '');
    setIsDialogOpen(true);
  };

  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const url = currentArea ? `/api/admin/areas/${currentArea.id}` : `/api/admin/cities/${cityId}/areas`;
    const method = currentArea ? 'PUT' : 'POST';
    const body = JSON.stringify({ name: newAreaName });

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save area');
      }
      
      toast({ title: "Success", description: `Area ${currentArea ? 'updated' : 'added'} successfully.` });
      setIsDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentArea) return;

    try {
      const res = await fetch(`/api/admin/areas/${currentArea.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete area');
      }
      toast({ title: "Success", description: "Area deleted successfully." });
      setAreas(areas.filter(c => c.id !== currentArea.id));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentArea(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Manage Areas for {city?.name || '...'}</CardTitle>
                <CardDescription>
                    <Link href={`/admin/locations/${countryName}`} className="text-sm text-muted-foreground hover:text-primary underline">
                        Back to cities in {countryName}
                    </Link>
                </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Area
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            <div className="border rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Area Name</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {areas.length > 0 ? areas.map((area) => (
                    <TableRow key={area.id}>
                        <TableCell className="font-medium">{area.name}</TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDialog(area)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => { setCurrentArea(area); setIsDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center">No areas found for this city.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <form onSubmit={handleDialogSubmit}>
            <DialogHeader>
                <DialogTitle>{currentArea ? 'Edit Area' : 'Add New Area'}</DialogTitle>
                <DialogDescription>
                    Enter the name for the area in {city?.name}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="area-name" className="text-right">Name</Label>
                    <Input id="area-name" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} className="col-span-3" required />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the area &quot;{currentArea?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentArea(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
