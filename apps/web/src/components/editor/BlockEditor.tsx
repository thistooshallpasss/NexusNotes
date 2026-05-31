'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useRef, useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import axios, { API_URL } from '@/lib/apiClient';
import CodeBlockExtension from './extensions/CodeBlockExtension';
import DSABlockExtension from './extensions/DSABlockExtension';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Loader2 } from 'lucide-react';


interface BlockEditorProps {
  initialContent?: any;
  onSave?: (content: any) => void;
}

export default function BlockEditor({ initialContent, onSave }: BlockEditorProps) {
  
  // States for Image Zoom
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);
  const [captionInput, setCaptionInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (zoomImage) {
      setCaptionInput(zoomImage.alt || '');
    } else {
      setCaptionInput('');
    }
  }, [zoomImage]);

  // Use a ref for the latest onSave so the debounced function never captures a stale closure
  const onSaveRef = useRef(onSave);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);

  const debouncedSave = useRef(
    debounce((content: any) => {
      if (onSaveRef.current) onSaveRef.current(content);
    }, 2000)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      CodeBlockExtension,
      DSABlockExtension,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialContent || '<p>Start typing your notes...</p>',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      debouncedSave(json);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc dark:prose-invert focus:outline-none max-w-none w-full min-h-[500px] pb-32',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            if (file) uploadImage(file, view, event);
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file.type.indexOf('image') === 0) {
            uploadImage(file, view, event);
            return true;
          }
        }
        return false;
      },
      handleDOMEvents: {
        click: (view, event) => {
          const target = event.target as HTMLElement;
          if (target.tagName === 'IMG') {
            const src = target.getAttribute('src') || '';
            const alt = target.getAttribute('alt') || target.getAttribute('title') || '';
            const pos = view.posAtDOM(target, 0);
            setZoomImage({ src, alt, pos } as any);
            return true;
          }
          return false;
        }
      }
    },
  });

  const uploadImage = async (file: File, view: any, event: any) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    // Capture position BEFORE async upload
    const coordinates = event && event.clientX && event.clientY 
      ? view.posAtCoords({ left: event.clientX, top: event.clientY })
      : null;
    const insertPos = coordinates?.pos ?? view.state.selection.to;

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await axios.post(`${API_URL}/images/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const url = res.data.url;
      const { schema } = view.state;
      const node = schema.nodes.image.create({ src: url });
      const transaction = view.state.tr.insert(insertPos, node);
      view.dispatch(transaction);
    } catch (error: any) {
      console.error('Failed to upload image', error);
      setUploadError(error.response?.data?.error || error.message || 'Failed to upload image.');
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCaption = () => {
    if (!editor || !zoomImage) return;

    const pos = (zoomImage as any).pos;
    if (typeof pos === 'number') {
      editor.chain().focus().command(({ tr }) => {
        const node = tr.doc.nodeAt(pos);
        if (node && node.type.name === 'image') {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            alt: captionInput,
            title: captionInput
          });
          return true;
        }
        return false;
      }).run();

      setZoomImage(prev => prev ? { ...prev, alt: captionInput } : null);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full relative mt-4">
      {/* Floating or sticky toolbar */}
      <div className="sticky top-0 z-10 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 py-2 mb-4 flex flex-wrap gap-2 rounded-t-lg px-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${editor.isActive('bold') ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${editor.isActive('italic') ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
        >
          Italic
        </button>
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 my-auto mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
        >
          H3
        </button>
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 my-auto mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${editor.isActive('bulletList') ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
        >
          Bullet List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${editor.isActive('orderedList') ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
        >
          Numbered List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${editor.isActive('taskList') ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
        >
          Checklist
        </button>
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 my-auto mx-1" />
        <button
          onClick={() => editor.chain().focus().insertContent({ type: 'monacoCodeBlock', attrs: { language: 'javascript', code: '' } }).run()}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-blue-600 dark:text-blue-400`}
        >
          {`{ }`} Code Block
        </button>
        <button
          onClick={() => editor.chain().focus().insertContent({ 
            type: 'dsaBlock', 
            attrs: { 
              approachType: 'Brute Force', 
              timeComplexity: 'O(N)', 
              spaceComplexity: 'O(1)', 
              description: '',
              code: '// Write code here',
              language: 'javascript'
            } 
          }).run()}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-indigo-600 dark:text-indigo-400`}
        >
          DSA Approach
        </button>
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 my-auto mx-1" />
        <button
          onClick={() => imageInputRef.current?.click()}
          className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
          title="Upload image from your computer"
        >
          <ImageIcon size={16} /> Image
        </button>
        <input 
          type="file" 
          ref={imageInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadImage(file, editor.view, {
                preventDefault: () => {},
                clientX: null,
                clientY: null
              });
            }
            e.target.value = '';
          }}
        />
        {isUploading && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-md animate-pulse my-auto">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
        {uploadError && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 px-2.5 py-1 rounded-md my-auto border border-red-200/40 dark:border-red-900/40">
            <span>{uploadError}</span>
          </div>
        )}
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 my-auto mx-1" />
        <span className="px-3 py-1.5 text-xs text-zinc-500 my-auto">Paste/Drop/Upload Images</span>
      </div>
      
      <div className="px-4">
        <EditorContent editor={editor} />
      </div>

      {/* Image Zoom & Caption Dialog */}
      <Dialog open={zoomImage !== null} onOpenChange={(open) => !open && setZoomImage(null)}>
        <DialogContent className="max-w-3xl border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative max-h-[60vh] overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center w-full">
              <img 
                src={zoomImage?.src} 
                alt={zoomImage?.alt} 
                className="object-contain max-h-[60vh] max-w-full"
              />
            </div>
            
            <div className="w-full space-y-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Image Caption</span>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a caption..." 
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCaption()}
                />
                <Button onClick={handleSaveCaption} className="cursor-pointer">Save Caption</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
