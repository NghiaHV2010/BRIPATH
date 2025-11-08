import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '../button';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import Toolbar from './Toolbar';
import EmojiPicker from './EmojiPicker';
import ImageResizeControls from './ImageResizeControls';
import { ImageResize } from './ImageResizeExtension';
import { Send, X } from 'lucide-react';
import { uploadImageFileToStorage, savePostToBackend } from '@/utils/posts';
import { useToast } from '../use-toast';

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
  const [title, setTitle] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const { toast } = useToast();


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      ImageResize.configure({
        inline: false,
        allowBase64: true,
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
          'ProseMirror prose prose-sm md:prose-base max-w-none focus:outline-none min-h-[400px] px-4 py-3 rounded-xl bg-white',
      },
    },
    onCreate: ({ editor }) => {
      setHasText(!!editor.getText({ blockSeparator: '' }).trim().length);
    },
    onUpdate: ({ editor }) => {
      setHasText(!!editor.getText({ blockSeparator: '' }).trim().length);
      
      // Sync images: remove images from preview if they're deleted from editor
      const html = editor.getHTML();
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      const editorImages: string[] = [];
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        if (match[1]) {
          editorImages.push(match[1]);
        }
      }
      
      // Remove images from state if they're not in editor anymore
      setImages(prev => {
        const remaining = prev.filter(img => editorImages.includes(img));
        // Clean up blob URLs that are no longer in editor
        prev.forEach(img => {
          if (!editorImages.includes(img) && img.startsWith('blob:')) {
            URL.revokeObjectURL(img);
          }
        });
        return remaining;
      });
      
      // Also update pending files
      setPendingFiles(prev => {
        const remaining = prev.filter(file => editorImages.includes(file.localUrl));
        return remaining;
      });
    },
  });


  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const coverInputRef = useRef<HTMLInputElement>(null);
  const handleCoverUploadClick = () => coverInputRef.current?.click();
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    setCoverFile(f);
    const localUrl = URL.createObjectURL(f);
    setCoverPreview(localUrl);
  };

  const handleRemoveCover = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverPreview(null);
    setCoverFile(null);
    // Reset file input
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  // Resize image function (similar to Facebook - max width 1200px)
  const resizeImage = (file: File, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth || height > maxHeight) {
                  const ratio = Math.min(maxWidth / width, maxHeight / height);
                  width = width * ratio;
                  height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  reject(new Error('Could not get canvas context'));
                  return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                
                // Determine output type - default to jpeg if not specified
                const outputType = file.type || 'image/jpeg';
                
                canvas.toBlob(
                  (blob) => {
                    if (!blob) {
                      reject(new Error('Failed to create blob'));
                      return;
                    }
                    const resizedFile = new File([blob], file.name, {
                      type: outputType,
                      lastModified: Date.now(),
                    });
                    resolve(resizedFile);
                  },
                  outputType,
                  quality
                );
              } catch (error) {
                reject(error);
              }
            };
            img.onerror = (error) => {
              reject(new Error('Failed to load image: ' + error));
            };
            
            if (e.target?.result) {
              img.src = e.target.result as string;
            } else {
              reject(new Error('FileReader result is empty'));
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => {
          reject(new Error('FileReader error: ' + error));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    let processedFile: File = file;
    
    try {
      // Resize image file if it's too large (max 1200px)
      processedFile = await resizeImage(file, 1200, 1200, 0.85);
    } catch (resizeError) {
      console.warn('Resize failed, using original file:', resizeError);
      processedFile = file;
    }
    
    const localUrl = URL.createObjectURL(processedFile);
    
    // Clear previous images and set new one
    images.forEach(url => URL.revokeObjectURL(url));
    setImages([localUrl]);
    setPendingFiles([{ localUrl, file: processedFile }]);
    
    // Insert image into editor with a small delay to ensure editor is ready
    if (editor) {
      // Use setTimeout to ensure editor state is stable
      setTimeout(() => {
        // Use setImage command
        if (editor.can().setImage({ src: localUrl, width: '500px' })) {
          editor.chain().focus().setImage({ 
            src: localUrl, 
            width: '500px' 
          }).run();
        }
      }, 50);
    }
    
    // Reset file input
    if (e.target) {
      e.target.value = '';
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
    // Improved regex to handle images with style attributes (float alignment)
    const currentHtml = editor.getHTML();
    const escapedUrl = imageUrlToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const updatedHtml = currentHtml.replace(
      new RegExp(`<img[^>]*src=["']${escapedUrl}["'][^>]*>`, 'gi'),
      ''
    );
    
    // Update editor content
    editor.commands.setContent(updatedHtml);
    
    // Clean up the URL
    URL.revokeObjectURL(imageUrlToRemove);
    
    // Update state to remove the image
    setImages(prev => prev.filter((_, i) => i !== index));
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
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

      // Prepare attachments: cover first (if provided), then inline images
      const uploadedImageUrls: string[] = [];
      if (coverFile) {
        try {
          const coverUrl = await uploadImageFileToStorage(coverFile, "posts");
          uploadedImageUrls.push(coverUrl);
        } catch (e) {
          console.error("Failed to upload cover image:", e);
        }
      }
      if (pendingFiles.length > 0) {
        console.log(`Uploading ${pendingFiles.length} images...`);
        for (const item of pendingFiles) {
          try {
            const remoteUrl = await uploadImageFileToStorage(item.file);
            html = html.replaceAll(item.localUrl, remoteUrl);
            uploadedImageUrls.push(remoteUrl);
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
          title,
          user: { name: userName, avatar: userAvatar },
          attachments: uploadedImageUrls,
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
      setTitle("");
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
      setCoverFile(null);
      
      // Show success toast
      toast({
        title: "Thành công!",
        description: "Bài viết đã được đăng thành công!",
        variant: "success",
      });
      
    } catch (error) {
      console.error("PostComposer: failed to submit post", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng bài',
        variant: "destructive",
      });
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

      {/* Title */}
      <div className="mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề bài viết"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <div className="text-xs text-gray-500 mt-1">Tối thiểu 10 ký tự để phù hợp ràng buộc backend.</div>
      </div>

      {/* Cover image */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-gray-800">Ảnh bìa <span className="text-xs text-gray-400 font-normal">(tùy chọn)</span></div>
          {!coverPreview ? (
            <Button type="button" variant="outline" onClick={handleCoverUploadClick}>Chọn ảnh bìa</Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleCoverUploadClick}>Thay đổi</Button>
          )}
        </div>
        {coverPreview ? (
          <div className="relative group rounded-xl overflow-hidden border">
            <img src={coverPreview} alt="Cover preview" className="w-full h-44 object-cover" />
            <button
              onClick={handleRemoveCover}
              className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Xóa ảnh bìa"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Chưa chọn ảnh bìa</div>
        )}
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

      {/* Editor */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition relative flex flex-col">
        {/* Editor Content - Larger min-height with overflow handling */}
        <div className="min-h-[400px] overflow-x-auto overflow-y-visible relative flex-1 clearfix">
          <EditorContent editor={editor} />
        </div>
        
        {/* Bubble Menu for Image Resize Controls - Higher z-index */}
        {editor && (
          <BubbleMenu
            editor={editor}
            shouldShow={(props) => {
              const { state } = props;
              const { selection } = state;
              const { $anchor } = selection;
              
              // Check if selection is on an image node
              const node = $anchor.node();
              if (node && node.type.name === 'image') {
                return true;
              }
              
              // Check parent node
              const parent = $anchor.parent;
              if (parent && parent.type.name === 'image') {
                return true;
              }
              
              // Check node before and after
              const nodeBefore = $anchor.nodeBefore;
              const nodeAfter = $anchor.nodeAfter;
              return (nodeBefore?.type.name === 'image') || 
                     (nodeAfter?.type.name === 'image');
            }}
          >
            <div className="z-[100]">
              <ImageResizeControls editor={editor} />
            </div>
          </BubbleMenu>
        )}
        
        {/* Toolbar - Fixed position with higher z-index */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-gray-50 z-50 shadow-sm">
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

        {/* Image Preview - Moved below toolbar to avoid covering resize controls */}
        {images.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white clear-both">
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
                    className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow opacity-0 group-hover:opacity-100 transition z-10"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Post Button */}
      <div className="flex justify-end mt-4">
        <Button
          type="button"
          onClick={() => {
            console.log("PostComposer: click post button", { hasText, imagesCount: images.length });
            handlePost();
          }}
          disabled={!hasContent || (title.trim().length < 10)}
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
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
