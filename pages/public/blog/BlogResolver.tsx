

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../../components/ui/Card';
import { User, Folder } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const BlogResolver = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, posts, t } = useApp();

  // 1. Check Category
  const category = categories.find(c => c.slug === slug);
  
  // 2. Check Author (using unique authors from posts as source of truth for public profiles)
  const isAuthor = posts.some(p => p.author === slug);
  const authorPosts = posts
    .filter(p => p.author === slug && p.status === 'published')
    .sort((a, b) => new Date(b.publishDate || b.createdAt).getTime() - new Date(a.publishDate || a.createdAt).getTime());

  if (category) {
      const catPosts = posts
        .filter(p => p.categoryId === category.id && p.status === 'published')
        .sort((a, b) => new Date(b.publishDate || b.createdAt).getTime() - new Date(a.publishDate || a.createdAt).getTime());

      return (
          <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="text-center mb-12">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                      <Folder size={32} />
                  </div>
                  <h1 className="text-3xl font-bold dark:text-white">{t('category')}: {category.name}</h1>
              </div>
              <PostList posts={catPosts} />
          </div>
      );
  }

  if (isAuthor) {
      return (
          <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="text-center mb-12">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                      <User size={32} />
                  </div>
                  <h1 className="text-3xl font-bold dark:text-white">{t('author_profile')}: {slug}</h1>
                  <p className="text-gray-500">{authorPosts.length} {t('posts')}</p>
              </div>
              <PostList posts={authorPosts} />
          </div>
      );
  }

  return <Navigate to="/404" />;
};

const PostList = ({ posts }: { posts: any[] }) => {
    if (posts.length === 0) return <p className="text-center text-gray-500">No posts found.</p>;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map(post => (
                <Link key={post.id} to={`/blog/post/${post.id}-${post.slug}`} className="group">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                        {post.featuredImage && (
                            <img src={post.featuredImage} alt={post.title} className="w-full h-48 object-cover rounded-t-xl" />
                        )}
                        <div className="p-4">
                            <h3 className="font-bold text-lg dark:text-white group-hover:text-primary-600 mb-2">{post.title}</h3>
                            <p className="text-gray-500 text-sm">{post.createdAt}</p>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
};
