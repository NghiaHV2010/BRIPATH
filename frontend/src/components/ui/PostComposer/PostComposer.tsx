import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '../button';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import Toolbar from './Toolbar';
import EmojiPicker from './EmojiPicker';
import { Send } from 'lucide-react';
import { uploadImageFileToStorage, savePostToBackend } from '@/utils/posts';

interface PostComposerProps {
  userAvatar?: string;
  userName?: string;
  placeholder?: string;
}

export default function PostComposer({ 
  userAvatar = '/default-avatar.png',
  userName = 'User',
  placeholder = 'Bạn đang nghĩ gì?'
}: PostComposerProps) {
  const [images, setImages] = useState<string[]>([]); // local preview URLs (blob:)
  const [pendingFiles, setPendingFiles] = useState<{ localUrl: string; file: File }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasText, setHasText] = useState(false);

  // Function to sync images with editor content
  const syncImagesWithEditor = () => {
    if (!editor) return;
    
    const html = editor.getHTML();
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    const editorImages: string[] = [];
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      editorImages.push(match[1]);
    }
    
    // Update images state to match editor
    setImages(prev => {
      const newImages = prev.filter(img => editorImages.includes(img));
      return newImages;
    });
    
    // Update pending files to match
    setPendingFiles(prev => {
      const newPendingFiles = prev.filter(file => editorImages.includes(file.localUrl));
      return newPendingFiles;
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'ProseMirror prose prose-sm md:prose-base max-w-none focus:outline-none min-h-[160px] px-4 py-3 rounded-xl bg-white',
      },
    },
    onCreate: ({ editor }) => {
      setHasText(!!editor.getText({ blockSeparator: '' }).trim().length);
    },
    onUpdate: ({ editor }) => {
      setHasText(!!editor.getText({ blockSeparator: '' }).trim().length);
      // Sync images with editor content on every update
      syncImagesWithEditor();
    },
  });

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const additions: string[] = [];
    const newPendings: { localUrl: string; file: File }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const localUrl = URL.createObjectURL(file);
      additions.push(localUrl);
      newPendings.push({ localUrl, file });
    }
    if (additions.length > 0) {
      setImages(prev => [...prev, ...additions]);
      setPendingFiles(prev => [...prev, ...newPendings]);
      additions.forEach(url => editor?.chain().focus().setImage({ src: url }).run());
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
    }
  };

  const removeImage = (index: number) => {
    if (!editor) return;
    
    // Get the image URL to remove from editor
    const imageUrlToRemove = images[index];
    
    // Remove from editor by replacing the image with empty content
    const currentHtml = editor.getHTML();
    const updatedHtml = currentHtml.replace(
      new RegExp(`<img[^>]*src="${imageUrlToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g'),
      ''
    );
    
    // Update editor content
    editor.commands.setContent(updatedHtml);
    
    // Clean up the URL
    URL.revokeObjectURL(imageUrlToRemove);
    
    // The syncImagesWithEditor will be called automatically via onUpdate
  };

  const handlePost = async () => {
    if (!editor) {
      console.warn("PostComposer: editor is not ready yet");
      return;
    }

    try {
      console.log("PostComposer: submitting post...");
      let html = editor.getHTML();

      // Check if post has content
      const textContent = editor.getText({ blockSeparator: '' }).trim();
      if (!textContent && pendingFiles.length === 0) {
        console.warn("PostComposer: No content to post");
        return;
      }

      // Upload pending images and rewrite blob URLs to CDN URLs before save
      if (pendingFiles.length > 0) {
        console.log(`Uploading ${pendingFiles.length} images...`);
        for (const item of pendingFiles) {
          try {
            const remoteUrl = await uploadImageFileToStorage(item.file);
            html = html.replaceAll(item.localUrl, remoteUrl);
            console.log("Image uploaded successfully:", remoteUrl);
          } catch (imageError) {
            console.error("Failed to upload image:", imageError);
            throw new Error(`Failed to upload image: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
          }
        }
      }

      console.log("Saving post...");
      
      // Use backend API only (Firebase Auth is disabled)
      let postId;
      try {
        postId = await savePostToBackend({
          html,
          user: { name: userName, avatar: userAvatar },
          attachments: [],
        });
        console.log("Post saved using backend API");
      } catch (backendError) {
        console.error("Backend API failed:", backendError);
        throw new Error(`Không thể lưu bài viết: ${backendError instanceof Error ? backendError.message : 'Lỗi không xác định'}`);
      }
      
      console.log("Post saved successfully:", postId);
      
      // Show additional info if using hybrid approach
      if (postId && typeof postId === 'object' && postId.htmlUrl) {
        console.log("Firebase Storage URL:", postId.htmlUrl);
        console.log("Backend ID:", postId.id);
      }
      
      // Clear editor and reset state
      editor.commands.clearContent();
      images.forEach(u => URL.revokeObjectURL(u));
      setImages([]);
      setPendingFiles([]);
      
      // Show success message (you can replace this with a toast notification)
      alert("Bài viết đã được đăng thành công!");
      
    } catch (error) {
      console.error("PostComposer: failed to submit post", error);
      alert(`Lỗi khi đăng bài: ${error instanceof Error ? error.message : 'Có lỗi xảy ra'}`);
    }
  };

  const hasContent = !!editor && (hasText || images.length > 0);

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 w-full md:max-w-3xl lg:max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-blue-50">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">Đăng công khai</p>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition">
        <EditorContent editor={editor} />
        
        {/* Image Preview */}
        {images.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-28 sm:h-32 object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between p-2 md:p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Toolbar 
                editor={editor} 
                onImageUpload={handleImageUpload}
              />
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>
        </div>
      </div>

      {/* Post Button */}
      <div className="flex justify-end mt-4">
        <Button
          type="button"
          onClick={() => {
            console.log("PostComposer: click post button", { hasText, imagesCount: images.length });
            handlePost();
          }}
          disabled={!hasContent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Đăng bài
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
