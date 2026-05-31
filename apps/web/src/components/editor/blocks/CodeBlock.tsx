import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

export default function CodeBlockComponent({ node, updateAttributes }: NodeViewProps) {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const monacoTheme = currentTheme === 'dark' ? 'vs-dark' : 'vs';

  const languages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'html', 'css', 'sql'];
  const code = node.attrs.code || '';
  const lineCount = code.split('\n').length;
  const editorHeight = `${Math.max(150, Math.min(800, lineCount * 20 + 24))}px`;

  return (
    <NodeViewWrapper className="my-6 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#1e1e1e] shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800" contentEditable={false}>
        <select
          value={node.attrs.language}
          onChange={(e) => updateAttributes({ language: e.target.value })}
          className="bg-transparent text-sm font-mono text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
      </div>
      <div className="pt-2" contentEditable={false} onKeyDown={(e) => e.stopPropagation()}>
        <Editor
          height={editorHeight}
          language={node.attrs.language}
          theme={monacoTheme}
          value={node.attrs.code}
          onChange={(val) => updateAttributes({ code: val })}
          options={{
            minimap: { enabled: false },
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
            renderLineHighlight: 'none',
            automaticLayout: true,
            wordWrap: 'on',
          }}
        />
      </div>
    </NodeViewWrapper>
  );
}
