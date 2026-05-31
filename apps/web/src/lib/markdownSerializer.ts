export const serializeInlineNodes = (nodes: any[]): string => {
  if (!nodes) return '';
  return nodes.map((node: any) => {
    if (node.type === 'text') {
      let text = node.text || '';
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') text = `**${text}**`;
          else if (mark.type === 'italic') text = `*${text}*`;
          else if (mark.type === 'code') text = `\`${text}\``;
          else if (mark.type === 'strike') text = `~~${text}~~`;
        }
      }
      return text;
    }
    return '';
  }).join('');
};

export const serializeToMarkdown = (json: any): string => {
  if (!json || !json.content) return '';
  let markdown = '';
  
  json.content.forEach((node: any) => {
    switch (node.type) {
      case 'heading': {
        const level = node.attrs?.level || 1;
        const headingText = serializeInlineNodes(node.content || []);
        markdown += `${'#'.repeat(level)} ${headingText}\n\n`;
        break;
      }
      case 'paragraph': {
        const pText = serializeInlineNodes(node.content || []);
        markdown += `${pText}\n\n`;
        break;
      }
      case 'bulletList': {
        if (node.content) {
          node.content.forEach((listItem: any) => {
            const itemText = listItem.content 
              ? listItem.content.map((c: any) => serializeInlineNodes(c.content || [])).join('\n')
              : '';
            markdown += `* ${itemText}\n`;
          });
          markdown += '\n';
        }
        break;
      }
      case 'orderedList': {
        if (node.content) {
          node.content.forEach((listItem: any, idx: number) => {
            const itemText = listItem.content 
              ? listItem.content.map((c: any) => serializeInlineNodes(c.content || [])).join('\n')
              : '';
            markdown += `${idx + 1}. ${itemText}\n`;
          });
          markdown += '\n';
        }
        break;
      }
      case 'monacoCodeBlock':
      case 'codeBlock': {
        const code = node.attrs?.code || '';
        const language = node.attrs?.language || '';
        markdown += `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        break;
      }
      case 'dsaBlock': {
        const approachType = node.attrs?.approachType || '';
        const timeComplexity = node.attrs?.timeComplexity || '';
        const spaceComplexity = node.attrs?.spaceComplexity || '';
        const description = node.attrs?.description || '';
        const code = node.attrs?.code || '';
        const language = node.attrs?.language || '';
        
        markdown += `### ${approachType}\n`;
        markdown += `- **Time Complexity:** ${timeComplexity}\n`;
        markdown += `- **Space Complexity:** ${spaceComplexity}\n\n`;
        if (description) {
          markdown += `${description}\n\n`;
        }
        if (code) {
          markdown += `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        }
        break;
      }
      case 'image': {
        const src = node.attrs?.src || '';
        const alt = node.attrs?.alt || '';
        markdown += `![${alt}](${src})\n\n`;
        break;
      }
      default:
        break;
    }
  });
  
  return markdown;
};
