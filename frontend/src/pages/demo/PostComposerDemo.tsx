import { PostComposer } from '@/components/ui/PostComposer';

export default function PostComposerDemo() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          PostComposer Demo
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <PostComposer 
            userAvatar="/default-avatar.png"
            userName="Nguyễn Văn A"
            placeholder="Bạn đang nghĩ gì?"
          />
        </div>

        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Hướng dẫn sử dụng:</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>Bold:</strong> Bấm nút B để in đậm</li>
              <li>• <strong>Italic:</strong> Bấm nút I để in nghiêng</li>
              <li>• <strong>Underline:</strong> Bấm nút U để gạch dưới</li>
              <li>• <strong>Heading:</strong> Bấm nút H để tạo tiêu đề</li>
              <li>• <strong>Lists:</strong> Bấm nút bullet hoặc numbered để tạo danh sách</li>
              <li>• <strong>Emoji:</strong> Bấm nút 😊 để chọn emoji</li>
              <li>• <strong>Images:</strong> Bấm nút 🖼️ để upload ảnh</li>
              <li>• <strong>Post:</strong> Bấm "Đăng bài" để xem kết quả trong console</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
