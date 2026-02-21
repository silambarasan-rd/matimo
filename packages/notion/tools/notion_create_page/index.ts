import axios from 'axios';

interface Params {
  parent: Record<string, unknown>;
  properties?: Record<string, unknown>;
  icon?: Record<string, unknown>;
  cover?: Record<string, unknown>;
  children?: unknown[];
  markdown?: string;
  template?: Record<string, unknown>;
  position?: Record<string, unknown>;
}

function markdownToChildren(md: string): unknown[] {
  // Very small converter: split paragraphs and handle headings (#, ##, ###)
  const parts = md.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const blocks: unknown[] = [];

  for (const part of parts) {
    if (part.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: { rich_text: [{ type: 'text', text: { content: part.replace(/^#\s+/, '') } }] },
      });
    } else if (part.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: part.replace(/^##\s+/, '') } }] },
      });
    } else if (part.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: part.replace(/^###\s+/, '') } }] },
      });
    } else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: part } }] },
      });
    }
  }

  return blocks;
}

export default async function createPage(params: Params) {
  const {
    parent,
    properties,
    icon,
    cover,
    children,
    markdown,
    template,
    position,
  } = params as Params;

  if (!parent || typeof parent !== 'object') {
    throw new Error('Missing required `parent` parameter');
  }

  // Convert markdown to children if provided and children not explicitly set
  let resolvedChildren = children;
  if ((!resolvedChildren || (Array.isArray(resolvedChildren) && resolvedChildren.length === 0)) && markdown) {
    resolvedChildren = markdownToChildren(markdown);
  }

  const body: Record<string, unknown> = {
    parent,
  };

  if (properties) body.properties = properties;
  if (icon) body.icon = icon;
  if (cover) body.cover = cover;
  if (resolvedChildren) body.children = resolvedChildren;
  if (template) body.template = template;
  if (position) body.position = position;

  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error('NOTION_API_KEY not set');
  }

  try {
    const resp = await axios.post('https://api.notion.com/v1/pages', body, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2025-09-03',
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    return {
      success: true,
      statusCode: resp.status,
      data: resp.data,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status || 0;
      return {
        success: false,
        statusCode: status,
        error: err.response?.data || err.message,
      };
    }

    return {
      success: false,
      statusCode: 0,
      error: String(err),
    };
  }
}
