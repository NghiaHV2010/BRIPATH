export interface BlogPost {
  id: string
  title: string
  description: string
  category: string
  image: string
  author?: string
  date?: string
  readTime?: string
  featured?: boolean
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
}
