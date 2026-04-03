/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Laptop, 
  Watch, 
  Speaker, 
  Headphones, 
  ShoppingBag, 
  Info, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Lock, 
  Plus, 
  Trash2, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  ArrowRightLeft,
  DollarSign,
  Package,
  MessageSquare,
  Search,
  Edit,
  Check,
  CheckCircle,
  Printer,
  TrendingUp,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Globe,
  Heart,
  Sun,
  Moon,
  AlertCircle,
  BarChart3,
  Users,
  Clock,
  LayoutGrid,
  List as ListIcon,
  Star,
  Filter,
  ChevronLeft
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { Product, Category, Section, SwapRequest } from './types';
import { CATEGORIES, INITIAL_PRODUCTS } from './constants';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [swapStep, setSwapStep] = useState<'form' | 'review' | 'success'>('form');
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<SwapRequest | null>(null);

  useEffect(() => {
    setSwapStep('form');
    setLastSubmittedRequest(null);
  }, [activeSection]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [adminCredentials, setAdminCredentials] = useState({ user: '', pass: '', rememberMe: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'iPhone',
    price: '',
    condition: 'New',
    description: '',
    images: [''],
    primaryImageIndex: 0,
    status: 'In Stock'
  });
  const [swapForm, setSwapForm] = useState({
    userDeviceModel: '',
    userDeviceCondition: 'Like New',
    userDeviceSpecs: '',
    interestedInModel: '',
    userName: '',
    userContact: '',
    devicePhotos: [] as string[]
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonAIInfo, setComparisonAIInfo] = useState<string | null>(null);
  const [isFetchingComparison, setIsFetchingComparison] = useState(false);
  const [adminTab, setAdminTab] = useState<'inventory' | 'swaps' | 'analytics'>('inventory');
  const [isDragging, setIsDragging] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<string>('');
  const [trackContact, setTrackContact] = useState('');
  const [trackedRequests, setTrackedRequests] = useState<SwapRequest[]>([]);
  const [viewingReceipt, setViewingReceipt] = useState<SwapRequest | null>(null);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteConfirm, setIsBulkDeleteConfirm] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'30days' | 'quarter' | 'all'>('all');
  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  useEffect(() => {
    const checkApiKey = async () => {
      if ((window as any).aistudio) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkApiKey();

    const savedWishlist = localStorage.getItem('jackman_wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    const savedRecent = localStorage.getItem('jackman_recently_viewed');
    if (savedRecent) {
      setRecentlyViewed(JSON.parse(savedRecent));
    }

    const isAdminLoggedIn = localStorage.getItem('jackman_admin_logged_in');
    if (isAdminLoggedIn === 'true') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    const productId = selectedProduct?.id || quickViewProduct?.id;
    if (productId) {
      setRecentlyViewed(prev => {
        const filtered = prev.filter(id => id !== productId);
        const updated = [productId, ...filtered].slice(0, 10);
        localStorage.setItem('jackman_recently_viewed', JSON.stringify(updated));
        return updated;
      });
    }
  }, [selectedProduct?.id, quickViewProduct?.id]);

  const submitReview = (productId: string) => {
    if (!reviewForm.userName || !reviewForm.comment) return;
    setIsSubmittingReview(true);
    
    // Simulate API call
    setTimeout(() => {
      const newReview = {
        id: Math.random().toString(36).substr(2, 9),
        userName: reviewForm.userName,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        date: Date.now()
      };

      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            reviews: [newReview, ...(p.reviews || [])]
          };
        }
        return p;
      }));

      setReviewForm({ userName: '', rating: 5, comment: '' });
      setIsSubmittingReview(false);
    }, 1000);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const updated = prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId];
      localStorage.setItem('jackman_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const generateProductImage = async (productName: string, category: string) => {
    if (!hasApiKey && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      const has = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(has);
      if (!has) return `https://picsum.photos/seed/${productName}/800/600`;
    }

    setIsGeneratingImage(true);
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A high-quality, professional product photography of a ${productName}, which is a ${category}. Clean background, studio lighting, highly detailed.`,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
        },
      });
      const base64 = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Image generation error:", error);
      return `https://picsum.photos/seed/${productName}/800/600`;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setActiveSection('product-detail');
    window.scrollTo(0, 0);
  };

  const toggleCompare = (product: Product) => {
    setCompareProducts(prev => {
      const isAlreadySelected = prev.find(p => p.id === product.id);
      if (isAlreadySelected) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 products at a time.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const fetchComparisonAIDetails = async (selectedProducts: Product[]) => {
    if (selectedProducts.length < 2) return;
    setIsFetchingComparison(true);
    setComparisonAIInfo(null);

    const productNames = selectedProducts.map(p => p.name).join(', ');
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Compare the following products side-by-side: ${productNames}. Provide a clear, well-organized comparison as of April 2026 with sections for:
1. **Side-by-Side Specifications**: A table comparing key technical details.
2. **Pros & Cons**: Comparative analysis based on 2026 standards.
3. **Market Value in Ghana (April 2026)**: Comparison of current prices. 
CRITICAL: Do NOT include any outdated data from 2024. Specifically, do NOT include the section "3. Current Market Value in Ghana (Estimated Prices)" that mentions "early 2024". Focus strictly on current 2026 market values.
4. **Verdict**: Which one offers better value for money in the Ghanaian market in 2026.
Use Markdown for clear organization.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setComparisonAIInfo(response.text || "No additional details found.");
    } catch (error) {
      console.error("Comparison AI details error:", error);
      setComparisonAIInfo("Could not fetch comparison AI details at this time.");
    } finally {
      setIsFetchingComparison(false);
    }
  };

  const startComparison = () => {
    if (compareProducts.length < 2) {
      alert('Select at least 2 products to compare.');
      return;
    }
    setActiveSection('compare');
    window.scrollTo(0, 0);
    fetchComparisonAIDetails(compareProducts);
  };

  // Load products and swap requests from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('jackman_products');
    if (savedProducts) {
      const parsedProducts: any[] = JSON.parse(savedProducts);
      // Migrate old products that use 'image' instead of 'images'
      const migratedProducts: Product[] = parsedProducts.map(p => {
        if (!p.images && p.image) {
          return {
            ...p,
            images: [p.image],
            primaryImageIndex: 0
          };
        }
        if (!p.images) {
          return {
            ...p,
            images: [`https://picsum.photos/seed/${p.name}/800/600`],
            primaryImageIndex: 0
          };
        }
        return p as Product;
      });
      setProducts(migratedProducts);
      localStorage.setItem('jackman_products', JSON.stringify(migratedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('jackman_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    const savedSwaps = localStorage.getItem('jackman_swaps');
    if (savedSwaps) {
      setSwapRequests(JSON.parse(savedSwaps));
    }
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('jackman_products', JSON.stringify(updatedProducts));
  };

  const saveSwaps = (updatedSwaps: SwapRequest[]) => {
    setSwapRequests(updatedSwaps);
    localStorage.setItem('jackman_swaps', JSON.stringify(updatedSwaps));
  };

  const handleSwapSubmit = (e: React.FormEvent, type: 'swap' | 'sell' = 'swap') => {
    e.preventDefault();
    setSwapStep('review');
    window.scrollTo(0, 0);
  };

  const confirmSubmission = (type: 'swap' | 'sell') => {
    const newRequest: SwapRequest = {
      id: Date.now().toString(),
      type,
      userDeviceModel: swapForm.userDeviceModel,
      userDeviceCondition: swapForm.userDeviceCondition,
      userDeviceSpecs: swapForm.userDeviceSpecs,
      interestedInModel: swapForm.interestedInModel,
      userName: swapForm.userName,
      userContact: swapForm.userContact,
      devicePhotos: swapForm.devicePhotos,
      status: 'Pending',
      createdAt: Date.now()
    };
    const updated = [newRequest, ...swapRequests];
    saveSwaps(updated);
    setLastSubmittedRequest(newRequest);
    setSwapStep('success');
    setSwapError(null);
    
    setSwapForm({
      userDeviceModel: '',
      userDeviceCondition: 'Like New',
      userDeviceSpecs: '',
      interestedInModel: '',
      userName: '',
      userContact: '',
      devicePhotos: []
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: FileList | null = null;
    if ('files' in e.target && e.target.files) {
      files = e.target.files;
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      files = e.dataTransfer.files;
    }
    
    if (!files) return;

    setSwapError(null);
    const maxFiles = 4;
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

    const processFile = (file: File) => {
      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
        setSwapError(`File ${file.name} is not a valid image format. Please upload JPG, PNG, or WebP.`);
        return;
      }
      if (file.size > maxSize) {
        setSwapError(`File ${file.name} is too large. Max size is 2MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSwapForm(prev => ({
            ...prev,
            devicePhotos: [...prev.devicePhotos, event.target!.result as string].slice(0, maxFiles)
          }));
        }
      };
      reader.readAsDataURL(file);
    };

    Array.from(files).slice(0, maxFiles - swapForm.devicePhotos.length).forEach(processFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handlePhotoUpload(e);
  };

  const updateSwapStatus = (id: string, status: SwapRequest['status']) => {
    const updated = swapRequests.map(req => req.id === id ? { ...req, status } : req);
    saveSwaps(updated);
  };

  const deleteSwapRequest = (id: string) => {
    const updated = swapRequests.filter(req => req.id !== id);
    saveSwaps(updated);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (adminCredentials.user === 'admin' && adminCredentials.pass === 'admin123') {
      setIsAdmin(true);
      setLoginError(null);
      if (adminCredentials.rememberMe) {
        localStorage.setItem('jackman_admin_logged_in', 'true');
      }
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
    setIsSubmitting(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleBulkDelete = () => {
    if (selectedInventoryIds.length === 0) return;
    setIsBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    const updatedProducts = products.filter(p => !selectedInventoryIds.includes(p.id));
    saveProducts(updatedProducts);
    setSelectedInventoryIds([]);
    setIsBulkDeleteConfirm(false);
  };

  const handleBulkUpdateStatus = (status: Product['status']) => {
    if (selectedInventoryIds.length === 0) return;
    const updatedProducts = products.map(p => 
      selectedInventoryIds.includes(p.id) ? { ...p, status, soldAt: status === 'Sold' ? Date.now() : p.soldAt } : p
    );
    saveProducts(updatedProducts);
    setSelectedInventoryIds([]);
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedInventoryIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInventoryIds.length === products.length) {
      setSelectedInventoryIds([]);
    } else {
      setSelectedInventoryIds(products.map(p => p.id));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    if (isEditing && editingProductId) {
      const updated = products.map(p => {
        if (p.id === editingProductId) {
          return {
            ...p,
            name: newProduct.name || '',
            category: newProduct.category || 'iPhone',
            price: newProduct.price || '',
            condition: (newProduct.condition as any) || 'New',
            description: newProduct.description || '',
            images: newProduct.images?.filter(img => img.trim() !== '') || p.images,
            primaryImageIndex: newProduct.primaryImageIndex ?? 0,
            status: newProduct.status || 'In Stock',
            soldAt: newProduct.status === 'Sold' ? Date.now() : p.soldAt
          };
        }
        return p;
      });
      saveProducts(updated);
      setIsEditing(false);
      setEditingProductId(null);
      alert('Product updated successfully!');
    } else {
      const validImages = newProduct.images?.filter(img => img.trim() !== '') || [];
      let finalImages = validImages;
      
      if (finalImages.length === 0) {
        const generated = await generateProductImage(newProduct.name || '', newProduct.category || 'iPhone');
        finalImages = [generated];
      }

      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name || '',
        category: newProduct.category || 'iPhone',
        price: newProduct.price || '',
        condition: (newProduct.condition as any) || 'New',
        description: newProduct.description || '',
        images: finalImages,
        primaryImageIndex: newProduct.primaryImageIndex ?? 0,
        status: newProduct.status || 'In Stock',
        soldAt: newProduct.status === 'Sold' ? Date.now() : undefined,
        createdAt: Date.now()
      };

      const updated = [product, ...products];
      saveProducts(updated);
      alert('Product added successfully!');
    }

    setNewProduct({
      name: '',
      category: 'iPhone',
      price: '',
      condition: 'New',
      description: '',
      images: [''],
      primaryImageIndex: 0
    });
  };

  const handleEditProduct = (product: Product) => {
    setNewProduct({
      name: product.name,
      category: product.category as Category,
      price: product.price,
      condition: product.condition,
      description: product.description,
      images: product.images,
      primaryImageIndex: product.primaryImageIndex,
      status: product.status
    });
    setIsEditing(true);
    setEditingProductId(product.id);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setNewProduct({
      name: '',
      category: 'iPhone',
      price: '',
      condition: 'New',
      description: '',
      images: [''],
      primaryImageIndex: 0,
      status: 'In Stock'
    });
  };

  const handleDeleteProduct = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteProduct = () => {
    if (!deleteConfirmId) return;
    const updated = products.filter(p => p.id !== deleteConfirmId);
    saveProducts(updated);
    setDeleteConfirmId(null);
  };

  const handleInlinePriceSave = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, price: tempPriceValue };
      }
      return p;
    });
    saveProducts(updated);
    setEditingPriceId(null);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      layout
      key={product.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group ${darkMode ? 'bg-slate-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:border-orange-200'} rounded-3xl overflow-hidden border transition-all shadow-sm hover:shadow-xl`}
    >
      <div 
        className="relative aspect-[4/3] overflow-hidden cursor-pointer"
        onClick={() => handleProductClick(product)}
      >
        <img 
          src={product.images?.[product.primaryImageIndex || 0] || `https://picsum.photos/seed/${product.name}/800/600`} 
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full ${darkMode ? 'bg-slate-950/80 border-white/10 text-white' : 'bg-white/80 border-slate-200 text-slate-900'} backdrop-blur-md border text-[10px] font-bold uppercase tracking-wider`}>
            {product.condition}
          </span>
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
            {product.category}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
              wishlist.includes(product.id) 
                ? 'bg-red-500 text-white border-red-500' 
                : darkMode ? 'bg-slate-950/50 text-white border-white/10 hover:bg-white/20' : 'bg-white/50 text-slate-900 border-slate-200 hover:bg-slate-100'
            }`}
            title="Add to Wishlist"
          >
            <Heart size={14} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${darkMode ? 'bg-slate-950/50 text-white border-white/10 hover:bg-orange-500' : 'bg-white/50 text-slate-900 border-slate-200 hover:bg-orange-500 hover:text-white'}`}
            title="Quick View"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 
            className={`text-lg font-bold truncate cursor-pointer hover:text-orange-500 transition-colors flex-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}
            onClick={() => handleProductClick(product)}
          >
            {product.name}
          </h4>
          <label className="flex items-center gap-1 cursor-pointer group/compare">
            <input 
              type="checkbox"
              checked={compareProducts.some(p => p.id === product.id)}
              onChange={() => toggleCompare(product)}
              className="accent-orange-500 w-4 h-4"
            />
            <span className={`text-[10px] font-bold ${darkMode ? 'text-slate-500 group-hover/compare:text-slate-400' : 'text-slate-400 group-hover/compare:text-slate-600'}`}>Compare</span>
          </label>
        </div>
        <p className={`text-sm mb-4 line-clamp-2 h-10 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-black text-orange-500">{product.price}</span>
          <button 
            onClick={() => setActiveSection('contact')}
            className={`p-2 rounded-xl transition-colors group/btn ${darkMode ? 'bg-white/5 hover:bg-orange-500' : 'bg-slate-100 hover:bg-orange-500'}`}
          >
            <MessageCircle size={20} className={`${darkMode ? 'text-slate-400 group-hover/btn:text-white' : 'text-slate-600 group-hover/btn:text-white'}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const NavLink = ({ section, icon: Icon, label }: { section: Section, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveSection(section);
        setIsMenuOpen(false);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        activeSection === section 
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
          : 'text-slate-300 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const handleTrackRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const results = swapRequests.filter(req => 
      req.userContact.includes(trackContact) || req.id.includes(trackContact)
    );
    setTrackedRequests(results);
  };

  const ReviewSummary = ({ type }: { type: 'swap' | 'sell' }) => {
    const isSwap = type === 'swap';
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-2xl'} max-w-2xl mx-auto space-y-8`}
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">Review Your Details</h2>
          <p className="text-slate-500">Please confirm your information is correct before submitting.</p>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Device</p>
              <p className="text-lg font-bold">{swapForm.userDeviceModel}</p>
              <p className="text-sm text-slate-400">{swapForm.userDeviceCondition} • {swapForm.userDeviceSpecs}</p>
            </div>
            {isSwap && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Interested In</p>
                <p className="text-lg font-bold text-orange-500">{swapForm.interestedInModel}</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Name</p>
              <p className="font-bold">{swapForm.userName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact</p>
              <p className="font-bold">{swapForm.userContact}</p>
            </div>
          </div>

          {swapForm.devicePhotos.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Photos</p>
              <div className="flex gap-2">
                {swapForm.devicePhotos.map((photo, i) => (
                  <img key={i} src={photo} className="w-16 h-16 rounded-xl object-cover border border-white/10" alt="" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            onClick={() => setSwapStep('form')}
            className={`flex-1 py-4 font-bold rounded-2xl transition-all ${darkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
          >
            Edit Details
          </button>
          <button 
            onClick={() => confirmSubmission(type)}
            className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20"
          >
            Confirm & Submit
          </button>
        </div>
      </motion.div>
    );
  };

  const Receipt = ({ request, onBack }: { request: SwapRequest, onBack?: () => void }) => {
    const isSwap = request.type === 'swap';
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative p-8 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-2xl'} max-w-2xl mx-auto space-y-8 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none`}
      >
        {/* Close Button for Track View */}
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-6 right-6 p-3 bg-slate-800/50 hover:bg-slate-800 text-white rounded-full transition-all print:hidden z-10"
          >
            <X size={20} />
          </button>
        )}

        {/* Watermark for Print */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-30deg] overflow-hidden print:opacity-[0.05]">
          <h1 className="text-[12rem] font-black tracking-tighter">JACKMAN</h1>
        </div>

        <div className="text-center space-y-2 print:hidden">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-4"
          >
            <CheckCircle size={32} />
          </motion.div>
          <h2 className="text-2xl font-black">Submission Successful!</h2>
          <p className="text-slate-500">Your request has been received. Here is your official receipt.</p>
        </div>

        <div className={`relative p-6 rounded-3xl border ${darkMode ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'} space-y-6 print:bg-white print:text-black print:border-slate-200 print:shadow-none`}>
          <div className="flex justify-between items-start border-b border-dashed pb-4 border-slate-700 print:border-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 print:shadow-none">
                <Smartphone className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-orange-500">JACKMAN</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Deals & Accessories</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Receipt No.</p>
              <p className="font-mono text-sm font-black">#{request.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date & Time</p>
              <p className="font-bold">{new Date(request.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Request Type</p>
              <p className="font-bold uppercase text-orange-500">{request.type}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-dashed border-slate-700 print:border-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs font-bold uppercase">Customer Name</span>
              <span className="font-bold">{request.userName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs font-bold uppercase">Contact</span>
              <span className="font-bold">{request.userContact}</span>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-3 print:bg-slate-50 print:border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Device Details</p>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Model</span>
                <span className="font-bold">{request.userDeviceModel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Condition</span>
                <span className="font-bold">{request.userDeviceCondition}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Specs</span>
                <span className="font-bold">{request.userDeviceSpecs}</span>
              </div>
              {isSwap && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800 print:border-slate-200">
                  <span className="text-slate-500">Interested In</span>
                  <span className="font-bold text-orange-500">{request.interestedInModel}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-700 print:border-slate-300">
              <span className="text-slate-500 text-xs font-bold uppercase">Current Status</span>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                request.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                request.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                request.status === 'Rejected' ? 'bg-red-500/20 text-red-500' :
                'bg-blue-500/20 text-blue-500'
              }`}>
                {request.status}
              </span>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-dashed border-slate-700 print:border-slate-300">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">Thank you for choosing Jackman</p>
            <p className="text-[8px] text-slate-600">Kasoa Bawjiase Station • 054 754 0517</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 print:hidden">
          <div className="flex gap-4">
            <button 
              onClick={() => {
                window.focus();
                window.print();
              }}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
            >
              <Printer size={20} className="group-hover:scale-110 transition-transform" /> Print / Save PDF
            </button>
            <button 
              onClick={() => {
                  if (onBack) {
                    onBack();
                  } else {
                    setSwapStep('form');
                    setActiveSection('track');
                    setTrackContact(request.userContact);
                    const results = swapRequests.filter(req => req.userContact === request.userContact);
                    setTrackedRequests(results);
                  }
              }}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
            >
              <Search size={20} className="group-hover:scale-110 transition-transform" /> {onBack ? 'Back to List' : 'Track Status'}
            </button>
          </div>
          <button 
            onClick={() => {
                setSwapStep('form');
                setActiveSection('home');
            }}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20"
          >
            Back to Shop
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-orange-500/30 transition-colors duration-300`}>
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-white/5' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveSection('home')}>
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Smartphone className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter leading-none">
                JACKMAN
              </h1>
              <p className="text-[10px] text-orange-500 uppercase tracking-widest font-bold">Deals and Accessories</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gadgets, brands, or categories..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:border-orange-500 focus:bg-slate-950 outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-all mr-2 ${
                darkMode 
                  ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => {
                setActiveSection('category');
                setSelectedCategory('All');
                setIsMenuOpen(false);
                window.scrollTo(0, 0);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                activeSection === 'category' && selectedCategory === 'All'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShoppingBag size={18} />
              <span className="font-medium">Shop All</span>
            </button>
            <NavLink section="services" icon={Info} label="Services" />
            <NavLink section="sell" icon={DollarSign} label="Sell" />
            <NavLink section="swap" icon={ArrowRightLeft} label="Swap" />
            <NavLink section="track" icon={Search} label="Track" />
            <NavLink section="wishlist" icon={Heart} label="Wishlist" />
            <NavLink section="contact" icon={MapPin} label="Location" />
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`md:hidden absolute top-20 left-0 right-0 border-b p-4 flex flex-col gap-4 ${
                darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-xl'
              }`}
            >
              {/* Mobile Search */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gadgets..."
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:border-orange-500 outline-none ${
                    darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    darkMode ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection('category');
                    setSelectedCategory('All');
                    setIsMenuOpen(false);
                    window.scrollTo(0, 0);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    activeSection === 'category' && selectedCategory === 'All'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ShoppingBag size={18} />
                  <span className="font-medium">Shop All</span>
                </button>
                <NavLink section="services" icon={Info} label="Services" />
                <NavLink section="sell" icon={DollarSign} label="Sell" />
                <NavLink section="swap" icon={ArrowRightLeft} label="Swap" />
                <NavLink section="track" icon={Search} label="Track" />
                <NavLink section="contact" icon={MapPin} label="Location" />
                <div className="mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      setActiveSection('admin');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-500 hover:text-orange-500 transition-all text-sm font-bold uppercase tracking-widest"
                  >
                    <Lock size={16} /> Staff Portal
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Home / Products Section */}
          {activeSection === 'home' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Hero */}
              <section className={`relative overflow-hidden rounded-3xl border p-8 md:p-16 ${
                darkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-white/5' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div className="relative z-10 max-w-2xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-wider mb-6"
                  >
                    <Package size={14} />
                    Premium Gadget Hub
                  </motion.div>
                  <h2 className={`text-4xl md:text-6xl font-black mb-6 leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Make us Your <span className="text-orange-500">Gadgets Plug</span> Today
                  </h2>
                  <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    The ultimate destination for premium devices in Kasoa. Whether you're looking to upgrade, sell your old tech, or swap for something better, we've got you covered.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setActiveSection('services')}
                      className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                      Explore Services <ChevronRight size={20} />
                    </button>
                    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-sm ${
                      darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                            darkMode ? 'border-slate-900 bg-slate-800 text-white' : 'border-white bg-slate-200 text-slate-700'
                          }`}>
                            {i === 1 ? 'JD' : i === 2 ? 'AC' : 'GH'}
                          </div>
                        ))}
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>500+ Happy Customers</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/30 blur-[120px] rounded-full" />
                </div>
              </section>

              {/* Categories */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Browse Categories</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat as Category);
                        setActiveSection('category');
                        window.scrollTo(0, 0);
                      }}
                      className={`group p-6 rounded-2xl border transition-all text-center space-y-3 ${
                        darkMode ? 'bg-slate-900 border-white/5 hover:border-orange-500/50' : 'bg-white border-slate-200 hover:border-orange-500 shadow-sm'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors ${
                        darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {cat === 'iPhone' && <Smartphone size={24} />}
                        {cat === 'Laptop' && <Laptop size={24} />}
                        {cat === 'Samsung' && <Smartphone size={24} />}
                        {cat === 'Smartwatches' && <Watch size={24} />}
                        {cat === 'JBL Bluetooth' && <Speaker size={24} />}
                        {cat === 'Phone Accessories' && <Headphones size={24} />}
                      </div>
                      <span className={`block text-sm font-semibold group-hover:text-white transition-colors ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {cat}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Products Grid */}
              <section id="products">
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Latest Arrivals</h3>
                  <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live Inventory
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.slice(0, 8).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-12 text-center">
                  <button 
                    onClick={() => {
                      setSelectedCategory('All');
                      setActiveSection('category');
                      window.scrollTo(0, 0);
                    }}
                    className={`px-8 py-4 border font-bold rounded-2xl transition-all ${
                      darkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
                    }`}
                  >
                    View All Products
                  </button>
                </div>
              </section>

              {/* Recently Viewed */}
              {recentlyViewed.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Recently Viewed</h3>
                    <button 
                      onClick={() => {
                        setRecentlyViewed([]);
                        localStorage.removeItem('jackman_recently_viewed');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-orange-500 uppercase tracking-widest transition-colors"
                    >
                      Clear History
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentlyViewed.map(id => {
                      const product = products.find(p => p.id === id);
                      if (!product) return null;
                      return <ProductCard key={product.id} product={product} />;
                    })}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {/* Product Detail Page */}
          {activeSection === 'product-detail' && selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setActiveSection('category')}
                  className={`flex items-center gap-2 transition-colors font-bold text-sm ${
                    darkMode ? 'text-slate-400 hover:text-orange-500' : 'text-slate-500 hover:text-orange-500'
                  }`}
                >
                  <ArrowLeft size={16} /> Back to Products
                </button>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold">
                  <Package size={14} /> {selectedProduct.category}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Product Image Gallery */}
                <div className="space-y-6">
                  <div className={`relative aspect-square rounded-3xl overflow-hidden border shadow-2xl group ${
                    darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'
                  }`}>
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={selectedProduct.primaryImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        src={selectedProduct.images?.[selectedProduct.primaryImageIndex || 0] || `https://picsum.photos/seed/${selectedProduct.name}/800/600`} 
                        alt={selectedProduct.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    
                    {selectedProduct.images.length > 1 && (
                      <>
                        <button 
                          onClick={() => {
                            const prev = (selectedProduct.primaryImageIndex - 1 + selectedProduct.images.length) % selectedProduct.images.length;
                            setSelectedProduct({...selectedProduct, primaryImageIndex: prev});
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-500"
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <button 
                          onClick={() => {
                            const next = (selectedProduct.primaryImageIndex + 1) % selectedProduct.images.length;
                            setSelectedProduct({...selectedProduct, primaryImageIndex: next});
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-500"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>
                  {selectedProduct.images.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                      {selectedProduct.images.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            const updated = {...selectedProduct, primaryImageIndex: idx};
                            setSelectedProduct(updated);
                          }}
                          className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            selectedProduct.primaryImageIndex === idx ? 'border-orange-500' : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-2xl border text-center ${
                      darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Condition</span>
                      <span className="text-sm font-bold text-orange-500">{selectedProduct.condition}</span>
                    </div>
                    <div className={`p-4 rounded-2xl border text-center ${
                      darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Category</span>
                      <span className="text-sm font-bold text-orange-500">{selectedProduct.category}</span>
                    </div>
                    <div className={`p-4 rounded-2xl border text-center ${
                      darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status</span>
                      <span className="text-sm font-bold text-green-500">Available</span>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                  <div>
                    <h2 className={`text-4xl md:text-5xl font-black mb-4 leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedProduct.name}</h2>
                    <div className="text-3xl font-black text-orange-500 mb-6">{selectedProduct.price}</div>
                    <p className={`text-lg leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{selectedProduct.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setActiveSection('contact')}
                      className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                      <MessageCircle size={20} /> Chat on WhatsApp
                    </button>
                    <button 
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      className={`px-8 py-4 border font-bold rounded-2xl transition-all flex items-center gap-2 ${
                        wishlist.includes(selectedProduct.id)
                          ? 'bg-red-500/10 border-red-500/20 text-red-500'
                          : darkMode 
                            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' 
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
                      }`}
                    >
                      <Heart size={20} fill={wishlist.includes(selectedProduct.id) ? "currentColor" : "none"} />
                      {wishlist.includes(selectedProduct.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
                    </button>
                    <button 
                      onClick={() => setActiveSection('contact')}
                      className={`px-8 py-4 border font-bold rounded-2xl transition-all flex items-center gap-2 ${
                        darkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
                      }`}
                    >
                      <Phone size={20} /> Call for Inquiry
                    </button>
                  </div>

                  {/* Reviews Section */}
                  <div className={`pt-8 border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Customer Reviews</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex text-orange-500">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} size={16} fill={star <= (selectedProduct.reviews?.reduce((acc, r) => acc + r.rating, 0) || 0) / (selectedProduct.reviews?.length || 1) ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <span className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({selectedProduct.reviews?.length || 0} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Review Form */}
                    <div className={`p-6 rounded-3xl border mb-8 ${darkMode ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <h4 className={`text-sm font-bold mb-4 uppercase tracking-widest ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Leave a Review</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Your Name</label>
                            <input 
                              type="text" 
                              value={reviewForm.userName}
                              onChange={e => setReviewForm({...reviewForm, userName: e.target.value})}
                              placeholder="e.g. John Doe"
                              className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors ${
                                darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                              }`} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Rating</label>
                            <div className="flex items-center gap-2 h-[46px]">
                              {[1,2,3,4,5].map(star => (
                                <button 
                                  key={star}
                                  onClick={() => setReviewForm({...reviewForm, rating: star})}
                                  className={`transition-all ${reviewForm.rating >= star ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-orange-300'}`}
                                >
                                  <Star size={24} fill={reviewForm.rating >= star ? "currentColor" : "none"} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Comment</label>
                          <textarea 
                            value={reviewForm.comment}
                            onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                            placeholder="Tell us about your experience..."
                            rows={3}
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-colors resize-none ${
                              darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                        <button 
                          onClick={() => submitReview(selectedProduct.id)}
                          disabled={isSubmittingReview || !reviewForm.userName || !reviewForm.comment}
                          className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmittingReview ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>Submit Review <ArrowRight size={18} /></>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                        selectedProduct.reviews.map(review => (
                          <div key={review.id} className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold">
                                  {review.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h5 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{review.userName}</h5>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    {new Date(review.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex text-orange-500">
                                {[1,2,3,4,5].map(star => (
                                  <Star key={star} size={14} fill={star <= review.rating ? "currentColor" : "none"} />
                                ))}
                              </div>
                            </div>
                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              {review.comment}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600 mb-4">
                            <MessageSquare size={32} />
                          </div>
                          <p className="text-slate-500 font-medium">No reviews yet. Be the first to review this product!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Category Page */}
          {activeSection === 'category' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className={`flex items-center gap-2 transition-colors mb-4 font-bold text-sm ${
                      darkMode ? 'text-slate-400 hover:text-orange-500' : 'text-slate-500 hover:text-orange-500'
                    }`}
                  >
                    <X size={16} /> Back to Home
                  </button>
                  <h2 className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}
                  </h2>
                  <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Showing {filteredProducts.length} items
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                      selectedCategory === 'All' 
                        ? 'bg-orange-500 text-white shadow-orange-500/20' 
                        : darkMode 
                          ? 'bg-slate-900 text-slate-400 border border-white/5 hover:bg-slate-800' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    All
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as Category)}
                      className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                        selectedCategory === cat 
                          ? 'bg-orange-500 text-white shadow-orange-500/20' 
                          : darkMode 
                            ? 'bg-slate-900 text-slate-400 border border-white/5 hover:bg-slate-800' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className={`text-center py-20 rounded-3xl border border-dashed ${
                  darkMode ? 'bg-slate-900/50 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Package className={`mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} size={48} />
                  <p className={`font-medium ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                    No products found in this category.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Services Section */}
          {activeSection === 'services' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Our Services</h2>
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Everything you need for your gadget lifestyle in one place.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { 
                    title: 'I BUY', 
                    icon: DollarSign, 
                    color: 'bg-green-500', 
                    desc: 'Got an old device? We buy used gadgets at the most competitive market prices. Fast cash, no hassle.',
                    action: 'Sell to Us'
                  },
                  { 
                    title: 'I SELL', 
                    icon: ShoppingBag, 
                    color: 'bg-orange-500', 
                    desc: 'Premium selection of iPhones, Laptops, Samsung devices, and high-quality accessories with warranty.',
                    action: 'Shop Now'
                  },
                  { 
                    title: 'I SWAP', 
                    icon: ArrowRightLeft, 
                    color: 'bg-blue-500', 
                    desc: 'Ready for an upgrade? Bring your current device and swap it for a newer model with a reasonable top-up.',
                    action: 'Swap Device'
                  }
                ].map((service, i) => (
                  <div key={i} className={`p-8 rounded-3xl border space-y-6 flex flex-col h-full transition-all hover:scale-[1.02] ${
                    darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="space-y-4 flex-1">
                      <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <service.icon size={28} className="text-white" />
                      </div>
                      <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{service.title}</h3>
                      <p className={`leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{service.desc}</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (service.title === 'I SELL') {
                          setActiveSection('home');
                        } else if (service.title === 'I SWAP') {
                          setActiveSection('swap');
                        } else if (service.title === 'I BUY') {
                          setActiveSection('sell');
                        } else {
                          setActiveSection('contact');
                        }
                        window.scrollTo(0, 0);
                      }}
                      className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                        service.title === 'I SELL' 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20' 
                          : darkMode 
                            ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                      }`}
                    >
                      {service.action} <ChevronRight size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-orange-500 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <h3 className="text-3xl font-black">Ready to Swap?</h3>
                  <p className="text-orange-100 text-lg">Bring your device to our shop at Kasoa for an instant evaluation and the best deals in town.</p>
                  <button 
                    onClick={() => setActiveSection('contact')}
                    className="px-8 py-4 bg-white text-orange-500 font-bold rounded-2xl hover:bg-orange-50 transition-colors"
                  >
                    Get Directions
                  </button>
                </div>
                <div className="w-full md:w-1/3 aspect-square bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                  <ArrowRightLeft size={80} className="text-white/20" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Wishlist Section */}
          {activeSection === 'wishlist' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
                  <Heart size={40} fill="currentColor" />
                </div>
                <h2 className="text-4xl font-black">My Wishlist</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Your saved gadgets and accessories. Ready to make them yours?
                </p>
              </div>

              {wishlist.length === 0 ? (
                <div className={`text-center py-20 rounded-3xl border ${
                  darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <ShoppingBag size={64} className={`mx-auto mb-6 ${darkMode ? 'text-slate-700' : 'text-slate-200'}`} />
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Your wishlist is empty</h3>
                  <p className="text-slate-500 mb-8 font-medium">Start adding gadgets you love to see them here.</p>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="px-8 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.filter(p => wishlist.includes(p.id)).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Sell Section */}
          {activeSection === 'sell' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              {swapStep === 'form' && (
                <>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center text-green-500 mx-auto mb-6">
                      <DollarSign size={40} />
                    </div>
                    <h2 className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Sell Your Device</h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                      Get the best value for your old gadgets. Fill out the form below and we'll give you a fair cash offer.
                    </p>
                  </div>

                  <div className={`${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'} rounded-3xl border overflow-hidden shadow-sm`}>
                    <div className={`p-8 border-b ${darkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                      <h3 className="text-xl font-bold">Device Sale Request Form</h3>
                      <p className="text-slate-500 text-sm">Provide accurate details for a better valuation.</p>
                    </div>
                    <form onSubmit={(e) => handleSwapSubmit(e, 'sell')} className="p-8 grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Device Model</label>
                          <input 
                            type="text" 
                            required
                            value={swapForm.userDeviceModel}
                            onChange={e => setSwapForm({...swapForm, userDeviceModel: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`} 
                            placeholder="e.g. iPhone 13 Pro Max" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Condition</label>
                          <select 
                            value={swapForm.userDeviceCondition}
                            onChange={e => setSwapForm({...swapForm, userDeviceCondition: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`}
                          >
                            <option value="Like New">Like New (No scratches)</option>
                            <option value="Good">Good (Minor scratches)</option>
                            <option value="Fair">Fair (Visible wear & tear)</option>
                            <option value="Broken">Broken (Cracked screen/back)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specifications / Storage</label>
                          <input 
                            type="text" 
                            required
                            value={swapForm.userDeviceSpecs}
                            onChange={e => setSwapForm({...swapForm, userDeviceSpecs: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`} 
                            placeholder="e.g. 256GB, 85% Battery Health" 
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                          <input 
                            type="text" 
                            required
                            value={swapForm.userName}
                            onChange={e => setSwapForm({...swapForm, userName: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`} 
                            placeholder="Full Name" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number (WhatsApp)</label>
                          <input 
                            type="text" 
                            required
                            value={swapForm.userContact}
                            onChange={e => setSwapForm({...swapForm, userContact: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`} 
                            placeholder="05..." 
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Device Photos (Max 4, under 2MB each)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {swapForm.devicePhotos.map((photo, idx) => (
                            <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border ${darkMode ? 'border-white/10' : 'border-slate-200'} group`}>
                              <img src={photo} alt="" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => setSwapForm(prev => ({ ...prev, devicePhotos: prev.devicePhotos.filter((_, i) => i !== idx) }))}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {swapForm.devicePhotos.length < 4 && (
                            <label 
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group ${
                                isDragging 
                                  ? 'border-green-500 bg-green-500/10 scale-95' 
                                  : darkMode ? 'border-white/10 hover:border-green-500 bg-slate-950/50' : 'border-slate-200 hover:border-green-500 bg-slate-100'
                              }`}
                            >
                              <Plus size={24} className={`${isDragging ? 'text-green-500' : 'text-slate-600'} group-hover:text-green-500 transition-colors`} />
                              <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${isDragging ? 'text-green-500' : 'text-slate-600'} group-hover:text-green-500`}>
                                {isDragging ? 'Drop Photos' : 'Upload Photo'}
                              </span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={handlePhotoUpload} 
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-4">
                        {swapError && (
                          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold flex items-center gap-2">
                            <AlertCircle size={18} />
                            {swapError}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button 
                            type="submit"
                            className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                          >
                            Review Sale Request <ArrowRight size={20} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => confirmSubmission('sell')}
                            className={`flex-1 py-4 font-bold rounded-2xl transition-all border-2 ${
                              darkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-900'
                            }`}
                          >
                            Submit Directly
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </>
              )}

              {swapStep === 'review' && <ReviewSummary type="sell" />}
              {swapStep === 'success' && lastSubmittedRequest && (
                <Receipt 
                  request={lastSubmittedRequest} 
                />
              )}
            </motion.div>
          )}

          {/* Track Section */}
          {activeSection === 'track' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 mx-auto mb-6">
                  <Search size={40} />
                </div>
                <h2 className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Track Your Request</h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                  Enter your contact number or receipt ID to check the status of your swap or sale request.
                </p>
              </div>

              <div className={`${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'} rounded-3xl border overflow-hidden shadow-sm p-8`}>
                <form onSubmit={handleTrackRequest} className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="text" 
                    required
                    value={trackContact}
                    onChange={e => setTrackContact(e.target.value)}
                    className={`flex-1 ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`} 
                    placeholder="Enter Phone Number or Receipt ID" 
                  />
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Track Now <ArrowRight size={20} />
                  </button>
                </form>

                {trackedRequests.length > 0 ? (
                  <div className="mt-12 space-y-6">
                    <h3 className="text-xl font-bold">Your Submissions ({trackedRequests.length})</h3>
                    <div className="grid gap-6">
                      {trackedRequests.map(req => (
                        <div key={req.id} className={`group p-6 rounded-3xl border transition-all hover:scale-[1.02] ${
                          darkMode ? 'bg-slate-950/50 border-white/5 hover:border-orange-500/30' : 'bg-slate-50 border-slate-200 hover:border-orange-500/30 shadow-sm'
                        } flex flex-col md:flex-row justify-between gap-6`}>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                req.type === 'swap' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                              }`}>
                                {req.type === 'swap' ? <ArrowRightLeft size={20} /> : <DollarSign size={20} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${req.type === 'swap' ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                                    {req.type}
                                  </span>
                                  <span className="text-slate-500 text-xs font-mono font-bold">#{req.id.slice(-8).toUpperCase()}</span>
                                </div>
                                <h4 className="font-black text-lg leading-tight">{req.userDeviceModel}</h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <span className="flex items-center gap-1"><Package size={12} /> {req.userDeviceSpecs}</span>
                              <span className="flex items-center gap-1"><MapPin size={12} /> {new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col md:items-end justify-between gap-4">
                            <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                              req.status === 'Pending' ? 'bg-yellow-500 text-black' :
                              req.status === 'Completed' ? 'bg-green-500 text-white' :
                              req.status === 'Rejected' ? 'bg-red-500 text-white' :
                              'bg-blue-500 text-white'
                            }`}>
                              {req.status}
                            </div>
                            <button 
                              onClick={() => {
                                setViewingReceipt(req);
                              }}
                              className="w-full md:w-auto px-6 py-2.5 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-orange-500/20 group/btn"
                            >
                              View Receipt <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : trackContact && (
                  <div className="mt-12 text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-slate-900/20">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mx-auto mb-4">
                      <Search size={32} />
                    </div>
                    <p className="text-slate-500 font-bold">No requests found for "{trackContact}"</p>
                    <p className="text-slate-600 text-sm mt-1">Please check the number or receipt ID and try again.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Swap Section */}
          {activeSection === 'swap' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              {swapStep === 'form' && (
                <>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500 mx-auto mb-6">
                      <ArrowRightLeft size={40} />
                    </div>
                    <h2 className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Swap Your Device</h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                      Upgrade to the latest gadgets by swapping your old device. Fill out the form below and we'll give you a fair valuation.
                    </p>
                  </div>

                  <div className={`${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'} rounded-3xl border overflow-hidden shadow-sm`}>
                    <div className={`p-8 border-b ${darkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                      <h3 className="text-xl font-bold">Device Swap Request Form</h3>
                      <p className="text-slate-500 text-sm">Provide accurate details for a better valuation.</p>
                      <div className="mt-6 flex items-center gap-2">
                        <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 w-1/2 rounded-full"></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">Step 1 of 2</span>
                      </div>
                    </div>
                    <form onSubmit={(e) => handleSwapSubmit(e, 'swap')} className="p-8 grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Device Model</label>
                          <input 
                            type="text" 
                            required
                            value={swapForm.userDeviceModel}
                            onChange={e => setSwapForm({...swapForm, userDeviceModel: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`} 
                            placeholder="e.g. iPhone 13 Pro Max" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Condition</label>
                          <select 
                            value={swapForm.userDeviceCondition}
                            onChange={e => setSwapForm({...swapForm, userDeviceCondition: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`}
                          >
                            <option value="Like New">Like New (No scratches)</option>
                            <option value="Good">Good (Minor scratches)</option>
                            <option value="Fair">Fair (Visible wear & tear)</option>
                            <option value="Broken">Broken (Cracked screen/back)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specifications / Storage</label>
                          <input 
                            type="text" 
                            required
                            value={swapForm.userDeviceSpecs}
                            onChange={e => setSwapForm({...swapForm, userDeviceSpecs: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`} 
                            placeholder="e.g. 256GB, 85% Battery Health" 
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device You Want</label>
                          <input 
                            type="text" 
                            required
                            value={swapForm.interestedInModel}
                            onChange={e => setSwapForm({...swapForm, interestedInModel: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`} 
                            placeholder="e.g. iPhone 15 Pro Max" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                          <input 
                            type="text" 
                            required
                            value={swapForm.userName}
                            onChange={e => setSwapForm({...swapForm, userName: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`} 
                            placeholder="Full Name" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number (WhatsApp)</label>
                          <input 
                            type="text" 
                            required
                            value={swapForm.userContact}
                            onChange={e => setSwapForm({...swapForm, userContact: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors`} 
                            placeholder="05..." 
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Device Photos (Max 4, under 2MB each)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {swapForm.devicePhotos.map((photo, idx) => (
                            <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border ${darkMode ? 'border-white/10' : 'border-slate-200'} group`}>
                              <img src={photo} alt="" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => setSwapForm(prev => ({ ...prev, devicePhotos: prev.devicePhotos.filter((_, i) => i !== idx) }))}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {swapForm.devicePhotos.length < 4 && (
                            <label 
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group ${
                                isDragging 
                                  ? 'border-orange-500 bg-orange-500/10 scale-95' 
                                  : darkMode ? 'border-white/10 hover:border-orange-500 bg-slate-950/50' : 'border-slate-200 hover:border-orange-500 bg-slate-100'
                              }`}
                            >
                              <Plus size={24} className={`${isDragging ? 'text-orange-500' : 'text-slate-600'} group-hover:text-orange-500 transition-colors`} />
                              <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${isDragging ? 'text-orange-500' : 'text-slate-600'} group-hover:text-orange-500`}>
                                {isDragging ? 'Drop Photos' : 'Upload Photo'}
                              </span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={handlePhotoUpload} 
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-4">
                        {swapError && (
                          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold flex items-center gap-2">
                            <AlertCircle size={18} />
                            {swapError}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button 
                            type="submit"
                            className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                          >
                            Review Swap Request <ArrowRight size={20} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => confirmSubmission('swap')}
                            className={`flex-1 py-4 font-bold rounded-2xl transition-all border-2 ${
                              darkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-900'
                            }`}
                          >
                            Submit Directly
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </>
              )}

              {swapStep === 'review' && <ReviewSummary type="swap" />}
              {swapStep === 'success' && lastSubmittedRequest && <Receipt request={lastSubmittedRequest} />}

              <div className={`rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8 ${
                darkMode ? 'bg-orange-500' : 'bg-orange-500 shadow-xl shadow-orange-500/20'
              }`}>
                <div className="flex-1 space-y-4">
                  <h3 className="text-3xl font-black">Visit Our Shop</h3>
                  <p className="text-orange-100 text-lg">For a faster process, bring your device to our shop at Kasoa for an instant evaluation.</p>
                  <button 
                    onClick={() => setActiveSection('contact')}
                    className="px-8 py-4 bg-white text-orange-500 font-bold rounded-2xl hover:bg-orange-50 transition-colors shadow-lg"
                  >
                    View Location
                  </button>
                </div>
                <div className="w-full md:w-1/3 aspect-square bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                  <MapPin size={80} className="text-white/20" />
                </div>
              </div>

              {/* Featured Phones to Swap For */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Available Devices to Swap For</h3>
                  <button 
                    onClick={() => setActiveSection('category')}
                    className="text-orange-500 font-bold text-sm hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.filter(p => p.category === 'iPhone' || p.category === 'Samsung').slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Compare Section */}
          {activeSection === 'compare' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setActiveSection('home')}
                  className={`flex items-center gap-2 transition-colors font-bold text-sm ${
                    darkMode ? 'text-slate-400 hover:text-orange-500' : 'text-slate-500 hover:text-orange-500'
                  }`}
                >
                  <ArrowLeft size={16} /> Back to Shop
                </button>
                <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Product Comparison</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {compareProducts.map(product => (
                  <div key={product.id} className={`rounded-3xl border overflow-hidden flex flex-col ${
                    darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="aspect-video relative">
                      <img 
                        src={product.images?.[product.primaryImageIndex || 0] || `https://picsum.photos/seed/${product.name}/800/600`} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                      <button 
                        onClick={() => toggleCompare(product)}
                        className="absolute top-4 right-4 p-2 bg-slate-950/80 backdrop-blur-md rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                      <div>
                        <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</h4>
                        <p className="text-orange-500 font-black text-lg">{product.price}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</p>
                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{product.description}</p>
                      </div>
                      <div className="pt-4 mt-auto">
                        <button 
                          onClick={() => handleProductClick(product)}
                          className={`w-full py-3 border rounded-xl text-sm font-bold transition-all ${
                            darkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900'
                          }`}
                        >
                          View Full Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Comparison Insights */}
              <div className={`rounded-3xl p-8 border space-y-8 ${
                darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-2 text-orange-500">
                  <TrendingUp size={24} />
                  <h3 className="text-2xl font-bold">AI Comparison Insights</h3>
                  {isFetchingComparison && <Loader2 className="animate-spin ml-2" size={20} />}
                </div>

                {comparisonAIInfo ? (
                  <div className={`prose prose-sm max-w-none leading-relaxed p-8 rounded-2xl border ${
                    darkMode ? 'prose-invert text-slate-300 bg-slate-950 border-white/5' : 'text-slate-700 bg-slate-50 border-slate-200'
                  }`}>
                    <Markdown>{comparisonAIInfo}</Markdown>
                  </div>
                ) : isFetchingComparison ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 font-medium">Analyzing products and generating side-by-side comparison...</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 italic">
                    Select at least 2 products to see AI comparison insights.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Contact Section */}
          {activeSection === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div>
                    <h2 className={`text-4xl font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Visit Our Shop</h2>
                    <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>We are located in the heart of Kasoa, easily accessible for all your gadget needs.</p>
                  </div>

                  <div className="space-y-4">
                    <div className={`flex items-start gap-4 p-6 rounded-2xl border ${
                      darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Location</h4>
                        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kasoa around Bawjiase station</p>
                        <p className="text-slate-500 text-sm mt-1">Opposite the filling station, near the Bawjiase lorry park.</p>
                      </div>
                    </div>

                    <div className={`flex items-start gap-4 p-6 rounded-2xl border ${
                      darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 shrink-0">
                        <MessageCircle size={24} />
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>WhatsApp / Call</h4>
                        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Call: 0539307387</p>
                        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>WhatsApp: 0502392728</p>
                        <p className="text-slate-500 text-sm mt-1">We respond quickly to all inquiries on WhatsApp.</p>
                      </div>
                    </div>

                    <div className={`flex items-start gap-4 p-6 rounded-2xl border ${
                      darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Business Hours</h4>
                        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Mon - Sat: 8:00 AM - 7:00 PM</p>
                        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sun: 12:00 PM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl border overflow-hidden flex flex-col shadow-xl ${
                  darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'
                }`}>
                  <div className={`p-8 border-b ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Send us a message</h3>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Fill out the form below and we'll get back to you shortly.</p>
                  </div>
                  <div className="p-8 space-y-4 flex-1">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                      <input type="text" className={`w-full border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors ${
                        darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                      <input type="text" className={`w-full border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors ${
                        darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} placeholder="+233..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                      <textarea rows={4} className={`w-full border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors ${
                        darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} placeholder="I'm interested in swapping my iPhone..." />
                    </div>
                    <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Admin Section */}
          {activeSection === 'admin' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
            >
              {!isAdmin ? (
                <div className={`max-w-md mx-auto p-8 rounded-3xl border shadow-2xl ${
                  darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'
                }`}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-4">
                      <Lock size={32} />
                    </div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Admin Login</h2>
                    <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Access the dashboard to manage inventory.</p>
                  </div>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    {loginError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                        {loginError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                      <input 
                        type="text" 
                        value={adminCredentials.user}
                        onChange={(e) => {
                          setAdminCredentials({...adminCredentials, user: e.target.value});
                          setLoginError(null);
                        }}
                        className={`w-full border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors ${
                          darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`} 
                        placeholder="admin" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={adminCredentials.pass}
                          onChange={(e) => {
                            setAdminCredentials({...adminCredentials, pass: e.target.value});
                            setLoginError(null);
                          }}
                          className={`w-full border rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors pr-12 ${
                            darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`} 
                          placeholder="••••••••" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                            darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={adminCredentials.rememberMe}
                        onChange={(e) => setAdminCredentials({...adminCredentials, rememberMe: e.target.checked})}
                        className="rounded border-white/10 bg-slate-950 text-orange-500 focus:ring-orange-500"
                      />
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remember Me</label>
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Unlock Dashboard'
                      )}
                    </button>
                    <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                    </p>
                  </form>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Admin Dashboard</h2>
                      <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Manage inventory and swap requests.</p>
                    </div>
                    <button 
                      onClick={() => setIsAdmin(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all font-bold"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>

                  {/* Admin Tabs */}
                  <div className={`flex gap-4 border-b pb-4 ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <button 
                      onClick={() => setAdminTab('inventory')}
                      className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                        adminTab === 'inventory' 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                          : darkMode 
                            ? 'text-slate-500 hover:text-white' 
                            : 'text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Inventory
                    </button>
                    <button 
                      onClick={() => setAdminTab('swaps')}
                      className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                        adminTab === 'swaps' 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                          : darkMode 
                            ? 'text-slate-500 hover:text-white' 
                            : 'text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Swap Requests ({swapRequests.filter(r => r.status === 'Pending').length})
                    </button>
                    <button 
                      onClick={() => setAdminTab('analytics')}
                      className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                        adminTab === 'analytics' 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                          : darkMode 
                            ? 'text-slate-500 hover:text-white' 
                            : 'text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Analytics
                    </button>
                  </div>

                  {adminTab === 'analytics' ? (
                    <div className="space-y-8">
                      {/* Analytics Header with Date Range Filter */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Analytics Overview</h3>
                        <div className={`flex items-center p-1 rounded-xl border ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                          {(['all', '30days', 'quarter'] as const).map((range) => (
                            <button
                              key={range}
                              onClick={() => setAnalyticsDateRange(range)}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                analyticsDateRange === range
                                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                  : darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              {range === 'all' ? 'All Time' : range === '30days' ? 'Last 30 Days' : 'Last Quarter'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Analytics Overview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                              <Package size={24} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</p>
                              <h4 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{products.length}</h4>
                            </div>
                          </div>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                              <DollarSign size={24} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Sales</p>
                              <h4 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                GH₵ {products.filter(p => p.status === 'Sold').reduce((acc, p) => acc + parseFloat(p.price.replace(/[^0-9.]/g, '') || '0'), 0).toLocaleString()}
                              </h4>
                            </div>
                          </div>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                              <ArrowRightLeft size={24} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Swaps</p>
                              <h4 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {swapRequests.filter(r => r.status === 'Pending').length}
                              </h4>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Charts Section */}
                      <div className="grid lg:grid-cols-2 gap-8">
                        <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <h4 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            <BarChart3 className="text-orange-500" /> Sales by Category
                          </h4>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={CATEGORIES.map(cat => ({
                                name: cat,
                                value: products.filter(p => p.category === cat && p.status === 'Sold').reduce((acc, p) => acc + parseFloat(p.price.replace(/[^0-9.]/g, '') || '0'), 0)
                              })).filter(d => d.value > 0)}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#ffffff10' : '#00000010'} vertical={false} />
                                <XAxis 
                                  dataKey="name" 
                                  stroke={darkMode ? '#94a3b8' : '#64748b'} 
                                  fontSize={10} 
                                  fontWeight="bold"
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis 
                                  stroke={darkMode ? '#94a3b8' : '#64748b'} 
                                  fontSize={10} 
                                  fontWeight="bold"
                                  axisLine={false}
                                  tickLine={false}
                                  tickFormatter={(value) => `GH₵${value}`}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                    border: 'none',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}
                                  itemStyle={{ color: '#f97316' }}
                                />
                                <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]}>
                                  {CATEGORIES.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f97316' : '#fb923c'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <h4 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            <TrendingUp className="text-green-500" /> Inventory Status
                          </h4>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'In Stock', value: products.filter(p => p.status === 'In Stock').length, color: '#22c55e' },
                                    { name: 'Out of Stock', value: products.filter(p => p.status === 'Out of Stock').length, color: '#ef4444' },
                                    { name: 'Sold', value: products.filter(p => p.status === 'Sold').length, color: '#f97316' }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {[
                                    { name: 'In Stock', color: '#22c55e' },
                                    { name: 'Out of Stock', color: '#ef4444' },
                                    { name: 'Sold', color: '#f97316' }
                                  ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                    border: 'none',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex justify-center gap-6 mt-4">
                            {['In Stock', 'Out of Stock', 'Sold'].map((status, i) => (
                              <div key={status} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-red-500' : 'bg-orange-500'}`} />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Top Selling Products */}
                      <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-8">
                          <h4 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            <TrendingUp className="text-orange-500" /> Top Selling Products
                          </h4>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top 5 by Revenue</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-white/5">
                                <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Revenue</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {products
                                .filter(p => {
                                  if (p.status !== 'Sold') return false;
                                  if (analyticsDateRange === 'all') return true;
                                  if (!p.soldAt) return false;
                                  const now = Date.now();
                                  const days = analyticsDateRange === '30days' ? 30 : 90;
                                  return now - p.soldAt < days * 24 * 60 * 60 * 1000;
                                })
                                .sort((a, b) => {
                                  const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '') || '0');
                                  const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '') || '0');
                                  return priceB - priceA;
                                })
                                .slice(0, 5)
                                .map(p => (
                                  <tr key={p.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800">
                                          <img src={p.images[p.primaryImageIndex]} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{p.name}</span>
                                      </div>
                                    </td>
                                    <td className="py-4">
                                      <span className="text-xs font-bold text-slate-500">{p.category}</span>
                                    </td>
                                    <td className="py-4">
                                      <span className="text-sm font-black text-orange-500">{p.price}</span>
                                    </td>
                                    <td className="py-4">
                                      <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">Sold</span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : adminTab === 'inventory' ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Add Product Form */}
                      <div className={`lg:col-span-1 p-6 rounded-3xl border h-fit sticky top-24 ${
                        darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {isEditing ? (
                            <><Edit className="text-orange-500" /> Edit Product</>
                          ) : (
                            <><Plus className="text-orange-500" /> Add New Product</>
                          )}
                        </h3>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Product Name</label>
                            <input 
                              type="text" 
                              required
                              value={newProduct.name}
                              onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                              className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none transition-colors ${
                                darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`} 
                              placeholder="e.g. iPhone 15 Pro"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                            <select 
                              value={newProduct.category}
                              onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})}
                              className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none transition-colors ${
                                darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Price</label>
                              <input 
                                type="text" 
                                required
                                value={newProduct.price}
                                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none transition-colors ${
                                  darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`} 
                                placeholder="GH₵ 0.00"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Condition</label>
                              <select 
                                value={newProduct.condition}
                                onChange={e => setNewProduct({...newProduct, condition: e.target.value as any})}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none transition-colors ${
                                  darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="New">New</option>
                                <option value="Like New">Like New</option>
                                <option value="Fair">Fair</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                              <select 
                                value={newProduct.status}
                                onChange={e => setNewProduct({...newProduct, status: e.target.value as any})}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none transition-colors ${
                                  darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Sold">Sold</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Product Images</label>
                              <button 
                                type="button"
                                onClick={() => setNewProduct({...newProduct, images: [...(newProduct.images || []), '']})}
                                className="text-[10px] font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1"
                              >
                                <Plus size={12} /> Add Image
                              </button>
                            </div>
                            {(newProduct.images || ['']).map((url, idx) => (
                              <div key={idx} className={`space-y-2 p-3 rounded-xl border ${
                                darkMode ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'
                              }`}>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={url}
                                    onChange={e => {
                                      const newImages = [...(newProduct.images || [])];
                                      newImages[idx] = e.target.value;
                                      setNewProduct({...newProduct, images: newImages});
                                    }}
                                    className={`flex-1 border rounded-lg px-3 py-2 text-xs focus:border-orange-500 outline-none transition-colors ${
                                      darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                    }`} 
                                    placeholder="https://..."
                                  />
                                  {idx > 0 && (
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newImages = (newProduct.images || []).filter((_, i) => i !== idx);
                                        setNewProduct({
                                          ...newProduct, 
                                          images: newImages,
                                          primaryImageIndex: newProduct.primaryImageIndex === idx ? 0 : (newProduct.primaryImageIndex || 0) > idx ? (newProduct.primaryImageIndex || 0) - 1 : (newProduct.primaryImageIndex || 0)
                                        });
                                      }}
                                      className="p-2 text-slate-500 hover:text-red-500"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                  <input 
                                    type="radio" 
                                    name="primaryImage"
                                    checked={newProduct.primaryImageIndex === idx}
                                    onChange={() => setNewProduct({...newProduct, primaryImageIndex: idx})}
                                    className="accent-orange-500"
                                  />
                                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-400">Set as Primary</span>
                                </label>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                            <textarea 
                              rows={3}
                              value={newProduct.description}
                              onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                              className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none transition-colors ${
                                darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`} 
                              placeholder="Brief details about the device..."
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            {isEditing && (
                              <button 
                                type="button"
                                onClick={cancelEdit}
                                className={`flex-1 py-3 font-bold rounded-lg transition-all ${
                                  darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                                }`}
                              >
                                Cancel
                              </button>
                            )}
                            <button 
                              type="submit" 
                              disabled={isGeneratingImage}
                              className="flex-[2] py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                            >
                              {isGeneratingImage ? (
                                <><Loader2 className="animate-spin" size={18} /> Generating...</>
                              ) : isEditing ? (
                                'Save Changes'
                              ) : (
                                'Upload Listing'
                              )}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Inventory List */}
                      <div className="lg:col-span-2 space-y-4 relative">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <Package className="text-orange-500" /> Current Inventory ({products.length})
                          </h3>
                          {products.length > 0 && (
                            <button 
                              onClick={toggleSelectAll}
                              className="text-[10px] font-bold text-slate-500 hover:text-orange-500 uppercase tracking-widest transition-all"
                            >
                              {selectedInventoryIds.length === products.length ? 'Deselect All' : 'Select All'}
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {selectedInventoryIds.length > 0 && (
                            <motion.div 
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 20, opacity: 0 }}
                              className="sticky top-4 z-30 bg-orange-500 p-3 rounded-2xl shadow-xl flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                  {selectedInventoryIds.length}
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Items Selected</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <select 
                                  onChange={(e) => handleBulkUpdateStatus(e.target.value as any)}
                                  className="bg-white/10 border border-white/20 text-white text-[10px] font-bold rounded-lg px-2 py-1.5 outline-none"
                                  defaultValue=""
                                >
                                  <option value="" disabled className="text-slate-900">Update Status</option>
                                  <option value="In Stock" className="text-slate-900">Mark In Stock</option>
                                  <option value="Out of Stock" className="text-slate-900">Mark Out of Stock</option>
                                  <option value="Sold" className="text-slate-900">Mark Sold</option>
                                </select>
                                <button 
                                  onClick={handleBulkDelete}
                                  className="p-1.5 bg-red-500/20 hover:bg-red-500 text-white rounded-lg transition-all"
                                  title="Bulk Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button 
                                  onClick={() => setSelectedInventoryIds([])}
                                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="space-y-3">
                          {products.map(product => (
                            <div 
                              key={product.id} 
                              className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                                selectedInventoryIds.includes(product.id) 
                                  ? 'border-orange-500/50 ring-1 ring-orange-500/20' 
                                  : darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox"
                                  checked={selectedInventoryIds.includes(product.id)}
                                  onChange={() => toggleSelectProduct(product.id)}
                                  className={`w-4 h-4 rounded border-white/10 text-orange-500 focus:ring-orange-500 ${
                                    darkMode ? 'bg-slate-950 focus:ring-offset-slate-900' : 'bg-slate-100 focus:ring-offset-white'
                                  }`}
                                />
                                <img 
                                  src={product.images?.[product.primaryImageIndex || 0] || `https://picsum.photos/seed/${product.name}/800/600`} 
                                  alt="" 
                                  className={`w-16 h-16 rounded-xl object-cover border ${darkMode ? 'border-white/10' : 'border-slate-100'}`} 
                                  referrerPolicy="no-referrer" 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className={`font-bold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</h5>
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                                    product.status === 'In Stock' ? 'bg-green-500/10 text-green-500' :
                                    product.status === 'Out of Stock' ? 'bg-red-500/10 text-red-500' :
                                    'bg-slate-500/10 text-slate-500'
                                  }`}>
                                    {product.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                  <span>{product.category}</span>
                                  <span>•</span>
                                  {editingPriceId === product.id ? (
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <input 
                                        type="text"
                                        autoFocus
                                        value={tempPriceValue}
                                        onChange={(e) => setTempPriceValue(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleInlinePriceSave(product.id);
                                          if (e.key === 'Escape') setEditingPriceId(null);
                                        }}
                                        onBlur={() => handleInlinePriceSave(product.id)}
                                        className={`border border-orange-500/50 rounded px-2 py-0.5 text-orange-500 outline-none w-24 text-[10px] ${
                                          darkMode ? 'bg-slate-950' : 'bg-white'
                                        }`}
                                      />
                                      <button 
                                        onClick={() => handleInlinePriceSave(product.id)}
                                        className="text-green-500 hover:text-green-400"
                                      >
                                        <Check size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <span 
                                      className="text-orange-500 cursor-pointer hover:underline"
                                      onClick={() => {
                                        setEditingPriceId(product.id);
                                        setTempPriceValue(product.price);
                                      }}
                                      title="Click to edit price"
                                    >
                                      {product.price}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleEditProduct(product)}
                                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    darkMode ? 'text-slate-400 hover:text-orange-500 hover:bg-orange-500/10' : 'text-slate-500 hover:text-orange-500 hover:bg-orange-50'
                                  }`}
                                  title="Edit Product"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    darkMode ? 'text-slate-400 hover:text-red-500 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'
                                  }`}
                                  title="Delete Product"
                                >
                                  <Trash2 size={14} /> Remove
                                </button>
                              </div>
                            </div>
                          ))}
                          {products.length === 0 && (
                            <div className="text-center py-12 bg-slate-900/30 rounded-3xl border border-dashed border-white/5">
                              <p className="text-slate-600">Inventory is empty.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <ArrowRightLeft className="text-slate-500" /> Swap & Sale Requests ({swapRequests.length})
                      </h3>
                      {swapRequests.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900 rounded-3xl border border-white/5">
                          <p className="text-slate-500 italic">No swap requests yet.</p>
                        </div>
                      ) : (
                        <div className="grid gap-6">
                          {swapRequests.map(req => (
                            <div key={req.id} className={`p-6 rounded-3xl border space-y-4 ${
                              darkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-2">
                                  {(['Pending', 'Reviewed', 'Contacted', 'Completed', 'Rejected'] as const).map(status => (
                                    <button 
                                      key={status}
                                      onClick={() => updateSwapStatus(req.id, status)}
                                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                                        req.status === status 
                                          ? 'bg-orange-500 text-white border-orange-500' 
                                          : darkMode ? 'bg-slate-950 border-white/10 text-slate-400 hover:border-orange-500/50' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-orange-500/50'
                                      }`}
                                    >
                                      {status}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{req.userName}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      req.type === 'sell' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                    }`}>
                                      {req.type || 'swap'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      req.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                      req.status === 'Reviewed' ? 'bg-blue-500/10 text-blue-500' :
                                      req.status === 'Contacted' ? 'bg-green-500/10 text-green-500' :
                                      req.status === 'Completed' ? 'bg-green-500 text-white' :
                                      req.status === 'Rejected' ? 'bg-red-500 text-white' :
                                      'bg-slate-500/10 text-slate-500'
                                    }`}>
                                      {req.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl ${
                                      darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'
                                    }`}>
                                      <Phone size={12} className="text-orange-500" />
                                      <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{req.userContact}</span>
                                    </div>
                                    <a 
                                      href={`https://wa.me/${req.userContact.replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-green-500/20"
                                    >
                                      <MessageCircle size={14} /> WhatsApp
                                    </a>
                                  </div>
                                </div>
                                <div className="text-right text-[10px] text-slate-500 font-bold uppercase">
                                  {new Date(req.createdAt).toLocaleDateString()}
                                </div>
                              </div>

                              <div className={`grid md:grid-cols-2 gap-4 p-4 rounded-2xl border ${
                                darkMode ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'
                              }`}>
                                <div>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">User Device</p>
                                  <p className="font-bold text-orange-500">{req.userDeviceModel}</p>
                                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{req.userDeviceCondition} • {req.userDeviceSpecs}</p>
                                </div>
                                {req.type !== 'sell' && (
                                  <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Interested In</p>
                                    <p className="font-bold text-green-500">{req.interestedInModel}</p>
                                  </div>
                                )}
                              </div>

                              {req.devicePhotos && req.devicePhotos.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Device Photos</p>
                                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {req.devicePhotos.map((photo, idx) => (
                                      <div key={idx} className={`w-20 h-20 rounded-xl overflow-hidden border shrink-0 cursor-pointer hover:border-orange-500 transition-all ${
                                        darkMode ? 'border-white/10' : 'border-slate-200'
                                      }`} onClick={() => window.open(photo, '_blank')}>
                                        <img src={photo} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                                <div className="flex flex-wrap items-center gap-2">
                                  {['Pending', 'Reviewed', 'Contacted', 'Completed', 'Rejected'].map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => updateSwapStatus(req.id, status as any)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        req.status === status
                                          ? status === 'Pending' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' :
                                            status === 'Completed' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
                                            status === 'Rejected' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                                            'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                          : darkMode ? 'bg-white/5 text-slate-500 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                      }`}
                                    >
                                      {status}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setViewingReceipt(req)}
                                    className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all border border-blue-500/20"
                                    title="View/Print Receipt"
                                  >
                                    <Printer size={18} />
                                  </button>
                                  <button 
                                    onClick={() => deleteSwapRequest(req.id)}
                                    className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                                    title="Delete Request"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Floating Comparison Bar */}
      <AnimatePresence>
        {compareProducts.length > 0 && activeSection !== 'compare' && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
          >
            <div className={`backdrop-blur-xl border rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4 ${
              darkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <ArrowRightLeft size={20} />
                </div>
                <div>
                  <h5 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Compare Products</h5>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{compareProducts.length} items selected</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center -space-x-3 mr-2">
                  {compareProducts.map(p => (
                    <div key={p.id} className={`w-8 h-8 rounded-full border-2 overflow-hidden bg-slate-800 ${
                      darkMode ? 'border-slate-900' : 'border-white'
                    }`}>
                      <img 
                        src={p.images?.[p.primaryImageIndex || 0] || `https://picsum.photos/seed/${p.name}/800/600`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setCompareProducts([])}
                  className={`px-4 py-2 text-xs font-bold transition-colors ${
                    darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Clear
                </button>
                <button 
                  onClick={startComparison}
                  disabled={compareProducts.length < 2}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
                >
                  Compare Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {viewingReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingReceipt(null)}
              className={`fixed inset-0 backdrop-blur-md ${
                darkMode ? 'bg-slate-950/90' : 'bg-slate-900/60'
              }`}
            />
            <div className="relative w-full max-w-2xl my-8">
              <button 
                onClick={() => setViewingReceipt(null)}
                className={`absolute -top-12 right-0 p-2 rounded-full transition-all print:hidden ${
                  darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-900/10 text-slate-900 hover:bg-slate-900/20'
                }`}
              >
                <X size={24} />
              </button>
              <Receipt request={viewingReceipt} onBack={() => setViewingReceipt(null)} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`border-t py-12 transition-all ${
        darkMode ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Smartphone size={16} className="text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className={`text-lg font-bold tracking-tighter leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  JACKMAN
                </h1>
                <p className="text-[10px] text-orange-500 uppercase tracking-widest font-bold">Deals and Accessories</p>
              </div>
            </div>
            <p className="text-slate-500 max-w-sm font-medium">
              Your trusted gadgets plug in Kasoa. We specialize in buying, selling, and swapping premium devices with the best market rates.
            </p>
            <div className="flex items-center gap-4">
              <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                darkMode ? 'bg-white/5 text-slate-400 hover:bg-orange-500 hover:text-white' : 'bg-white text-slate-500 hover:bg-orange-500 hover:text-white shadow-sm'
              }`}>
                <MessageCircle size={18} />
              </button>
              <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                darkMode ? 'bg-white/5 text-slate-400 hover:bg-orange-500 hover:text-white' : 'bg-white text-slate-500 hover:bg-orange-500 hover:text-white shadow-sm'
              }`}>
                <Smartphone size={18} />
              </button>
            </div>
          </div>
          
          <div>
            <h5 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Quick Links</h5>
            <ul className="space-y-2 text-slate-500 text-sm font-medium">
              <li><button onClick={() => setActiveSection('home')} className="hover:text-orange-500 transition-colors">Shop All</button></li>
              <li><button onClick={() => setActiveSection('services')} className="hover:text-orange-500 transition-colors">Services</button></li>
              <li><button onClick={() => setActiveSection('contact')} className="hover:text-orange-500 transition-colors">Location</button></li>
            </ul>
          </div>

          <div>
            <h5 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Categories</h5>
            <ul className="space-y-2 text-slate-500 text-sm font-medium">
              {CATEGORIES.slice(0, 4).map(cat => (
                <li key={cat}><button className="hover:text-orange-500 transition-colors">{cat}</button></li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`max-w-7xl mx-auto px-4 mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest ${
          darkMode ? 'border-white/5' : 'border-slate-200'
        }`}>
          <p>© 2026 Jackman Deals and Accessories. Powered by Sam.</p>
          <button 
            onClick={() => {
              setActiveSection('admin');
              window.scrollTo(0, 0);
            }}
            className="hover:text-orange-500 transition-all flex items-center gap-2 opacity-60 hover:opacity-100 group"
          >
            <Lock size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Staff Portal</span>
          </button>
        </div>
      </footer>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className={`absolute inset-0 backdrop-blur-sm ${
                darkMode ? 'bg-slate-950/80' : 'bg-slate-900/40'
              }`}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-4xl border rounded-[2.5rem] overflow-hidden shadow-2xl ${
                darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <button 
                onClick={() => setQuickViewProduct(null)}
                className={`absolute top-6 right-6 z-10 p-2 rounded-full transition-all ${
                  darkMode ? 'bg-slate-950/50 text-white hover:bg-orange-500' : 'bg-slate-100 text-slate-900 hover:bg-orange-500 hover:text-white'
                }`}
              >
                <X size={20} />
              </button>
              
              <div className="grid md:grid-cols-2">
                <div className={`aspect-square ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                  <img 
                    src={quickViewProduct.images?.[quickViewProduct.primaryImageIndex || 0] || `https://picsum.photos/seed/${quickViewProduct.name}/800/600`} 
                    alt={quickViewProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold uppercase tracking-widest">
                      {quickViewProduct.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
                      darkMode ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {quickViewProduct.condition}
                    </span>
                    {quickViewProduct.reviews && quickViewProduct.reviews.length > 0 && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Star size={12} className="text-orange-500" fill="currentColor" />
                        <span className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {(quickViewProduct.reviews.reduce((acc, r) => acc + r.rating, 0) / quickViewProduct.reviews.length).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{quickViewProduct.name}</h3>
                  <p className={`mb-8 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {quickViewProduct.description}
                  </p>
                  <div className={`flex items-center justify-between mt-auto pt-8 border-t ${
                    darkMode ? 'border-white/5' : 'border-slate-100'
                  }`}>
                    <span className="text-3xl font-black text-orange-500">{quickViewProduct.price}</span>
                    <button 
                      onClick={() => {
                        handleProductClick(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {(deleteConfirmId || isBulkDeleteConfirm) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDeleteConfirmId(null);
                setIsBulkDeleteConfirm(false);
              }}
              className={`absolute inset-0 backdrop-blur-sm ${
                darkMode ? 'bg-slate-950/90' : 'bg-slate-900/40'
              }`}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative w-full max-w-md border rounded-3xl p-8 shadow-2xl text-center ${
                darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Are you sure?</h3>
              <p className="text-slate-400 mb-8 font-medium">
                {isBulkDeleteConfirm 
                  ? `You are about to delete ${selectedInventoryIds.length} products. This action cannot be undone.`
                  : "This product will be permanently removed from your inventory."}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setDeleteConfirmId(null);
                    setIsBulkDeleteConfirm(false);
                  }}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                    darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={isBulkDeleteConfirm ? confirmBulkDelete : confirmDeleteProduct}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
