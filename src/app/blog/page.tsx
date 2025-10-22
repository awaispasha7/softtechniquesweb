'use client';

import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import ChatProvider from '../../components/ChatProvider';
import { getBlogPosts, saveBlogPost, deleteBlogPost, updateBlogPost, BlogPost } from '../../lib/blogService';

export default function BlogPage(): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedElements, setAnimatedElements] = useState<number[]>([]);
  const [isWritingMode, setIsWritingMode] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: 'SoftTechniques Team',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    // Load blog posts from Firebase
    const loadBlogPosts = async () => {
      try {
        setLoading(true);
        console.log('📖 Loading blog posts from Firebase collection: softtechniquesBlogPosts');
        const posts = await getBlogPosts();
        console.log('✅ Loaded', posts.length, 'blog posts from Firebase');
        setBlogPosts(posts);
      } catch (error) {
        console.error('❌ Error loading blog posts from Firebase:', error);
        // No fallback data - show empty state
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();

    // Trigger main animation
    const timer = setTimeout(() => setIsVisible(true), 200);
    
    // Staggered animation for individual elements
    const elementTimers = [0, 1, 2, 3, 4, 5].map((index) => 
      setTimeout(() => {
        setAnimatedElements(prev => [...prev, index]);
      }, 300 + (index * 150))
    );

    return () => {
      clearTimeout(timer);
      elementTimers.forEach(clearTimeout);
    };
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
      setNewPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePublishPost = async () => {
    if (newPost.title && newPost.content && !isPublishing) {
      if (isEditing && editingPost) {
        await handleUpdatePost();
      } else {
        try {
          setIsPublishing(true);
          
          const postData = {
            title: newPost.title,
            content: newPost.content,
            excerpt: newPost.excerpt || newPost.content.substring(0, 150) + '...',
            author: newPost.author,
            date: new Date().toISOString().split('T')[0],
            tags: newPost.tags,
            readTime: Math.ceil(newPost.content.split(' ').length / 200) + ' min read'
          };

          // Save to Firebase
          console.log('🔥 Saving blog post to Firebase collection: softtechniquesBlogPosts');
          const postId = await saveBlogPost(postData);
          console.log('✅ Blog post saved successfully! Post ID:', postId);
          
          // Add to local state with the ID from Firebase
          const newBlogPost: BlogPost = {
            id: postId,
            ...postData,
            createdAt: Timestamp.now()
          };

          setBlogPosts(prev => [newBlogPost, ...prev]);
          setNewPost({
            title: '',
            content: '',
            excerpt: '',
            author: 'SoftTechniques Team',
            tags: [],
          });
          setIsWritingMode(false);
        } catch (error) {
          console.error('❌ Error saving blog post to Firebase:', error);
          alert('Failed to save blog post. Please try again.');
        } finally {
          setIsPublishing(false);
        }
      }
    }
  };

  const handleReadMore = (post: BlogPost) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      tags: post.tags,
    });
    setIsEditing(true);
    setIsWritingMode(true);
  };

  const handleUpdatePost = async () => {
    if (editingPost && newPost.title && newPost.content && !isPublishing) {
      try {
        setIsPublishing(true);
        
        const updatedData = {
          title: newPost.title,
          content: newPost.content,
          excerpt: newPost.excerpt || newPost.content.substring(0, 150) + '...',
          author: newPost.author,
          tags: newPost.tags,
          readTime: Math.ceil(newPost.content.split(' ').length / 200) + ' min read'
        };

        await updateBlogPost(editingPost.id, updatedData);
        
        // Update local state
        setBlogPosts(prev => prev.map(post => 
          post.id === editingPost.id 
            ? { ...post, ...updatedData }
            : post
        ));

        // Reset form and editing state
        setNewPost({
          title: '',
          content: '',
          excerpt: '',
          author: 'SoftTechniques Team',
          tags: [],
        });
        setEditingPost(null);
        setIsEditing(false);
        setIsWritingMode(false);
      } catch (error) {
        console.error('Error updating blog post:', error);
        alert('Failed to update blog post. Please try again.');
      } finally {
        setIsPublishing(false);
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await deleteBlogPost(postId);
        setBlogPosts(prev => prev.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting blog post:', error);
        alert('Failed to delete blog post. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setNewPost({
      title: '',
      content: '',
      excerpt: '',
      author: 'SoftTechniques Team',
      tags: [],
    });
    setEditingPost(null);
    setIsEditing(false);
    setIsWritingMode(false);
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">{line.replace('## ', '')}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-white mt-6 mb-3">{line.replace('### ', '')}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="text-gray-300 mb-2 ml-4">{line.replace('- ', '')}</li>;
      } else if (line.match(/^\d+\.\s/)) {
        return <li key={index} className="text-gray-300 mb-2 ml-4">{line.replace(/^\d+\.\s/, '')}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else if (line.includes('**') && line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="text-gray-300 mb-4">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? <strong key={partIndex} className="text-white">{part}</strong> : part
            )}
          </p>
        );
      } else {
        return <p key={index} className="text-gray-300 mb-4">{line}</p>;
      }
    });
  };

  return (
    <ChatProvider>
      <div className="min-h-screen bg-[#29473d]">
        <div className="relative z-50">
          <Navbar />
        </div>
      
      {/* Background floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="relative">
            {/* Floating background elements */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -top-5 -right-10 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 relative z-10">
              Software & <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-green-200 to-blue-200 animate-pulse">Technology Blog</span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            Stay updated with the latest trends, insights, and innovations in software development and technology.
          </p>
          
          {/* Write New Post Button */}
          <button
            onClick={() => setIsWritingMode(!isWritingMode)}
            className="group relative bg-white text-[#29473d] px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-white/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 group-hover:text-gray-900 transition-colors duration-300 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{isWritingMode ? 'Cancel Writing' : 'Write New Post'}</span>
            </span>
            <div className="absolute inset-0 -top-2 -left-2 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>

        {/* Write New Post Form */}
        {isWritingMode && (
          <div className={`mb-16 transition-all duration-1000 transform ${
            animatedElements.includes(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h2>
                {isEditing && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Title */}
                <div className="group">
                  <label className="block text-white text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter blog post title"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
                  />
                </div>

                {/* Excerpt */}
                <div className="group">
                  <label className="block text-white text-sm font-medium mb-2">Excerpt (Optional)</label>
                  <input
                    type="text"
                    value={newPost.excerpt}
                    onChange={(e) => setNewPost(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the post"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
                  />
                </div>

                {/* Tags */}
                <div className="group">
                  <label className="block text-white text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-white hover:text-white/70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add a tag"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
                    />
                    <button
                      onClick={handleAddTag}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg transition-colors duration-300"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="group">
                  <label className="block text-white text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your blog post content here... (Supports Markdown)"
                    rows={15}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 resize-none"
                  />
                </div>

                 {/* Publish Button */}
                 <div className="flex justify-end">
                   <button
                     onClick={handlePublishPost}
                     disabled={!newPost.title || !newPost.content || isPublishing}
                     className="group relative bg-white text-[#29473d] px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                     <span className="relative z-10 group-hover:text-gray-800 transition-colors duration-300 flex items-center space-x-2">
                       {isPublishing ? (
                         <>
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#29473d]"></div>
                           <span>Publishing...</span>
                         </>
                       ) : (
                         <span>{isEditing ? 'Update Post' : 'Publish Post'}</span>
                       )}
                     </span>
                     <div className="absolute inset-0 -top-2 -left-2 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                   </button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white/60 mt-4">Loading blog posts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className={`group relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-700 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/25 overflow-hidden ${
                animatedElements.includes(index + 1) 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{
                transitionDelay: `${(index + 1) * 150}ms`
              }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              
              {/* Floating particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-ping"></div>
              <div className="absolute top-8 right-8 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-6 right-12 w-1.5 h-1.5 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-600 group-hover:animate-ping" style={{ animationDelay: '1s' }}></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 hover:border-white/40 transition-all duration-300 group-hover:scale-105"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="text-white text-2xl font-bold mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-green-200 transition-all duration-500 line-clamp-2 leading-tight">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-white/70 text-sm mb-6 line-clamp-3 group-hover:text-white/90 transition-colors duration-300 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-white to-green-200 rounded-full flex items-center justify-center">
                      <span className="text-[#29473d] font-bold text-xs">ST</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{post.author}</p>
                      <p className="text-white/60 text-xs">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-white/60 text-xs">{post.readTime}</p>
                    </div>
                    
                    {/* Edit and Delete Buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPost(post);
                        }}
                        className="w-7 h-7 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/25 border border-white/30"
                        title="Edit this post"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id);
                        }}
                        className="w-7 h-7 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-red-300 hover:text-red-200 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25 border border-red-500/30"
                        title="Delete this post"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Read More Button */}
                <button 
                  onClick={() => handleReadMore(post)}
                  className="group/btn w-full bg-white text-[#29473d] hover:bg-white/90 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-white/25 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Read More</span>
                    <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-green-200 to-blue-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </article>
            ))}
          </div>
        )}
      </div>

       {/* Blog Post Modal */}
       {selectedPost && (
         <div 
           className="fixed inset-0 bg-[#29473d]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
           onClick={(e) => {
             if (e.target === e.currentTarget) {
               handleCloseModal();
             }
           }}
         >
           <div className="bg-[#29473d] backdrop-blur-sm rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/20 relative shadow-2xl shadow-white/20 animate-in zoom-in-95 duration-300">
             {/* Animated background */}
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl pointer-events-none"></div>
            
            {/* Close Button */}
            <div className="absolute top-6 right-6 z-50">
              <button
                onClick={() => {
                  console.log('Cross button clicked!');
                  setSelectedPost(null);
                }}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer"
                aria-label="Close modal"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-10 relative z-10">
              {/* Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                {selectedPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20 hover:border-white/40 transition-all duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
                {selectedPost.title}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-white/60 mb-10 pb-8 border-b border-white/20">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-white to-green-200 rounded-full flex items-center justify-center">
                      <span className="text-[#29473d] font-bold">ST</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">By {selectedPost.author}</p>
                      <p className="text-white/60 text-sm">
                        {new Date(selectedPost.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm">{selectedPost.readTime}</p>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none text-lg leading-relaxed">
                {formatContent(selectedPost.content)}
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-white to-green-200 rounded-full flex items-center justify-center">
                      <span className="text-[#29473d] font-bold text-xl">ST</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">SoftTechniques Team</p>
                      <p className="text-white/60">Software Development & Technology Experts</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      console.log('Close Article button clicked!');
                      e.preventDefault();
                      e.stopPropagation();
                      handleCloseModal();
                    }}
                    className="group bg-white text-[#29473d] px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-white/20 relative overflow-hidden"
                    aria-label="Close article"
                    type="button"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 group-hover:text-gray-900 transition-colors duration-300">
                      Close Article
                    </span>
                    <div className="absolute inset-0 -top-2 -left-2 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ChatProvider>
  );
}
