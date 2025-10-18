import { Editor } from '@tiptap/react';
import { Button } from '../button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading1,
  Image as ImageIcon
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
  onImageUpload: () => void;
}

export default function Toolbar({ editor, onImageUpload }: ToolbarProps) {
  if (!editor) return null;

  const toolbarItems = [
    {
      icon: Bold,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      tooltip: 'Bold'
    },
    {
      icon: Italic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      tooltip: 'Italic'
    },
    {
      icon: Underline,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      tooltip: 'Underline'
    },
    {
      icon: Heading1,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      tooltip: 'Heading'
    },
    {
      icon: List,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      tooltip: 'Bullet List'
    },
    {
      icon: ListOrdered,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      tooltip: 'Numbered List'
    }
  ];

  return (
    <div className="flex items-center gap-1 p-2 border-t border-gray-200 bg-gray-50">
      {/* Text formatting buttons */}
      <div className="flex items-center gap-1">
        {toolbarItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={item.onClick}
              className={`h-8 w-8 p-0 ${item.isActive ? 'bg-gray-200' : ''}`}
              title={item.tooltip}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Image upload button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onImageUpload}
        className="h-8 w-8 p-0"
        title="Upload Image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
