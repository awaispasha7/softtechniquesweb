'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Timestamp removed - not used
import Navbar from '../../components/Navbar';
import ChatProvider from '../../components/ChatProvider';
import { getBlogPosts, saveBlogPost, deleteBlogPost, updateBlogPost, uploadBlogImages, BlogPost } from '../../lib/blogService';
import { parseDocument } from '../../lib/fileParser';
import { uploadDocumentToCloudinary } from '../../lib/cloudinary';
import { useAuth } from '@/components/AuthProvider';
import { signOutUser } from '@/lib/authService';
import { isAdmin } from '@/lib/adminUtils';

export default function BlogPage(): React.JSX.Element {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const userIsAdmin = isAdmin(userData, user?.email || null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedElements, setAnimatedElements] = useState<number[]>([]);
  const [isWritingMode, setIsWritingMode] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: userData?.displayName || 'SoftTechniques Team',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  // documentFile removed - not used
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Update author when user data loads
  useEffect(() => {
    if (userData?.displayName) {
      setNewPost(prev => ({ ...prev, author: userData.displayName }));
    }
  }, [userData]);

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
    // Check authentication
    if (!user || !user.uid) {
      router.push('/auth/login');
      return;
    }

    if (newPost.title && newPost.content) {
      if (isEditing && editingPost) {
        await handleUpdatePost();
      } else {
        setSavingPost(true);
        try {
          const postData = {
            title: newPost.title,
            content: newPost.content,
            excerpt: newPost.excerpt || newPost.content.substring(0, 150) + '...',
            author: newPost.author,
            date: new Date().toISOString().split('T')[0],
            tags: newPost.tags,
            readTime: Math.ceil(newPost.content.split(' ').length / 200) + ' min read'
          };

          // Save to Firebase first to get post ID (requires userId)
          const postId = await saveBlogPost(postData, user.uid, userData?.displayName);
          console.log('✅ Blog post saved successfully');
          
          // Upload images if any (don't block publishing if this fails)
          if (selectedImages.length > 0) {
            setUploadingImages(true);
            // Upload images in background - don't wait for it to complete
            uploadBlogImages(selectedImages, postId)
              .then((imageUrls) => {
                console.log('✅ Images uploaded successfully:', imageUrls);
                if (imageUrls && imageUrls.length > 0) {
                  // Update the post with image URLs if upload succeeds (requires userId)
                  return updateBlogPost(postId, { images: imageUrls }, user.uid, userIsAdmin);
                } else {
                  throw new Error('No image URLs returned');
                }
              })
              .then(() => {
                console.log('✅ Post updated with image URLs');
                // Reload posts to show updated post with images
                return getBlogPosts();
              })
              .then((posts) => {
                console.log('✅ Reloaded posts with images');
                setBlogPosts(posts);
                setUploadingImages(false);
              })
              .catch((error: unknown) => {
                console.error('❌ Error uploading/updating images:', error);
                if (error && typeof error === 'object' && 'code' in error) {
                  console.error('Error code:', (error as { code?: string }).code);
                }
                if (error && typeof error === 'object' && 'message' in error) {
                  console.error('Error message:', (error as { message?: string }).message);
                }
                setUploadingImages(false);
                // Errors are logged to console, no alert shown
              });
          }
          
          // Reload posts to show the new post immediately (even without images)
          const updatedPosts = await getBlogPosts();
          setBlogPosts(updatedPosts);
          
          setNewPost({
            title: '',
            content: '',
            excerpt: '',
            author: 'SoftTechniques Team',
            tags: [],
          });
          setSelectedImages([]);
          setImagePreviews([]);
          setIsWritingMode(false);
          setSavingPost(false);
        } catch (error: unknown) {
          console.error('Error saving blog post:', error);
          setSavingPost(false);
          // Errors are logged to console, no alert shown
        }
      }
    }
  };

  const handleReadMore = async (post: BlogPost) => {
    // Reload the post to get latest images
    try {
      const allPosts = await getBlogPosts();
      const updatedPost = allPosts.find(p => p.id === post.id);
      if (updatedPost) {
        console.log('Post images:', updatedPost.images);
        setSelectedPost(updatedPost);
      } else {
        setSelectedPost(post);
      }
    } catch (error) {
      console.error('Error reloading post:', error);
      setSelectedPost(post);
    }
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
    setImagePreviews(post.images || []);
    setSelectedImages([]);
    setIsEditing(true);
    setIsWritingMode(true);
  };

  const handleUpdatePost = async () => {
    // Check authentication
    if (!user || !user.uid) {
      router.push('/auth/login');
      return;
    }

    if (editingPost && newPost.title && newPost.content) {
      setSavingPost(true);
      try {
        const updatedData = {
          title: newPost.title,
          content: newPost.content,
          excerpt: newPost.excerpt || newPost.content.substring(0, 150) + '...',
          author: newPost.author,
          tags: newPost.tags,
          readTime: Math.ceil(newPost.content.split(' ').length / 200) + ' min read'
        };

        await updateBlogPost(editingPost.id, updatedData, user.uid, userIsAdmin);
        console.log('✅ Blog post updated successfully');
        
        // Handle images: keep existing ones that are still in previews, add new ones
        const existingImageUrls = imagePreviews.filter(p => p.startsWith('http'));
        let finalImageUrls = existingImageUrls;
        
        // Update with existing images first (in case some were removed)
        await updateBlogPost(editingPost.id, { images: finalImageUrls }, user.uid, userIsAdmin);
        
        // Upload new images if any (don't block update if this fails)
        if (selectedImages.length > 0) {
          setUploadingImages(true);
          // Upload images in background
          uploadBlogImages(selectedImages, editingPost.id)
            .then((newImageUrls) => {
              finalImageUrls = [...existingImageUrls, ...newImageUrls];
              return updateBlogPost(editingPost.id, { images: finalImageUrls }, user.uid, userIsAdmin);
            })
            .then(() => {
              // Reload posts to show updated post with images
              return getBlogPosts();
            })
            .then(setBlogPosts)
            .catch((error) => {
              console.error('Error uploading images:', error);
              // Errors are logged to console, no alert shown
            })
            .finally(() => {
              setUploadingImages(false);
            });
        }
        
        // Reload posts to ensure we have the latest data (even without new images)
        const updatedPosts = await getBlogPosts();
        setBlogPosts(updatedPosts);

        // Reset form and editing state
        setNewPost({
          title: '',
          content: '',
          excerpt: '',
          author: 'SoftTechniques Team',
          tags: [],
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setEditingPost(null);
        setIsEditing(false);
        setIsWritingMode(false);
        setSavingPost(false);
      } catch (error) {
        console.error('Error updating blog post:', error);
        setSavingPost(false);
        // Errors are logged to console, no alert shown
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    // Check authentication
    if (!user || !user.uid) {
      router.push('/auth/login');
      return;
    }

    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await deleteBlogPost(postId, user.uid);
        console.log('✅ Blog post deleted successfully');
        // Clear form state when deleting
        setNewPost({
          title: '',
          content: '',
          excerpt: '',
          author: 'SoftTechniques Team',
          tags: [],
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setIsEditing(false);
        setEditingPost(null);
        // Reload posts to ensure we have the latest data
        const updatedPosts = await getBlogPosts();
        setBlogPosts(updatedPosts);
      } catch (error) {
        console.error('Error deleting blog post:', error);
        // Errors are logged to console, no alert shown
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
    setSelectedImages([]);
    setImagePreviews([]);
    setEditingPost(null);
    setIsEditing(false);
    setIsWritingMode(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files]);
      
      // Create previews for new files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    // Check if it's an existing image (URL) or a new preview (data URL)
    const preview = imagePreviews[index];
    const isExistingImage = preview && preview.startsWith('http');
    
    if (isExistingImage) {
      // Remove from previews only (existing images from Firebase)
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
      // Note: We don't delete from Firebase here - user can do that separately if needed
    } else {
      // Remove new image preview and file
      const newImageIndex = index - (imagePreviews.filter(p => p.startsWith('http')).length);
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
      setSelectedImages(prev => prev.filter((_, i) => i !== newImageIndex));
    }
  };

  // Handle PDF/Word document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type || file.name.split('.').pop()?.toLowerCase();
    const isValidFile = 
      fileType === 'application/pdf' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.name.toLowerCase().endsWith('.doc');

    if (!isValidFile) {
      console.error('Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx)');
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
      return;
    }

    // documentFile removed - not used
    setUploadingDocument(true);

    try {
      // Upload file to Cloudinary (better CORS support)
      const fileUrl = await uploadDocumentToCloudinary(file, 'blog-documents');
      console.log('✅ Document uploaded to Cloudinary:', fileUrl);

      // Parse document to extract text and images
      const parsed = await parseDocument(file);
      
      // Set the extracted content
      setNewPost(prev => ({
        ...prev,
        title: parsed.title || prev.title || file.name.replace(/\.(pdf|docx?|doc)$/i, ''),
        content: parsed.text,
        excerpt: parsed.text.substring(0, 150) + '...',
      }));

      // Add extracted images
      if (parsed.images && parsed.images.length > 0) {
        setSelectedImages(prev => [...prev, ...parsed.images]);
        parsed.images.forEach(imageFile => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(imageFile);
        });
      }

      // Automatically open writing mode to show the extracted content
      setIsWritingMode(true);
      setIsUploadMode(false);
      
      console.log(`✅ Document uploaded successfully! File saved to Cloudinary. Text extracted: ${parsed.text.length} characters. Images found: ${parsed.images.length}`);
    } catch (error: unknown) {
      console.error('Error uploading document:', error);
      console.error('Please check: File is not password-protected, file size is under 10MB, file format is supported (.pdf, .doc, .docx)');
    } finally {
      setUploadingDocument(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };

  // Rich text formatting functions
  const insertTextAtCursor = (before: string, after: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newPost.content.substring(start, end);
    const textBefore = newPost.content.substring(0, start);
    const textAfter = newPost.content.substring(end);

    // Save current scroll position to maintain view
    const currentScrollTop = textarea.scrollTop;
    const currentScrollLeft = textarea.scrollLeft;
    
    // If text is selected, wrap it; otherwise, insert markers and place cursor between them
    if (selectedText) {
      const newText = textBefore + before + selectedText + after + textAfter;
      setNewPost(prev => ({ ...prev, content: newText }));
      
      // Restore selection and scroll position after state update
      setTimeout(() => {
        const textareaEl = contentTextareaRef.current;
        if (textareaEl) {
          textareaEl.focus();
          const newStart = start + before.length;
          const newEnd = end + before.length;
          textareaEl.setSelectionRange(newStart, newEnd);
          textareaEl.scrollTop = currentScrollTop;
          textareaEl.scrollLeft = currentScrollLeft;
        }
      }, 20);
    } else {
      const newText = textBefore + before + after + textAfter;
      setNewPost(prev => ({ ...prev, content: newText }));
      
      setTimeout(() => {
        const textareaEl = contentTextareaRef.current;
        if (textareaEl) {
          textareaEl.focus();
          const newCursorPos = start + before.length;
          textareaEl.setSelectionRange(newCursorPos, newCursorPos);
          textareaEl.scrollTop = currentScrollTop;
          textareaEl.scrollLeft = currentScrollLeft;
        }
      }, 20);
    }
  };

  const formatBold = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    insertTextAtCursor('**', '**');
  };
  const formatItalic = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    insertTextAtCursor('*', '*');
  };
  const formatUnderline = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    insertTextAtCursor('<u>', '</u>');
  };
  const formatStrikethrough = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    insertTextAtCursor('~~', '~~');
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatCode = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    insertTextAtCursor('`', '`');
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatSubscript = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    insertTextAtCursor('<sub>', '</sub>');
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatSuperscript = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    insertTextAtCursor('<sup>', '</sup>');
  };
  
  // Font size formatting functions - Word style (just number, adds px)
  const formatFontSize = (size: string, e?: React.ChangeEvent<HTMLSelectElement>) => {
    if (e) {
      e.stopPropagation();
    }
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    
    const currentScrollTop = textarea.scrollTop;
    const currentScrollLeft = textarea.scrollLeft;
    
    const fontSize = size + 'px';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newPost.content.substring(start, end);
    const textBefore = newPost.content.substring(0, start);
    const textAfter = newPost.content.substring(end);
    
    if (selectedText) {
      const spanTag = `<span style="font-size: ${fontSize};">`;
      const newText = textBefore + spanTag + selectedText + '</span>' + textAfter;
      setNewPost(prev => ({ ...prev, content: newText }));
      setTimeout(() => {
        setTimeout(() => {
          textarea.focus();
          const newStart = start + spanTag.length;
          const newEnd = end + spanTag.length;
          textarea.setSelectionRange(newStart, newEnd);
          textarea.scrollTop = currentScrollTop;
          textarea.scrollLeft = currentScrollLeft;
        }, 10);
      }, 0);
    } else {
      const spanTag = `<span style="font-size: ${fontSize};">`;
      const newText = textBefore + spanTag + '</span>' + textAfter;
      setNewPost(prev => ({ ...prev, content: newText }));
      setTimeout(() => {
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + spanTag.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.scrollTop = currentScrollTop;
          textarea.scrollLeft = currentScrollLeft;
        }, 10);
      }, 0);
    }
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatCodeBlock = () => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newPost.content.substring(start, end);
    const textBefore = newPost.content.substring(0, start);
    const textAfter = newPost.content.substring(end);
    
    if (selectedText) {
      const newText = textBefore + '```\n' + selectedText + '\n```' + textAfter;
      setNewPost(prev => ({ ...prev, content: newText }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 4, end + 4);
      }, 0);
    } else {
      const newText = textBefore + '```\n\n```' + textAfter;
      setNewPost(prev => ({ ...prev, content: newText }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 4, start + 4);
      }, 0);
    }
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatBlockquote = () => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lineStart = newPost.content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = newPost.content.indexOf('\n', start);
    const line = lineEnd === -1 
      ? newPost.content.substring(lineStart)
      : newPost.content.substring(lineStart, lineEnd);
    
    const newLine = '> ' + line.trim();
    const before = newPost.content.substring(0, lineStart);
    const after = lineEnd === -1 ? '' : newPost.content.substring(lineEnd);
    
    setNewPost(prev => ({ ...prev, content: before + newLine + after }));
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = lineStart + newLine.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatHorizontalRule = () => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const textBefore = newPost.content.substring(0, start);
    const textAfter = newPost.content.substring(start);
    const newText = textBefore + (textBefore.endsWith('\n') ? '' : '\n') + '---\n' + textAfter;
    
    setNewPost(prev => ({ ...prev, content: newText }));
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (textBefore.endsWith('\n') ? 0 : 1) + 5;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  const formatHeading = (level: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const prefix = '#'.repeat(level) + ' ';
    insertTextAtCursor(prefix, '');
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatLink = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newPost.content.substring(start, end);
    
    if (selectedText) {
      insertTextAtCursor('[', `](${selectedText})`);
    } else {
      insertTextAtCursor('[Link Text](', ')');
    }
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newPost.content.substring(start, end);
    
    if (selectedText) {
      insertTextAtCursor('![', `](${selectedText})`);
    } else {
      insertTextAtCursor('![Alt Text](', ')');
    }
  };
  
  // Helper function to find the last numbered list item number before a position
  const findLastNumberedListItem = (text: string, beforePosition: number): number => {
    const textBefore = text.substring(0, beforePosition);
    const lines = textBefore.split('\n');
    let lastNumber = 0;
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      const match = line.match(/^(\d+)\.\s/);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > lastNumber) {
          lastNumber = number;
        }
        if (i > 0) {
          const prevLine = lines[i - 1].trim();
          const prevMatch = prevLine.match(/^(\d+)\.\s/);
          if (!prevMatch) {
            break;
          }
        }
      } else if (line.trim() !== '' && lastNumber > 0) {
        break;
      }
    }
    
    return lastNumber;
  };

  const formatList = (ordered: boolean = false, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    
    const currentScrollTop = textarea.scrollTop;
    const currentScrollLeft = textarea.scrollLeft;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newPost.content.substring(start, end);
    
    let startNumber = 1;
    if (ordered) {
      startNumber = findLastNumberedListItem(newPost.content, start) + 1;
    }
    
    if (selectedText && selectedText.includes('\n')) {
      const lines = selectedText.split('\n');
      const listItems = lines
        .filter(line => line.trim() !== '')
        .map((line, index) => {
          if (ordered) {
            return `${startNumber + index}. ${line.trim()}`;
          } else {
            return `- ${line.trim()}`;
          }
        })
        .join('\n');
      
      const textBefore = newPost.content.substring(0, start);
      const textAfter = newPost.content.substring(end);
      const newText = textBefore + listItems + textAfter;
      
      setNewPost(prev => ({ ...prev, content: newText }));
      
      setTimeout(() => {
        setTimeout(() => {
          textarea.focus();
          textarea.scrollTop = currentScrollTop;
          textarea.scrollLeft = currentScrollLeft;
          textarea.setSelectionRange(start, start + listItems.length);
        }, 10);
      }, 0);
    } else if (selectedText && selectedText.trim() !== '') {
      const listItem = ordered 
        ? `${startNumber}. ${selectedText.trim()}`
        : `- ${selectedText.trim()}`;
      const textBefore = newPost.content.substring(0, start);
      const textAfter = newPost.content.substring(end);
      const newText = textBefore + listItem + textAfter;
      
      setNewPost(prev => ({ ...prev, content: newText }));
      
      setTimeout(() => {
        setTimeout(() => {
          textarea.focus();
          textarea.scrollTop = currentScrollTop;
          textarea.scrollLeft = currentScrollLeft;
          const newStart = start;
          const newEnd = start + listItem.length;
          textarea.setSelectionRange(newStart, newEnd);
        }, 10);
      }, 0);
    } else {
      const lineStart = newPost.content.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = newPost.content.indexOf('\n', start);
      const line = lineEnd === -1 
        ? newPost.content.substring(lineStart)
        : newPost.content.substring(lineStart, lineEnd);
      
      const newLine = ordered 
        ? `${startNumber}. ${line.trim()}`
        : `- ${line.trim()}`;
      const before = newPost.content.substring(0, lineStart);
      const after = lineEnd === -1 ? '' : newPost.content.substring(lineEnd);
      
      setNewPost(prev => ({ ...prev, content: before + newLine + after }));
      
      setTimeout(() => {
        setTimeout(() => {
          textarea.focus();
          textarea.scrollTop = currentScrollTop;
          textarea.scrollLeft = currentScrollLeft;
          const newCursorPos = lineStart + newLine.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 10);
      }, 0);
    }
  };

  // Helper function to parse bold markdown (**text**) and render it
  const parseBoldText = (text: string): React.ReactNode[] => {
    if (!text.includes('**')) {
      return [text];
    }
    const parts = text.split('**');
    return parts.map((part, index) => 
      index % 2 === 1 ? (
        <strong key={index} className="font-bold">{part}</strong>
      ) : (
        part
      )
    );
  };

  // Helper function to parse all formatting (bold, italic, underline, strikethrough, code, sub, sup)
  const parseFormattedText = (text: string): React.ReactNode => {
    if (!text) return text;
    
    const processText = (input: string, keyPrefix: string = '', depth: number = 0): React.ReactNode => {
      if (!input) return input;
      
      if (depth > 10) {
        console.warn('Max recursion depth reached in parseFormattedText');
        return input;
      }
      
      // Parse bold (**text**) FIRST to handle bold wrapping font-size spans
      if (input.includes('**')) {
        const boldParts = input.split('**');
        const parts: React.ReactNode[] = [];
        
        for (let i = 0; i < boldParts.length; i++) {
          if (i % 2 === 1) {
            // Odd indices are bold content - may contain font-size spans
            parts.push(
              <strong key={`${keyPrefix}-bold-${i}`} className="font-bold text-white">
                {processText(boldParts[i], `${keyPrefix}-bold-${i}`, depth + 1)}
              </strong>
            );
          } else {
            // Even indices are regular text (may contain font-size spans)
            if (boldParts[i]) {
              parts.push(processText(boldParts[i], `${keyPrefix}-text-${i}`, depth + 1));
            }
          }
        }
        
        if (parts.length > 0 || boldParts.length > 1) {
          return parts.length > 0 ? parts : processText(input, keyPrefix, depth + 1);
        }
      }
      
      // Parse font size span tags - process after bold to handle font-size with bold inside
      if (input.includes('font-size')) {
        const exactRegex = /<span style="font-size:\s*([^"]+);">([\s\S]*?)<\/span>/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let keyIndex = 0;
        
        const allMatches: Array<{index: number, fullMatch: string, fontSize: string, content: string}> = [];
        let tempMatch;
        
        exactRegex.lastIndex = 0;
        while ((tempMatch = exactRegex.exec(input)) !== null) {
          allMatches.push({ 
            index: tempMatch.index, 
            fullMatch: tempMatch[0],
            fontSize: tempMatch[1].trim(),
            content: tempMatch[2]
          });
        }
        
        if (allMatches.length === 0) {
          const flexibleRegex = /<span\s+style\s*=\s*["']font-size:\s*([^"';]+)["'];?\s*["']?\s*>([\s\S]*?)<\/span>/gi;
          flexibleRegex.lastIndex = 0;
          while ((tempMatch = flexibleRegex.exec(input)) !== null) {
            allMatches.push({ 
              index: tempMatch.index, 
              fullMatch: tempMatch[0],
              fontSize: tempMatch[1].trim(),
              content: tempMatch[2]
            });
          }
        }
        
        for (const match of allMatches) {
          if (match.index > lastIndex) {
            const beforeText = input.substring(lastIndex, match.index);
            if (beforeText.trim()) {
              parts.push(processText(beforeText, `${keyPrefix}-before-${keyIndex}`, depth + 1));
            }
          }
          
          let fontSize = match.fontSize.trim();
          // Ensure fontSize is a valid CSS value with units
          if (fontSize && !fontSize.includes('px') && !fontSize.includes('em') && !fontSize.includes('%') && !fontSize.includes('rem') && !isNaN(Number(fontSize))) {
            fontSize = fontSize + 'px';
          }
          
          // Process the content inside the font-size span to handle any nested formatting (bold, etc.)
          // This recursive call will process bold markdown (**text**) inside the font-size span
          const processedContent = processText(match.content, `${keyPrefix}-font-${keyIndex}`, depth + 1);
          
          // Ensure fontSize is a valid CSS string - must be a string for React inline styles
          // Make sure it has units if it's just a number
          let fontSizeValue: string = (fontSize && fontSize.trim()) ? String(fontSize.trim()) : 'inherit';
          if (fontSizeValue !== 'inherit' && !fontSizeValue.includes('px') && !fontSizeValue.includes('em') && !fontSizeValue.includes('%') && !fontSizeValue.includes('rem')) {
            if (!isNaN(Number(fontSizeValue))) {
              fontSizeValue = fontSizeValue + 'px';
            }
          }
          
          // Apply font-size style - this will work with bold inside because processedContent
          // already contains the <strong> tags from recursive processing
          parts.push(
            <span 
              key={`${keyPrefix}-font-${keyIndex}`} 
              style={{ 
                fontSize: fontSizeValue as React.CSSProperties['fontSize'],
                display: 'inline',
                lineHeight: 'inherit'
              }}
            >
              {processedContent}
            </span>
          );
          
          lastIndex = match.index + match.fullMatch.length;
          keyIndex++;
        }
        
        if (lastIndex < input.length) {
          const afterText = input.substring(lastIndex);
          if (afterText.trim()) {
            parts.push(processText(afterText, `${keyPrefix}-after-${keyIndex}`, depth + 1));
          }
        }
        
        if (parts.length > 0) {
          return parts;
        }
      }
      
      // Parse strikethrough (~~text~~)
      if (input.includes('~~')) {
        const parts = input.split('~~');
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <del key={`${keyPrefix}-del-${index}`} className="line-through">{processText(part, `${keyPrefix}-del-${index}`, depth + 1)}</del>;
          } else {
            return processText(part, `${keyPrefix}-text-${index}`, depth + 1);
          }
        });
      }
      
      // Parse inline code (`text`)
      if (input.includes('`')) {
        const parts = input.split('`');
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <code key={`${keyPrefix}-code-${index}`} className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono">{part}</code>;
          } else {
            return processText(part, `${keyPrefix}-text-${index}`, depth + 1);
          }
        });
      }
      
      // Parse underline (<u>text</u>)
      if (input.includes('<u>')) {
        const parts = input.split(/<u>(.*?)<\/u>/);
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <u key={`${keyPrefix}-u-${index}`}>{processText(part, `${keyPrefix}-u-${index}`, depth + 1)}</u>;
          } else {
            return processText(part, `${keyPrefix}-text-${index}`, depth + 1);
          }
        });
      }
      
      // Parse italic (*text*)
      if (input.includes('*')) {
        const parts = input.split(/(?<!\*)\*(?!\*)/);
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <em key={`${keyPrefix}-em-${index}`}>{part}</em>;
          } else {
            return part;
          }
        });
      }
      
      // Parse subscript (<sub>text</sub>)
      if (input.includes('<sub>')) {
        const parts = input.split(/<sub>(.*?)<\/sub>/);
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <sub key={`${keyPrefix}-sub-${index}`}>{part}</sub>;
          } else {
            return processText(part, `${keyPrefix}-text-${index}`, depth + 1);
          }
        });
      }
      
      // Parse superscript (<sup>text</sup>)
      if (input.includes('<sup>')) {
        const parts = input.split(/<sup>(.*?)<\/sup>/);
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <sup key={`${keyPrefix}-sup-${index}`}>{part}</sup>;
          } else {
            return processText(part, `${keyPrefix}-text-${index}`, depth + 1);
          }
        });
      }
      
      return input;
    };
    
    return processText(text, 'format', 0);
  };

  // Helper function to render text with font-size placeholder replacement
  const renderTextWithFontSizes = (text: string, placeholders: { [key: string]: { fontSize: string, content: string } }): React.ReactNode => {
    if (!text) return text;
    
    let hasPlaceholder = false;
    for (const placeholder of Object.keys(placeholders)) {
      if (text.includes(placeholder)) {
        hasPlaceholder = true;
        break;
      }
    }
    
    if (!hasPlaceholder) {
      return parseFormattedText(text);
    }
    
    // First, replace all placeholders with actual font-size spans
    let processedText = text;
    for (const [placeholder, data] of Object.entries(placeholders)) {
      let fontSize = data.fontSize ? String(data.fontSize).trim() : '';
      // Ensure fontSize has units
      if (fontSize && !fontSize.includes('px') && !fontSize.includes('em') && !fontSize.includes('%') && !fontSize.includes('rem') && !isNaN(Number(fontSize))) {
        fontSize = fontSize + 'px';
      }
      // Replace placeholder with the actual span, preserving any markdown around it
      const spanContent = data.content;
      // Use exact format: font-size: value; (with semicolon)
      processedText = processedText.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        `<span style="font-size: ${fontSize};">${spanContent}</span>`
      );
    }
    
    // Now parse the entire text (including bold markdown around font-size spans)
    return parseFormattedText(processedText);
  };

  const formatContent = (content: string, images?: string[]) => {
    // Extract and replace font-size spans with placeholders
    let contentToProcess = content;
    const fontSizePlaceholders: { [key: string]: { fontSize: string, content: string } } = {};
    let placeholderIndex = 0;
    
    const fontSizeRegex = /<span style="font-size:\s*([^"]+);">([\s\S]*?)<\/span>/g;
    let match;
    const matches: Array<{index: number, full: string, fontSize: string, content: string}> = [];
    
    while ((match = fontSizeRegex.exec(content)) !== null) {
      matches.push({
        index: match.index,
        full: match[0],
        fontSize: match[1].trim(),
        content: match[2]
      });
    }
    
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const placeholder = `__FONTSIZE_${placeholderIndex}__`;
      fontSizePlaceholders[placeholder] = {
        fontSize: match.fontSize,
        content: match.content
      };
      contentToProcess = contentToProcess.substring(0, match.index) + 
                         placeholder + 
                         contentToProcess.substring(match.index + match.full.length);
      placeholderIndex++;
    }
    
    const contentLines = contentToProcess.split('\n');
    const imageArray = images || [];
    let imageIndex = 0;
    let paragraphCount = 0;
    const elements: React.ReactNode[] = [];
    
    const totalParagraphs = contentLines.filter(line => 
      line.trim() !== '' && 
      !line.startsWith('## ') && 
      !line.startsWith('### ') && 
      !line.startsWith('- ') && 
      !line.match(/^\d+\.\s/)
    ).length;
    
    const imageSpacing = totalParagraphs > 0 && imageArray.length > 0 
      ? Math.max(2, Math.floor(totalParagraphs / (imageArray.length + 1)))
      : 3;
    
    let i = 0;
    while (i < contentLines.length) {
      const line = contentLines[i];
      const lineIndex = i;
      const isParagraph = line.trim() !== '' && 
        !line.startsWith('## ') && 
        !line.startsWith('### ') && 
        !line.startsWith('- ') && 
        !line.match(/^\d+\.\s/);
      
      if (isParagraph) {
        paragraphCount++;
        
        if (paragraphCount === 1 && imageIndex < imageArray.length) {
          const imageUrl = imageArray[imageIndex];
          elements.push(
            <div key={`img-${imageIndex}`} className="my-10 flex items-center justify-center">
              <img
                src={imageUrl}
                alt={`${selectedPost?.title || 'Blog'} - Image ${imageIndex + 1}`}
                className="w-full h-auto max-h-[800px] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={() => {
                  console.log('✅ Image loaded:', imageUrl);
                }}
              />
            </div>
          );
          imageIndex++;
        } else if (paragraphCount > 1 && paragraphCount % imageSpacing === 0 && imageIndex < imageArray.length) {
          const imageUrl = imageArray[imageIndex];
          elements.push(
            <div key={`img-${imageIndex}`} className="my-10 flex items-center justify-center">
              <img
                src={imageUrl}
                alt={`${selectedPost?.title || 'Blog'} - Image ${imageIndex + 1}`}
                className="w-full h-auto max-h-[800px] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={() => {
                  console.log('✅ Image loaded:', imageUrl);
                }}
              />
            </div>
          );
          imageIndex++;
        }
      }
      
      if (line.startsWith('## ')) {
        const headingText = line.replace('## ', '');
        elements.push(
          <h2 key={lineIndex} className="text-3xl font-bold text-white mt-10 mb-6">
            {parseBoldText(headingText)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        const headingText = line.replace('### ', '');
        elements.push(
          <h3 key={lineIndex} className="text-2xl font-semibold text-white mt-8 mb-4">
            {parseBoldText(headingText)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        const listContent = line.replace('- ', '');
        elements.push(
          <li key={lineIndex} className="text-white/70 mb-3 ml-6 list-disc">
            {renderTextWithFontSizes(listContent, fontSizePlaceholders)}
          </li>
        );
      } else if (line.match(/^\d+\.\s/)) {
        const numberedListItems: React.ReactNode[] = [];
        let j = i;
        
        while (j < contentLines.length && contentLines[j].match(/^\d+\.\s/)) {
          const numberedLine = contentLines[j];
          const numberMatch = numberedLine.match(/^(\d+)\.\s/);
          const number = numberMatch ? parseInt(numberMatch[1], 10) : 1;
          const listContent = numberedLine.replace(/^\d+\.\s/, '');
          
          if (listContent.trim().endsWith(':')) {
            break;
          } else {
            numberedListItems.push(
              <li key={j} data-number={number} className="numbered-list-item text-white/70 mb-2 pl-2" style={{ listStylePosition: 'outside' }}>
                {renderTextWithFontSizes(listContent, fontSizePlaceholders)}
              </li>
            );
          }
          j++;
        }
        
        if (numberedListItems.length > 0) {
          elements.push(
            <ol 
              key={`ol-${i}`} 
              className="numbered-list-visible ml-8 mb-6 space-y-3" 
            >
              {numberedListItems}
            </ol>
          );
          i = j - 1;
        } else {
          const listContent = line.replace(/^\d+\.\s/, '');
          elements.push(
            <h4 key={lineIndex} className="text-xl font-bold text-white mt-6 mb-3">
              {renderTextWithFontSizes(listContent, fontSizePlaceholders)}
            </h4>
          );
        }
      } else if (line.startsWith('> ')) {
        const quoteText = line.replace('> ', '');
        elements.push(
          <blockquote key={lineIndex} className="border-l-4 border-white/40 pl-4 my-6 italic text-white/70">
            {renderTextWithFontSizes(quoteText, fontSizePlaceholders)}
          </blockquote>
        );
      } else if (line.trim().startsWith('```')) {
        elements.push(<br key={lineIndex} />);
      } else if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        elements.push(<hr key={lineIndex} className="my-8 border-white/20" />);
      } else if (line.trim() === '') {
        elements.push(<br key={lineIndex} />);
      } else {
        const trimmedLine = line.trim();
        const isLikelyHeading = trimmedLine.endsWith(':') && 
                                trimmedLine.length < 100 && 
                                trimmedLine.length > 0 &&
                                !trimmedLine.startsWith('http') &&
                                !trimmedLine.match(/^https?:\/\//) &&
                                trimmedLine.split(' ').length < 15;
        
        const isShortStandalone = trimmedLine.length > 0 && 
                                  trimmedLine.length < 80 &&
                                  trimmedLine.split(' ').length < 10 &&
                                  /^[A-Z]/.test(trimmedLine) &&
                                  !trimmedLine.includes('.') &&
                                  !trimmedLine.includes('?') &&
                                  !trimmedLine.includes('!');
        
        if (isLikelyHeading) {
          elements.push(
            <h4 key={lineIndex} className="text-xl font-bold text-white mt-6 mb-3">
              {parseBoldText(trimmedLine)}
            </h4>
          );
        } else if (isShortStandalone && lineIndex > 0) {
          const prevLine = contentLines[lineIndex - 1]?.trim();
          const nextLine = contentLines[lineIndex + 1]?.trim();
          if ((prevLine === '' || prevLine === undefined) && nextLine !== '' && nextLine !== undefined) {
            elements.push(
              <h4 key={lineIndex} className="text-xl font-bold text-white mt-6 mb-3">
                {parseBoldText(trimmedLine)}
              </h4>
            );
          } else {
            elements.push(
              <p key={lineIndex} className="text-white/70 mb-6 leading-relaxed text-lg">
                {renderTextWithFontSizes(line, fontSizePlaceholders)}
          </p>
        );
          }
      } else {
          elements.push(
            <p key={lineIndex} className="text-white/70 mb-6 leading-relaxed text-lg">
              {renderTextWithFontSizes(line, fontSizePlaceholders)}
            </p>
          );
        }
      }
      
      i++;
    }
    
    while (imageIndex < imageArray.length) {
      const imageUrl = imageArray[imageIndex];
      elements.push(
        <div key={`img-${imageIndex}`} className="my-10 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={`${selectedPost?.title || 'Blog'} - Image ${imageIndex + 1}`}
            className="w-full h-auto max-h-[800px] object-contain rounded-lg"
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            onLoad={() => {
              console.log('✅ Image loaded:', imageUrl);
            }}
          />
        </div>
      );
      imageIndex++;
    }
    
    return elements;
  };

  return (
    <ChatProvider>
      <style dangerouslySetInnerHTML={{__html: `
        .numbered-list-visible {
          list-style: none !important;
          padding-left: 0 !important;
        }
        .numbered-list-visible .numbered-list-item {
          position: relative;
          padding-left: 3rem !important;
          color: rgba(255, 255, 255, 0.9) !important;
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .numbered-list-visible .numbered-list-item::before {
          content: attr(data-number) ".";
          position: absolute;
          left: 0;
          top: 0;
          color: #ffffff !important;
          font-weight: normal;
          background-color: transparent !important;
          padding: 0 !important;
          border-radius: 0 !important;
          text-align: right;
          display: inline-block;
        }
        .font-size-select {
          background-color: #44559e !important;
        }
        .font-size-select option {
          background-color: #44559e !important;
          color: #ffffff !important;
          padding: 8px !important;
        }
        .font-size-select option:hover {
          background-color: #44559e !important;
        }
        .font-size-select option:checked,
        .font-size-select option:focus {
          background-color: #44559e !important;
        }
        select.font-size-select {
          background-color: rgba(41, 71, 61, 0.8) !important;
        }
      `}} />
      <div className="min-h-screen bg-[#44559e]">
        <div className="relative z-50">
          <Navbar />
        </div>
      
      {/* Background floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
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
          
          {/* Auth Status */}
          {!authLoading && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
              {user ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="text-sm sm:text-base text-white/80 text-center sm:text-left">
                    Signed in as <span className="font-semibold text-white break-words">{userData?.displayName || user.email}</span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await signOutUser();
                        router.push('/blog');
                      } catch (error) {
                        console.error('Error signing out:', error);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm min-h-[44px] touch-manipulation"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <span className="text-sm sm:text-base text-white/60 text-center sm:text-left">Sign in to create and manage posts</span>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Link
                      href="/auth/login"
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-[#44559e] hover:bg-white/90 rounded-lg transition-all text-sm font-semibold text-center min-h-[44px] touch-manipulation"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all text-sm font-semibold text-center min-h-[44px] touch-manipulation"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Write New Post or Upload Document Buttons - Only show if authenticated */}
          {user && (
            <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
              onClick={() => {
                if (!isWritingMode) {
                  // Clear form when starting a new post
                  setNewPost({
                    title: '',
                    content: '',
                    excerpt: '',
                    author: 'SoftTechniques Team',
                    tags: [],
                  });
                  setSelectedImages([]);
                  setImagePreviews([]);
                  setIsEditing(false);
                  setEditingPost(null);
                }
                setIsWritingMode(!isWritingMode);
                setIsUploadMode(false);
              }}
            className="group relative bg-white text-[#44559e] px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-white/30 overflow-hidden"
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

            <span className="text-white/60 text-lg">OR</span>

            <button
              onClick={() => {
                if (!uploadingDocument) {
                  setIsUploadMode(!isUploadMode);
                  setIsWritingMode(false);
                  if (!isUploadMode && documentInputRef.current) {
                    documentInputRef.current.click();
                  }
                }
              }}
              disabled={uploadingDocument}
              className="group relative bg-gradient-to-r from-green-600 to-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-green-500/30 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 group-hover:text-white transition-colors duration-300 flex items-center space-x-2">
                {uploadingDocument ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Upload Document</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 -top-2 -left-2 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
            </div>
          )}
          
          {/* Hidden document input */}
          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleDocumentUpload}
            className="hidden"
            id="document-upload-main"
          />
        </div>

        {/* Write New Post Form */}
        {isWritingMode && (
          <div className={`mb-8 transition-all duration-1000 transform ${
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

                {/* Image Upload */}
                <div className="group">
                  <label className="block text-white text-sm font-medium mb-2">Images</label>
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full px-4 py-3 bg-white/10 border-2 border-dashed border-white/20 rounded-lg text-white/60 hover:border-white/40 hover:text-white cursor-pointer transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Click to upload images or drag and drop</span>
                    </label>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group bg-white/10 rounded-lg border border-white/20 p-2">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-auto max-h-64 object-contain rounded-lg"
                            />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {uploadingImages && (
                      <div className="text-center py-2">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <p className="text-white/60 text-sm mt-2">Uploading images...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="group">
                  <label className="block text-white text-sm font-medium mb-2">Content</label>
                  
                  {/* Rich Text Toolbar */}
                  <div 
                    className="mb-2 bg-white/10 border border-white/20 rounded-t-lg"
                  >
                    <div 
                      className="p-2 flex items-center gap-1 flex-wrap border-b border-white/20"
                      onMouseDown={(e) => {
                        // Only stop propagation, don't prevent default
                        if (e.target !== e.currentTarget) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {/* Text Formatting Section */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => formatBold(e)}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-white/20 rounded transition-colors duration-200 group"
                          title="Bold (Ctrl+B)"
                        >
                          <svg className="w-5 h-5 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                          </svg>
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => formatItalic(e)}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-white/20 rounded transition-colors duration-200 group"
                          title="Italic (Ctrl+I)"
                        >
                          <svg className="w-5 h-5 text-white/70 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
                          </svg>
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => formatUnderline(e)}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-white/20 rounded transition-colors duration-200 group"
                          title="Underline (Ctrl+U)"
                        >
                          <svg className="w-5 h-5 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18h18" />
                          </svg>
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => formatStrikethrough(e)}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-white/20 rounded transition-colors duration-200 group"
                          title="Strikethrough"
                        >
                          <svg className="w-5 h-5 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="w-px h-6 bg-white/20 mx-1"></div>
                      
                      {/* Font Size Section */}
                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <select
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.value) {
                                formatFontSize(e.target.value, e);
                                e.target.value = '16';
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            className="font-size-select px-3 py-1.5 bg-[#44559e] hover:bg-[#36447e] text-white rounded text-sm font-medium cursor-pointer border border-white/20 focus:outline-none focus:border-white/40 transition-colors duration-200 appearance-none pr-8 min-w-[60px] text-center"
                            title="Font Size"
                            defaultValue="16"
                          >
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="14">14</option>
                            <option value="16">16</option>
                            <option value="18">18</option>
                            <option value="20">20</option>
                            <option value="24">24</option>
                            <option value="28">28</option>
                            <option value="30">30</option>
                            <option value="36">36</option>
                            <option value="48">48</option>
                            <option value="60">60</option>
                            <option value="72">72</option>
                            <option value="96">96</option>
                          </select>
                          <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-px h-6 bg-white/20 mx-1"></div>
                      
                      {/* Headings Section */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => formatHeading(1, e)}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="px-2.5 py-1.5 hover:bg-white/20 rounded transition-colors duration-200 text-white/70 hover:text-white text-xs font-bold"
                          title="Heading 1"
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={(e) => formatHeading(2, e)}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="px-2.5 py-1.5 hover:bg-white/20 rounded transition-colors duration-200 text-white/70 hover:text-white text-xs font-bold"
                          title="Heading 2"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={(e) => formatHeading(3, e)}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="px-2.5 py-1.5 hover:bg-white/20 rounded transition-colors duration-200 text-white/70 hover:text-white text-xs font-bold"
                          title="Heading 3"
                        >
                          H3
                        </button>
                      </div>
                      
                      <div className="w-px h-6 bg-white/20 mx-1"></div>
                      
                      {/* Lists Section */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => formatList(false, e)}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-white/20 rounded transition-colors duration-200 group"
                          title="Bullet List"
                        >
                          <svg className="w-5 h-5 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => formatList(true, e)}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-white/20 rounded transition-colors duration-200 group"
                          title="Numbered List"
                        >
                          <svg className="w-5 h-5 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <textarea
                    ref={contentTextareaRef}
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your blog post content here... Use the toolbar above to format your text."
                    rows={15}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 border-t-0 rounded-b-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 resize-none font-mono text-sm"
                  />
                  
                  {/* Formatting Help Text */}
                  <p className="mt-2 text-xs text-white/50">
                    💡 Tip: Select text and click formatting buttons, or use Markdown syntax: **bold**, *italic*, # Heading
                  </p>
                </div>

                 {/* Publish Button */}
                 <div className="flex justify-end">
                   <button
                     onClick={handlePublishPost}
                    disabled={!newPost.title || !newPost.content || savingPost}
                     className="group relative bg-white text-[#44559e] px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 group-hover:text-gray-800 transition-colors duration-300 flex items-center gap-2">
                      {savingPost ? (
                         <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-[#44559e] border-t-transparent"></div>
                          <span>{isEditing ? 'Updating...' : 'Publishing...'}</span>
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

                {/* Featured Image */}
                {post.images && post.images.length > 0 && (
                  <div className="mb-4 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full h-auto max-h-48 object-contain group-hover:scale-105 transition-transform duration-500 rounded-lg"
                    />
                  </div>
                )}

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
                      <span className="text-[#44559e] font-bold text-xs">ST</span>
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
                    
                    {/* Edit and Delete Buttons - Show if user owns the post or is admin */}
                    {user && (post.userId === user.uid || userIsAdmin) && (
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
                    )}
                  </div>
                </div>

                {/* Read More Button */}
                <button 
                  onClick={() => handleReadMore(post)}
                  className="group/btn w-full bg-white text-[#44559e] hover:bg-white/90 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-white/25 relative overflow-hidden"
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
           className="fixed inset-0 bg-[#44559e]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
           onClick={(e) => {
             if (e.target === e.currentTarget) {
               handleCloseModal();
             }
           }}
         >
           <div className="bg-[#44559e] backdrop-blur-sm rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/20 relative shadow-2xl shadow-white/20 animate-in zoom-in-95 duration-300">
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
                      <span className="text-[#44559e] font-bold">ST</span>
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

              {/* Content with Inline Images */}
              <div className="prose prose-invert max-w-none text-lg leading-relaxed">
                {formatContent(selectedPost.content, selectedPost.images)}
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-white to-green-200 rounded-full flex items-center justify-center">
                      <span className="text-[#44559e] font-bold text-xl">ST</span>
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
                    className="group bg-white text-[#44559e] px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-white/20 relative overflow-hidden"
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
