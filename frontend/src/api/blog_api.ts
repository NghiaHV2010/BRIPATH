import axiosConfig from "@/config/axios.config";

export interface BlogPost {
  id?: number;
  title: string;
  cover_image_url: string;
  description_url: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CreateBlogResponse {
  success: boolean;
  data: BlogPost;
  message?: string;
}

export interface UpdateBlogResponse {
  success: boolean;
  data: BlogPost;
  message?: string;
}

export interface DeleteBlogResponse {
  success: boolean;
  message: string;
}

// ========================
// Create Blog Post
// ========================
export const createBlogPost = async (
  blogData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<CreateBlogResponse> => {
  try {
    const response = await axiosConfig.post<CreateBlogResponse>('/dashboard/blog', blogData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating blog post:", error.response?.data || error.message);
    throw error;
  }
};

// ========================
// Update Blog Post
// ========================
export const updateBlogPost = async (
  blogId: number,
  blogData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<UpdateBlogResponse> => {
  try {
    const response = await axiosConfig.put<UpdateBlogResponse>(`/dashboard/blog/${blogId}`, blogData);
    return response.data;
  } catch (error: any) {
    console.error("Error updating blog post:", error.response?.data || error.message);
    throw error;
  }
};

// ========================
// Delete Blog Post
// ========================
export const deleteBlogPost = async (blogId: number): Promise<DeleteBlogResponse> => {
  try {
    const response = await axiosConfig.delete<DeleteBlogResponse>(`/dashboard/blog/${blogId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting blog post:", error.response?.data || error.message);
    throw error;
  }
};

// ========================
// Get All Blog Posts (for future use)
// ========================
export const getAllBlogPosts = async (): Promise<{ success: boolean; data: BlogPost[] }> => {
  try {
    const response = await axiosConfig.get<{ success: boolean; data: BlogPost[] }>('/dashboard/blogs');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching blog posts:", error.response?.data || error.message);
    return { success: false, data: [] };
  }
};
