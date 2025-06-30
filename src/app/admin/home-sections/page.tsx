
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { HomeSection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Loader2, GripVertical, Trash, Edit, CheckCircle, XCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCsrfToken } from '@/lib/csrf';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { HomeSectionForm } from '@/components/admin/home-section-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormOptions {
  categories: { value: string; label: string }[];
  tags: { value: string; label: string }[];
  products: { value: string; label: string }[];
}

function SortableSectionItem({ section, onEdit, onDelete, onDuplicate }: { section: HomeSection, onEdit: (section: HomeSection) => void, onDelete: (section: HomeSection) => void, onDuplicate: (section: HomeSection) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-4 bg-card border rounded-lg p-4 shadow-sm">
            <button {...attributes} {...listeners} className="cursor-grab p-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex-1">
                <p className="font-medium">{section.title}</p>
                <p className="text-sm text-muted-foreground">Type: {section.type} | Style: {section.style}</p>
            </div>
            <div className="flex items-center gap-2">
                {section.isActive ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onDuplicate(section)}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Duplicate Section</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Duplicate</p>
                    </TooltipContent>
                </Tooltip>

                <Button variant="outline" size="sm" onClick={() => onEdit(section)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(section)}><Trash className="mr-2 h-4 w-4" />Delete</Button>
            </div>
        </div>
    );
}

export default function HomeSectionsPage() {
    const [sections, setSections] = useState<HomeSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState<HomeSection | null>(null);
    const [formOptions, setFormOptions] = useState<FormOptions | null>(null);
    const { toast } = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const sectionIds = useMemo(() => sections.map(s => s.id), [sections]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/home-sections');
            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();
            setSections(data.sections);
            setFormOptions(data.formOptions);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setSections((items) => {
                const oldIndex = sectionIds.indexOf(active.id as number);
                const newIndex = sectionIds.indexOf(over!.id as number);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSaveOrder = async () => {
        setIsSavingOrder(true);
        try {
            const res = await fetch('/api/admin/home-sections', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-csrf-token': getCsrfToken()
                },
                body: JSON.stringify({ orderedIds: sections.map(s => s.id) }),
            });
            if (!res.ok) throw new Error("Failed to save order");
            toast({ title: "Success", description: "Section order saved." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSavingOrder(false);
        }
    };
    
    const handleEdit = (section: HomeSection) => {
        setCurrentSection(section);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setCurrentSection(null);
        setIsDialogOpen(true);
    };
    
    const handleDelete = async (section: HomeSection) => {
        if (!confirm(`Are you sure you want to delete the section "${section.title}"?`)) return;

        try {
            const res = await fetch(`/api/admin/home-sections/${section.id}`, { 
                method: 'DELETE',
                headers: { 'x-csrf-token': getCsrfToken() },
            });
            if (!res.ok) throw new Error('Failed to delete section');
            setSections(prev => prev.filter(s => s.id !== section.id));
            toast({ title: 'Success', description: 'Section deleted.' });
        } catch (error: any) {
             toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleDuplicate = async (section: HomeSection) => {
        try {
            const res = await fetch(`/api/admin/home-sections/${section.id}/duplicate`, { 
                method: 'POST',
                headers: { 'x-csrf-token': getCsrfToken() },
            });
            if (!res.ok) throw new Error('Failed to duplicate section');
            const newSection = await res.json();
            setSections(prev => [...prev, newSection]);
            toast({ title: 'Success', description: `Section "${section.title}" duplicated.` });
        } catch (error: any) {
             toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };
    
    const onFormSubmit = (newOrUpdatedSection: HomeSection) => {
        if (currentSection) { // Update
            setSections(prev => prev.map(s => s.id === newOrUpdatedSection.id ? newOrUpdatedSection : s));
        } else { // Create
            setSections(prev => [...prev, newOrUpdatedSection]);
        }
        setIsDialogOpen(false);
    }

    if (loading) {
        return <div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Home Page Sections</CardTitle>
                        <CardDescription>Drag and drop sections to reorder them on the homepage.</CardDescription>
                    </div>
                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" />Add Section</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{currentSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
                            </DialogHeader>
                            {formOptions && <HomeSectionForm 
                                section={currentSection} 
                                formOptions={formOptions}
                                onFormSubmit={onFormSubmit}
                                sectionCount={sections.length}
                            />}
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <TooltipProvider>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                                {sections.map(section => (
                                    <SortableSectionItem key={section.id} section={section} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </TooltipProvider>
                     {sections.length === 0 && <p className="text-muted-foreground text-center py-8">No sections created yet.</p>}
                </div>

                {sections.length > 0 && (
                     <div className="mt-6 flex justify-end">
                        <Button onClick={handleSaveOrder} disabled={isSavingOrder}>
                            {isSavingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Order
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
