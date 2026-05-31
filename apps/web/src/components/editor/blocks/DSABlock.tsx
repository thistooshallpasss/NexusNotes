import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Zap, Clock, Box, Code } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

export default function DSABlockComponent({ node, updateAttributes }: NodeViewProps) {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const monacoTheme = currentTheme === 'dark' ? 'vs-dark' : 'vs';

  const approaches = ['Brute Force', 'Better', 'Optimal'];
  const languages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'sql'];
  
  return (
    <NodeViewWrapper className="my-6 rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm relative">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
      
      <div className="p-4 pl-6" contentEditable={false}>
        <div className="flex flex-wrap items-center gap-4 mb-3">
          {/* Approach type selector */}
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-indigo-500" />
            <select
              value={node.attrs.approachType}
              onChange={(e) => updateAttributes({ approachType: e.target.value })}
              className="bg-transparent font-semibold text-sm text-indigo-900 dark:text-indigo-200 focus:outline-none cursor-pointer"
            >
              {approaches.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          
          {/* Time complexity input */}
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs">
            <Clock size={14} className="text-amber-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Time:</span>
            <input 
              className="bg-transparent w-20 focus:outline-none font-mono text-zinc-800 dark:text-zinc-200"
              value={node.attrs.timeComplexity}
              onChange={(e) => updateAttributes({ timeComplexity: e.target.value })}
              placeholder="O(N)"
            />
          </div>

          {/* Space complexity input */}
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs">
            <Box size={14} className="text-emerald-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Space:</span>
            <input 
              className="bg-transparent w-20 focus:outline-none font-mono text-zinc-800 dark:text-zinc-200"
              value={node.attrs.spaceComplexity}
              onChange={(e) => updateAttributes({ spaceComplexity: e.target.value })}
              placeholder="O(1)"
            />
          </div>

          {/* Language selector for Monaco */}
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs">
            <Code size={14} className="text-indigo-500" />
            <select
              value={node.attrs.language || 'javascript'}
              onChange={(e) => updateAttributes({ language: e.target.value })}
              className="bg-transparent text-zinc-500 dark:text-zinc-400 focus:outline-none cursor-pointer font-mono"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Intuition / Description textarea */}
        <textarea
          className="w-full bg-transparent resize-none focus:outline-none text-sm text-zinc-700 dark:text-zinc-300 min-h-[60px] mb-2"
          placeholder="Explain the intuition behind this approach..."
          value={node.attrs.description}
          onChange={(e) => updateAttributes({ description: e.target.value })}
        />

        {/* Embedded Monaco Code Editor */}
        <div className="mt-3 border-t border-zinc-200 dark:border-zinc-800 pt-3 rounded-lg overflow-hidden" onKeyDown={(e) => e.stopPropagation()}>
          <Editor
            height={`${Math.max(150, Math.min(800, (node.attrs.code || '').split('\n').length * 20 + 24))}px`}
            language={node.attrs.language || 'javascript'}
            theme={monacoTheme}
            value={node.attrs.code || ''}
            onChange={(val) => updateAttributes({ code: val })}
            options={{
              minimap: { enabled: false },
              padding: { top: 12, bottom: 12 },
              scrollBeyondLastLine: false,
              fontSize: 13,
              fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
              renderLineHighlight: 'none',
              automaticLayout: true,
              wordWrap: 'on',
            }}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
