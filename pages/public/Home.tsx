
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ArrowRight, Layers, Zap, Shield, Calendar, User, MessageSquare, Quote } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';
import { Card } from '../../components/ui/Card';
import { formatDate } from '../../utils/date';

export const Home = () => {
  const { t, isRTL, config, posts, comments, categories, lang } = useApp();
  const navigate = useNavigate();

  useSeo({
    title: t('welcome'),
    description: config.siteDescription,
    type: 'website'
  });

  // Get Latest 3 Published Posts
  const latestPosts = posts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Get Latest 3 Approved Comments
  const recentComments = comments
    .filter(c => c.status === 'approved')
    .slice(0, 3);

  const Feature = ({ icon: Icon, title, desc }: any) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center md:text-start transition-transform hover:-translate-y-1">
      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center text-primary-600 mb-4 mx-auto md:mx-0">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-950 py-20 lg:py-32 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            {t('hero_title')} <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">{config.siteName}</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
            {t('hero_subtitle')}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/login')} className="px-8 py-3 text-lg h-auto rounded-2xl">
              {t('get_started')} {isRTL ? <ArrowLeft className="mr-2" /> : <ArrowRight className="ml-2" />}
            </Button>
            <Button variant="secondary" className="px-8 py-3 text-lg h-auto rounded-2xl">
              {t('documentation')}
            </Button>
          </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 opacity-30 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Feature 
                icon={Layers} 
                title={t('modular_design')} 
                desc={t('modular_desc')}
              />
              <Feature 
                icon={Shield} 
                title={t('enterprise_security')} 
                desc={t('security_desc')}
              />
              <Feature 
                icon={Zap} 
                title={t('lightning_fast')} 
                desc={t('fast_desc')}
              />
           </div>
        </div>
      </div>

      {/* Latest Posts Section */}
      {latestPosts.length > 0 && (
        <div className="py-24 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">{t('blog')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {t('smart_assistant_desc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {latestPosts.map(post => {
                        const category = categories.find(c => c.id === post.categoryId);
                        return (
                            <Link key={post.id} to={`/blog/${category?.slug || 'uncategorized'}/${post.id}-${post.slug}`} className="group h-full">
                                <Card className="h-full flex flex-col p-0 overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
                                    {post.featuredImage && (
                                        <div className="h-56 overflow-hidden relative">
                                            <img 
                                                src={post.featuredImage} 
                                                alt={post.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                            <div className="absolute bottom-4 right-4 rtl:right-4 rtl:left-auto ltr:left-4 ltr:right-auto text-white text-xs font-bold bg-primary-600 px-3 py-1 rounded-full shadow-lg">
                                                {category?.name}
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} /> {formatDate(post.publishDate || post.createdAt, lang)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User size={12} /> {post.author}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm font-bold text-primary-600">
                                            {t('read_more')}
                                            {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
                
                <div className="text-center mt-12">
                    <Link to="/blog">
                        <Button variant="secondary" className="rounded-full px-8">
                            {t('view_site')} {t('blog')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
      )}

      {/* User Comments (Testimonials) Section */}
      {recentComments.length > 0 && (
          <div className="py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <MessageSquare size={300} />
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">{t('recent_comments')}</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                          {t('comment_moderation_msg').split('.')[0]}
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {recentComments.map((comment) => (
                          <div key={comment.id} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 relative">
                              <div className="absolute -top-4 right-8 rtl:right-auto rtl:left-8 bg-primary-500 text-white p-2 rounded-xl shadow-lg">
                                  <Quote size={20} fill="currentColor" />
                              </div>
                              
                              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed italic relative z-10">
                                  "{comment.content.length > 120 ? comment.content.substring(0, 120) + '...' : comment.content}"
                              </p>
                              
                              <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                                  {comment.avatar ? (
                                      <img src={comment.avatar} alt={comment.author} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900" />
                                  ) : (
                                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                                          {comment.author.charAt(0)}
                                      </div>
                                  )}
                                  <div>
                                      <h4 className="font-bold text-gray-900 dark:text-white">{comment.author}</h4>
                                      <span className="text-xs text-gray-400">{formatDate(comment.date, lang)}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
