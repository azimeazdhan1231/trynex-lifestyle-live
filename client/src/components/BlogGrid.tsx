import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Calendar, User, ArrowRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  category: string;
  featured_image?: string;
  tags?: string[];
}

const BlogGrid = () => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['/api/blog/posts'],
    queryFn: async () => {
      const response = await fetch('/api/blog/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">ব্লগ পোস্ট লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">কোনো ব্লগ পোস্ট পাওয়া যায়নি।</p>
        <p className="text-sm text-gray-400 mt-2">নতুন পোস্ট শীঘ্রই প্রকাশিত হবে।</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post: BlogPost) => (
        <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-300" data-testid={`blog-post-${post.id}`}>
          {post.featured_image && (
            <div className="aspect-video overflow-hidden rounded-t-lg">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                data-testid={`blog-image-${post.id}`}
              />
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {post.category}
              </Badge>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(post.published_at), { 
                  addSuffix: true, 
                  locale: bn 
                })}
              </div>
            </div>
            
            <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
              {post.title}
            </CardTitle>
            
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-1" />
              {post.author}
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed mb-4" data-testid={`blog-excerpt-${post.id}`}>
              {post.excerpt}
            </p>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <Button 
              variant="ghost" 
              className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
              data-testid={`button-read-more-${post.id}`}
            >
              আরও পড়ুন
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BlogGrid;