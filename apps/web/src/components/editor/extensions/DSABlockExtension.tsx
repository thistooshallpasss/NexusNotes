import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import DSABlockComponent from '../blocks/DSABlock';

export default Node.create({
  name: 'dsaBlock',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      approachType: { default: 'Brute Force' },
      timeComplexity: { default: 'O(N)' },
      spaceComplexity: { default: 'O(1)' },
      description: { default: '' },
      code: { default: '// Write your code here' },
      language: { default: 'javascript' }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="dsa-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'dsa-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DSABlockComponent);
  },
});
