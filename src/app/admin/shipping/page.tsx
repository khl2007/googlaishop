"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ShippingMethod } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function ShippingMethodsPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<ShippingMethod | null>(null);
  const { toast } = useToast();

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/shipping');
      if (!res.ok) throw new Error('Failed to fetch shipping methods');
      const data = await res.json();
      setMethods(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleDelete = async () => {
    if (!methodToDelete) return;

    try {
      const res = await fetch(`/api/admin/shipping/${methodToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete shipping method');
      }
      toast({ title: "Success", description: "Shipping method deleted successfully." });
      setMethods(methods.filter(m => m.id !== methodToDelete.id));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setMethodToDelete(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Shipping Methods</h1>
        <Button asChild>
          <Link href="/admin/shipping/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Shipping Method
          </Link>
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Cost Type</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.map((method) => (
              <TableRow key={method.id}>
                <TableCell>
                  <Image 
                    src={method.logo || "https://placehold.co/64x64.png"} 
                    alt={method.title}
                    width={64}
                    height={64}
                    className="rounded-md object-contain"
                    data-ai-hint="shipping logo"
                  />
                </TableCell>
                <TableCell className="font-medium">{method.title}</TableCell>
                <TableCell><Badge variant="outline">{method.cost_type.charAt(0).toUpperCase() + method.cost_type.slice(1)}</Badge></TableCell>
                <TableCell>
                    {method.enabled ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={`/admin/shipping/${method.id}/edit`}>Edit</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setMethodToDelete(method); setIsDeleteDialogOpen(true); }}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shipping method &quot;{methodToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
