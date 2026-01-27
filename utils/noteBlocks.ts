import { BlockType, ContentBlock, TextSegment } from '@/types';

/**
 * Check if a string is valid JSON
 */
function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if content is block-based (JSON) or legacy plain text
 */
export function isBlockBasedContent(content: string): boolean {
  if (!content.trim()) return false;
  if (!isValidJSON(content)) return false;
  
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && 'type' in parsed[0];
  } catch {
    return false;
  }
}

/**
 * Parse content string to blocks (handles both JSON blocks and legacy plain text)
 */
export function parseContentToBlocks(content: string): ContentBlock[] {
  if (!content.trim()) {
    return [createBlock('paragraph', '')];
  }

  // If it's already block-based JSON, parse and validate
  if (isBlockBasedContent(content)) {
    try {
      const parsed = JSON.parse(content) as ContentBlock[];
      // Validate structure
      if (Array.isArray(parsed) && parsed.every(block => 
        typeof block === 'object' && 
        'id' in block && 
        'type' in block && 
        'content' in block
      )) {
        return parsed;
      }
    } catch {
      // Fall through to migration
    }
  }

  // Legacy plain text - migrate to blocks
  return migrateLegacyContent(content);
}

/**
 * Convert blocks to plain text (for search/backward compatibility)
 */
export function blocksToPlainText(blocks: ContentBlock[]): string {
  return blocks
    .map(block => {
      const text = mergeTextSegments(block.content);
      switch (block.type) {
        case 'heading1':
          return `# ${text}`;
        case 'heading2':
          return `## ${text}`;
        case 'heading3':
          return `### ${text}`;
        case 'bulletList':
          return `- ${text}`;
        case 'numberedList':
          return `1. ${text}`;
        case 'checkbox':
          return `${block.checked ? '[x]' : '[ ]'} ${text}`;
        case 'code':
          return `\`${text}\``;
        default:
          return text;
      }
    })
    .join('\n');
}

/**
 * Create a new content block
 */
export function createBlock(type: BlockType, text: string = ''): ContentBlock {
  return {
    id: crypto.randomUUID(),
    type,
    content: text ? [{ text, format: {} }] : [],
    ...(type === 'checkbox' && { checked: false }),
  };
}

/**
 * Merge text segments into a single string
 */
export function mergeTextSegments(segments: TextSegment[]): string {
  return segments.map(seg => seg.text).join('');
}

/**
 * Migrate legacy plain text content to block format
 */
export function migrateLegacyContent(content: string): ContentBlock[] {
  if (!content.trim()) {
    return [createBlock('paragraph', '')];
  }

  const lines = content.split('\n');
  const blocks: ContentBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) {
      // Empty line becomes empty paragraph
      blocks.push(createBlock('paragraph', ''));
      continue;
    }

    // Check for markdown-style patterns
    if (trimmed.startsWith('### ')) {
      blocks.push(createBlock('heading3', trimmed.slice(4)));
    } else if (trimmed.startsWith('## ')) {
      blocks.push(createBlock('heading2', trimmed.slice(3)));
    } else if (trimmed.startsWith('# ')) {
      blocks.push(createBlock('heading1', trimmed.slice(2)));
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push(createBlock('bulletList', trimmed.slice(2)));
    } else if (/^\d+\.\s/.test(trimmed)) {
      blocks.push(createBlock('numberedList', trimmed.replace(/^\d+\.\s/, '')));
    } else if (trimmed.startsWith('[ ] ') || trimmed.startsWith('[x] ') || trimmed.startsWith('[X] ')) {
      const checked = trimmed.startsWith('[x] ') || trimmed.startsWith('[X] ');
      const block = createBlock('checkbox', trimmed.slice(4));
      block.checked = checked;
      blocks.push(block);
    } else if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 2) {
      blocks.push(createBlock('code', trimmed.slice(1, -1)));
    } else {
      // Regular paragraph
      blocks.push(createBlock('paragraph', trimmed));
    }
  }

  return blocks.length > 0 ? blocks : [createBlock('paragraph', content)];
}

/**
 * Serialize blocks to JSON string for storage
 */
export function serializeBlocks(blocks: ContentBlock[]): string {
  return JSON.stringify(blocks);
}

/**
 * Parse markdown-style formatting in text (bold, italic, code, links)
 * Simple implementation - returns single segment for now (can be enhanced later)
 */
export function parseInlineFormatting(text: string): TextSegment[] {
  // For now, return simple text segment
  // Full markdown parsing can be added later if needed
  return [{ text }];
}
