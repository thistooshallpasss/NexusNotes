import { Badge } from '@/components/ui/badge';

interface TagBadgeProps {
  name: string;
  color?: string;
  onRemove?: () => void;
}

export default function TagBadge({ name, color, onRemove }: TagBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className="flex items-center gap-1.5 cursor-default bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 font-medium py-1 px-2.5 shadow-sm"
      style={color ? { backgroundColor: `${color}20`, borderColor: color, color: color } : {}}
    >
      <span>{name}</span>
      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 opacity-70 hover:opacity-100 focus:outline-none transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}
    </Badge>
  );
}
