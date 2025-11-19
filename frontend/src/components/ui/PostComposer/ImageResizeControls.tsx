import { Editor } from '@tiptap/react';
import { Button } from '../button';
import { X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ImageResizeControlsProps {
  editor: Editor;
}

export default function ImageResizeControls({ editor }: ImageResizeControlsProps) {
  const [imageAttrs, setImageAttrs] = useState<{
    width?: string | number;
    height?: string | number;
    align?: string;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      const { selection } = editor.state;
      const { $anchor } = selection;
      
      // Try to find the image node
      let imageNode = null;
      
      // Check current node
      const node = $anchor.node();
      if (node && node.type.name === 'image') {
        imageNode = node;
      }
      
      // Check parent
      if (!imageNode) {
        const parent = $anchor.parent;
        if (parent && parent.type.name === 'image') {
          imageNode = parent;
        }
      }
      
      // Check node before
      if (!imageNode) {
        const nodeBefore = $anchor.nodeBefore;
        if (nodeBefore && nodeBefore.type.name === 'image') {
          imageNode = nodeBefore;
        }
      }
      
      // Check node after
      if (!imageNode) {
        const nodeAfter = $anchor.nodeAfter;
        if (nodeAfter && nodeAfter.type.name === 'image') {
          imageNode = nodeAfter;
        }
      }
      
      // Check by traversing up the document
      if (!imageNode) {
        let depth = $anchor.depth;
        while (depth > 0) {
          const nodeAtDepth = $anchor.node(depth);
          if (nodeAtDepth && nodeAtDepth.type.name === 'image') {
            imageNode = nodeAtDepth;
            break;
          }
          depth--;
        }
      }
      
      if (imageNode) {
        const width = imageNode.attrs.width || '';
        const height = imageNode.attrs.height || '';
        let align = imageNode.attrs.align || '';
        
        // If align is not in attrs, try to get from HTML style
        if (!align) {
          const html = editor.getHTML();
          const imgMatch = html.match(new RegExp(`<img[^>]*src=["']${imageNode.attrs.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i'));
          if (imgMatch) {
            const styleMatch = imgMatch[0].match(/style=["']([^"']+)["']/i);
            if (styleMatch) {
              const style = styleMatch[1];
              if (style.includes('float: left')) align = 'left';
              else if (style.includes('float: right')) align = 'right';
              else if (style.includes('margin-left: auto') && style.includes('margin-right: auto')) align = 'center';
            }
          }
        }
        
        setImageAttrs({
          width,
          height,
          align,
        });
      } else {
        setImageAttrs(null);
      }
    };

    editor.on('selectionUpdate', update);
    editor.on('update', update);
    update(); // Initial update

    return () => {
      editor.off('selectionUpdate', update);
      editor.off('update', update);
    };
  }, [editor]);

  if (!imageAttrs) return null;

  const updateImageAttrs = (attrs: Record<string, any>) => {
    // Use TipTap's updateAttributes command
    // This will update the currently selected image node
    editor.chain().focus().updateAttributes('image', attrs).run();
  };

  const handleReset = () => {
    updateImageAttrs({ width: null, height: null, align: null });
  };

  // Preset sizes - simplified options
  const presetSizes = [
    { label: 'Nhỏ', width: '300px' },
    { label: 'Vừa', width: '500px' },
    { label: 'Lớn', width: '700px' },
    { label: 'Đầy đủ', width: '100%' },
  ];

  const handlePresetSize = (width: string) => {
    updateImageAttrs({ width, height: null });
  };

  const handleAlign = (align: 'left' | 'center' | 'right' | null) => {
    updateImageAttrs({ align });
  };

  const currentAlign = imageAttrs?.align || null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 flex items-center gap-2">
      {/* Size buttons */}
      <div className="flex items-center gap-1">
        {presetSizes.map((preset) => {
          const isActive = imageAttrs?.width === preset.width || 
                         (preset.width === '100%' && imageAttrs?.width === '100%');
          return (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => handlePresetSize(preset.width)}
              className={`h-8 px-2.5 text-xs ${isActive ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' : ''}`}
              title={`${preset.label} (${preset.width})`}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Alignment buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('left')}
          className={`h-8 w-8 p-0 ${currentAlign === 'left' ? 'bg-blue-50 border-blue-500 text-blue-700' : ''}`}
          title="Căn trái"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('center')}
          className={`h-8 w-8 p-0 ${currentAlign === 'center' ? 'bg-blue-50 border-blue-500 text-blue-700' : ''}`}
          title="Căn giữa"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('right')}
          className={`h-8 w-8 p-0 ${currentAlign === 'right' ? 'bg-blue-50 border-blue-500 text-blue-700' : ''}`}
          title="Căn phải"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1" />

      {/* Reset button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
        title="Đặt lại về mặc định"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

