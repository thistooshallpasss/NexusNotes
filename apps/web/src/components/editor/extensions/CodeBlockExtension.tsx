import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CodeBlockComponent from '../blocks/CodeBlock';

export default Node.create({
  name: 'monacoCodeBlock',
  group: 'block',
  atom: true, // We store content in attributes, not as tiptap text nodes
  
  addAttributes() {
    return {
      language: { default: 'javascript' },
      code: { default: '// Write your code here' }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="monaco-code-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'monaco-code-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
});
