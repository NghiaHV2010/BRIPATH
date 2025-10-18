import { ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/config/firebase.config";
import axiosConfig from "@/config/axios.config";

export interface SavePostPayload {
  html: string;
  user?: { id?: string; name?: string; avatar?: string };
  attachments?: string[]; // image urls
}

export async function uploadImageFileToStorage(file: File, pathPrefix = "posts") {
  const filePath = `${pathPrefix}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${file.name}`;
  const fileRef = ref(storage, filePath);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
}

// Function to read HTML content from Firebase Storage URL
export async function getPostContentFromFirebase(htmlUrl: string): Promise<string> {
  try {
    const response = await fetch(htmlUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status}`);
    }
    const htmlContent = await response.text();
    
    // Extract content from <body> tag
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }
    
    return htmlContent;
  } catch (error) {
    console.error("Error fetching content from Firebase Storage:", error);
    throw new Error(`Failed to load post content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Hybrid approach: Save HTML to Firebase Storage, metadata to Backend
export async function savePostToBackend({ html, user, attachments = [] }: SavePostPayload) {
  try {
    console.log("Attempting to save post using hybrid approach...");
    
    // Validate required data
    if (!html || html.trim() === '') {
      throw new Error('Post content cannot be empty');
    }

    // Clean and prepare data
    const cleanHtml = html.trim();
    const cleanUser = user ? {
      name: user.name || 'Anonymous',
      avatar: user.avatar || null,
      id: user.id || null
    } : null;

    console.log("Step 1: Uploading HTML content to Firebase Storage...");
    
    // Step 1: Upload HTML content to Firebase Storage
    const htmlFileName = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.html`;
    const htmlRef = ref(storage, htmlFileName);
    
    // Create HTML document with proper structure
    const fullHtmlDocument = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post Content</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    ${cleanHtml}
</body>
</html>`;

    await uploadString(htmlRef, fullHtmlDocument, 'raw');
    const htmlUrl = await getDownloadURL(htmlRef);
    
    console.log("HTML content uploaded to Firebase Storage:", htmlUrl);

    // Step 2: Save metadata to Backend with Firebase link
    const postData = {
      title: cleanHtml.replace(/<[^>]*>/g, '').substring(0, 100) + (cleanHtml.length > 100 ? '...' : ''), // Plain text title
      cover_image_url: attachments.length > 0 ? attachments[0] : 'https://via.placeholder.com/400x200?text=No+Image',
      description_url: htmlUrl, // Firebase Storage URL instead of HTML content
    };

    console.log("Step 2: Saving metadata to backend...");
    console.log("Post metadata:", { 
      title: postData.title,
      cover_image_url: postData.cover_image_url,
      description_url: postData.description_url,
      user: cleanUser,
      attachmentsCount: attachments.length
    });

    // Save to backend API
    const response = await axiosConfig.post('/dashboard/blog', postData);
    console.log("Post metadata saved to backend:", response.data);
    
    return {
      id: response.data.id || response.data.data?.id,
      htmlUrl: htmlUrl,
      backendData: response.data
    };
  } catch (error) {
    console.error("Error saving post (hybrid approach):", error);
    throw new Error(`Failed to save post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function savePostToFirestore({ html, user, attachments = [] }: SavePostPayload) {
  try {
    console.log("Attempting to save post to Firestore...");
    
    // Validate required data
    if (!html || html.trim() === '') {
      throw new Error('Post content cannot be empty');
    }

    // Clean and prepare data
    const cleanHtml = html.trim();
    const cleanUser = user ? {
      name: user.name || 'Anonymous',
      avatar: user.avatar || null,
      id: user.id || null
    } : null;

    const postData = {
      html: cleanHtml,
      user: cleanUser,
      attachments: Array.isArray(attachments) ? attachments : [],
      createdAt: serverTimestamp(),
      // Add additional metadata
      status: 'published',
      views: 0,
      likes: 0,
    };

    console.log("Post data to save:", { 
      ...postData, 
      html: cleanHtml.substring(0, 100) + '...',
      user: cleanUser,
      attachmentsCount: postData.attachments.length
    });

    // Add a small delay to ensure connection is stable
    await new Promise(resolve => setTimeout(resolve, 100));

    const docRef = await addDoc(collection(db, "posts"), postData);
    console.log("Post saved successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving post to Firestore:", error);
    
    // More detailed error handling
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        throw new Error('Không có quyền truy cập Firestore. Vui lòng kiểm tra cấu hình bảo mật.');
      } else if (error.message.includes('network')) {
        throw new Error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
      } else if (error.message.includes('quota')) {
        throw new Error('Đã vượt quá giới hạn Firestore. Vui lòng thử lại sau.');
      }
    }
    
    throw new Error(`Failed to save post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


