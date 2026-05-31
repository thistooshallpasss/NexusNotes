'use client';

import * as React from 'react';
import { Plus, Edit3, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import TagBadge from './TagBadge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { API_URL } from '@/lib/apiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';


const PRESET_COLORS = [
  '#71717a', // Slate
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#ec4899', // Pink
];

export interface Tag {
  id: string;
  name: string;
  color?: string;
  category?: string;
}

interface TagManagerProps {
  availableTags: Tag[];
  selectedTags: Tag[];
  pageId: string;
  onAssignTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => void;
}

export default function TagManager({
  availableTags,
  selectedTags,
  pageId,
  onAssignTag,
  onRemoveTag,
  onCreateTag,
}: TagManagerProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [showColorSelector, setShowColorSelector] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState(PRESET_COLORS[0]);

  // States for inline editing
  const [editingTagId, setEditingTagId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState('');
  const [editingColor, setEditingColor] = React.useState('');
  const [deleteConfirmTag, setDeleteConfirmTag] = React.useState<Tag | null>(null);

  const handleSelect = (tag: Tag) => {
    // Prevent assigning if currently editing
    if (editingTagId) return;
    onAssignTag(tag);
    setOpen(false);
    setInputValue('');
  };

  const handleCreateClick = () => {
    setShowColorSelector(true);
  };

  const handleConfirmCreate = () => {
    if (inputValue.trim()) {
      onCreateTag(inputValue.trim(), selectedColor);
      setInputValue('');
      setShowColorSelector(false);
      setOpen(false);
    }
  };

  const updateTagMutation = useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name: string; color: string }) => {
      await axios.put(`${API_URL}/tags/${id}`, { name, color });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['page'] });
      setEditingTagId(null);
    }
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['page'] });
      setDeleteConfirmTag(null);
    }
  });

  return (
    <div className="flex flex-wrap items-center gap-2 my-4">
      {selectedTags.map((tag) => (
        <TagBadge 
          key={tag.id} 
          name={tag.name} 
          color={tag.color} 
          onRemove={() => onRemoveTag(tag.id)} 
        />
      ))}
      
      <Popover open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setShowColorSelector(false);
          setEditingTagId(null);
        }
      }}>
        <PopoverTrigger className="inline-flex h-7 px-2 items-center justify-center rounded-md border border-zinc-200 bg-white text-sm text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Tag
        </PopoverTrigger>
        <PopoverContent className="p-0 w-72" align="start">
          {showColorSelector ? (
            <div className="p-4 space-y-4">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Choose Tag Color</h4>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                      <Check className="h-5 w-5 text-white drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowColorSelector(false)}>Back</Button>
                <Button size="sm" onClick={handleConfirmCreate}>Create</Button>
              </div>
            </div>
          ) : (
            <Command>
              <CommandInput 
                placeholder="Search or create tag..." 
                value={inputValue}
                onValueChange={setInputValue}
                disabled={editingTagId !== null}
              />
              <CommandList>
                <CommandEmpty className="py-3 text-center text-sm px-2">
                  <p className="text-zinc-500 mb-2">No tags found.</p>
                  {inputValue.trim() && (
                    <Button variant="secondary" size="sm" onClick={handleCreateClick} className="cursor-pointer">
                      Create "{inputValue.trim()}"
                    </Button>
                  )}
                </CommandEmpty>
                
                <CommandGroup heading="Available Tags">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.some(st => st.id === tag.id);
                    const isEditing = editingTagId === tag.id;

                    if (isEditing) {
                      return (
                        <div key={tag.id} className="p-2 space-y-2 border-b border-zinc-100 dark:border-zinc-800">
                          <Input 
                            value={editingName} 
                            onChange={(e) => setEditingName(e.target.value)}
                            placeholder="Tag name"
                            size={12}
                          />
                          <div className="flex flex-wrap gap-1">
                            {PRESET_COLORS.map((c) => (
                              <button
                                key={c}
                                onClick={() => setEditingColor(c)}
                                className="w-5 h-5 rounded-full cursor-pointer flex items-center justify-center border border-zinc-200 dark:border-zinc-800"
                                style={{ backgroundColor: c }}
                              >
                                {editingColor === c && <Check className="h-3 w-3 text-white" />}
                              </button>
                            ))}
                            {editingColor && !PRESET_COLORS.includes(editingColor) && (
                              <button
                                onClick={() => setEditingColor(editingColor)}
                                className="w-5 h-5 rounded-full cursor-pointer flex items-center justify-center border border-zinc-200 dark:border-zinc-800"
                                style={{ backgroundColor: editingColor }}
                              >
                                <Check className="h-3 w-3 text-white" />
                              </button>
                            )}
                          </div>
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => setEditingTagId(null)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer">
                              <X size={14} />
                            </button>
                            <button 
                              onClick={() => updateTagMutation.mutate({ id: tag.id, name: editingName, color: editingColor })}
                              disabled={!editingName.trim() || updateTagMutation.isPending}
                              className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:hover:bg-indigo-900/50 cursor-pointer"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        disabled={isSelected}
                        onSelect={() => handleSelect(tag)}
                        className={`flex items-center justify-between group py-1.5 ${isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: tag.color || '#71717a' }}
                          />
                          <span className="truncate">{tag.name}</span>
                        </div>

                        {/* Tag management icons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTagId(tag.id);
                              setEditingName(tag.name);
                              setEditingColor(tag.color || PRESET_COLORS[0]);
                            }}
                            className="text-zinc-400 hover:text-amber-600 p-0.5 rounded transition-colors cursor-pointer"
                            title="Edit Tag"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmTag(tag);
                            }}
                            className="text-zinc-400 hover:text-red-600 p-0.5 rounded transition-colors cursor-pointer"
                            title="Delete Tag"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmTag !== null} onOpenChange={(open) => !open && setDeleteConfirmTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 font-bold">Delete Tag Globally</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete tag <strong className="text-zinc-800 dark:text-zinc-200">"{deleteConfirmTag?.name}"</strong> globally? This will remove it from all pages. This action cannot be undone.
          </div>
          {deleteTagMutation.isError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-200/40 dark:border-red-900/40 mb-4">
              {(deleteTagMutation.error as any)?.response?.data?.error || 'Failed to delete tag.'}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmTag(null)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (deleteConfirmTag) {
                  deleteTagMutation.mutate(deleteConfirmTag.id);
                }
              }}
              disabled={deleteTagMutation.isPending}
              className="flex items-center gap-2"
            >
              {deleteTagMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {deleteTagMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
