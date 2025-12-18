
import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, User, Order, Role, OrderStatus, Review } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './constants';
import { geminiService } from './services/geminiService';

// Icons (Simple SVG Components)
const Icons = {
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Dashboard: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  Package: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6.5"/><path d="M3.5 17.2l10-10L16.8 10l-10 10-4.3 1.2L3.5 17.2z"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"/></svg>,
  Star: ({ filled, ...props }: { filled?: boolean } & React.SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={filled ? "text-amber-400" : "text-gray-300"}
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

type Page = 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'login' | 'order-success' | 'admin-dash' | 'admin-products';

// Global Components
const StarsDisplay = ({ rating, count }: { rating: number, count?: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <Icons.Star key={s} filled={s <= Math.round(rating)} />
    ))}
    {count !== undefined && <span className="text-xs text-gray-400 ml-1">({count})</span>}
  </div>
);

// --- PAGE COMPONENTS ---

const Home: React.FC<{ 
  products: Product[], 
  onViewDetail: (id: string) => void, 
  onAddToCart: (p: Product) => void,
  searchQuery: string,
  setSearchQuery: (q: string) => void,
  askAssistant: (e: React.FormEvent) => void,
  isAiLoading: boolean,
  aiAssistantMsg: string,
  getProductRating: (id: string) => { avg: number, count: number }
}> = ({ products, onViewDetail, onAddToCart, searchQuery, setSearchQuery, askAssistant, isAiLoading, aiAssistantMsg, getProductRating }) => (
  <div className="space-y-16">
    <section className="relative h-[600px] flex items-center px-6 md:px-20 bg-slate-900 rounded-3xl mx-4 mt-4 overflow-hidden">
      <div className="absolute inset-0 opacity-40">
         <img src="https://picsum.photos/seed/hero/1600/900" alt="Hero" className="w-full h-full object-cover" />
      </div>
      <div className="relative z-10 max-w-2xl text-white space-y-6">
        <span className="inline-block bg-blue-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">New Season Now In</span>
        <h2 className="text-5xl md:text-7xl font-bold leading-tight">Technology and Style, Hand in Hand.</h2>
        <p className="text-lg text-slate-300">Discover a curated collection of gadgets and accessories designed for the modern professional.</p>
        <div className="flex gap-4">
          <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform" onClick={() => (window as any).scrollToProducts()}>
            Shop the Collection
          </button>
        </div>
      </div>
    </section>

    <section id="featured-products" className="max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h3 className="text-3xl font-bold mb-2">Featured Products</h3>
          <p className="text-gray-500">Hand-picked by our editors for their exceptional design.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.slice(0, 4).map(product => {
          const rating = getProductRating(product.id);
          return (
            <div key={product.id} className="group cursor-pointer" onClick={() => onViewDetail(product.id)}>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <span className="bg-white text-xs font-bold px-2 py-1 rounded shadow-sm">{product.category}</span>
                </div>
              </div>
              <div className="mb-2"><StarsDisplay rating={rating.avg} count={rating.count} /></div>
              <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h4>
              <p className="text-gray-500 text-sm mb-2 line-clamp-1">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                  className="bg-gray-900 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                ><Icons.Plus /></button>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-6 mb-12">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-12 text-white">
        <div className="flex-grow space-y-4">
          <h3 className="text-3xl font-bold flex items-center gap-3"><Icons.Sparkles /> AI Shopping Assistant</h3>
          <p className="text-blue-100 max-w-lg">Can't decide? Ask our Gemini-powered assistant for personalized recommendations.</p>
          <form onSubmit={askAssistant} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ex: Recommend a gift for a tech lover..." 
              className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-blue-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" disabled={isAiLoading} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold disabled:opacity-50">
              {isAiLoading ? 'Thinking...' : 'Ask AI'}
            </button>
          </form>
          {aiAssistantMsg && (
            <div className="mt-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-sm">
              <p className="leading-relaxed">{aiAssistantMsg}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  </div>
);

const ProductDetail: React.FC<{
  product: Product,
  reviews: Review[],
  onAddToCart: (p: Product) => void,
  onBack: () => void,
  hasPurchased: boolean,
  user: User | null,
  submitReview: (pid: string, rating: number, comment: string) => void,
  getProductRating: (id: string) => { avg: number, count: number }
}> = ({ product, reviews, onAddToCart, onBack, hasPurchased, user, submitReview, getProductRating }) => {
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const ratingInfo = getProductRating(product.id);
  const productReviews = reviews.filter(r => r.productId === product.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button onClick={onBack} className="mb-8 text-blue-600 flex items-center gap-2 font-medium hover:underline">
        <svg className="rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
        Back to Shop
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-lg"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div>
        <div className="space-y-8">
          <div>
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{product.category}</span>
            <h2 className="text-4xl font-bold mt-2">{product.name}</h2>
            <div className="flex items-center gap-4 mt-4"><StarsDisplay rating={ratingInfo.avg} count={ratingInfo.count} /></div>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
          <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
            <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <button onClick={() => onAddToCart(product)} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold">Add to Cart</button>
          </div>
        </div>
      </div>
      <div className="mt-20 border-t border-gray-100 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-2xl font-bold">Customer Reviews</h3>
            <div className="bg-gray-50 p-8 rounded-3xl text-center space-y-2">
              <p className="text-5xl font-bold text-gray-900">{ratingInfo.avg}</p>
              <div className="flex justify-center"><StarsDisplay rating={ratingInfo.avg} /></div>
              <p className="text-sm text-gray-500">Based on {ratingInfo.count} reviews</p>
            </div>
            {hasPurchased ? (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="font-bold">Share your experience</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => setReviewRating(s)}><Icons.Star filled={s <= reviewRating} /></button>)}
                </div>
                <textarea 
                  value={reviewComment} 
                  onChange={(e) => setReviewComment(e.target.value)} 
                  placeholder="Review text..." 
                  className="w-full border p-3 rounded-xl h-24 outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <button 
                  onClick={() => { submitReview(product.id, reviewRating, reviewComment); setReviewComment(''); }}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
                >Post Review</button>
              </div>
            ) : (
              <div className="bg-gray-100 p-6 rounded-3xl text-sm text-gray-500 text-center">
                {user ? "Only customers who have purchased this item can leave a review." : "Please sign in to leave a review."}
              </div>
            )}
          </div>
          <div className="lg:col-span-2 space-y-8">
            {productReviews.length > 0 ? productReviews.map(review => (
              <div key={review.id} className="pb-8 border-b border-gray-100 last:border-0 space-y-3">
                <div className="flex justify-between items-start">
                  <div><p className="font-bold text-gray-900">{review.userName}</p><StarsDisplay rating={review.rating} /></div>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 italic">"{review.comment}"</p>
              </div>
            )) : <div className="py-12 text-center text-gray-400 border-2 border-dashed rounded-3xl">No reviews yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Login: React.FC<{ onLogin: (role: Role) => void }> = ({ onLogin }) => {
  const [view, setView] = useState<'selection' | 'admin-form'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'husanboy@gmail.com' && password === '12345678') {
      onLogin('admin');
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-100 space-y-8">
        {view === 'selection' ? (
          <>
            <div className="text-center"><h2 className="text-3xl font-bold mb-2">Welcome Back</h2><p className="text-gray-500">Choose your demo role</p></div>
            <div className="space-y-4">
              <button onClick={() => onLogin('user')} className="w-full flex items-center justify-between border p-4 rounded-2xl hover:bg-blue-50 transition-all">
                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Icons.User /></div><span className="font-bold">Standard User</span></div>
                <Icons.ChevronRight />
              </button>
              <button onClick={() => setView('admin-form')} className="w-full flex items-center justify-between border p-4 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center"><Icons.Dashboard /></div><span className="font-bold">Store Admin</span></div>
                <Icons.ChevronRight />
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <button onClick={() => setView('selection')} className="text-sm text-gray-500 flex items-center gap-1 hover:text-blue-600"><svg className="rotate-180" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>Back</button>
            <div className="text-center"><h2 className="text-2xl font-bold mb-2">Admin Portal</h2><p className="text-sm text-gray-500">Enter husanboy@gmail.com / 12345678</p></div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input type="email" required placeholder="Email" className="w-full border p-3 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" required placeholder="Password" className="w-full border p-3 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Sign In</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// --- ADMIN COMPONENTS ---

const AdminProducts: React.FC<{
  products: Product[],
  onSaveProduct: (p: Product) => void,
  onDeleteProduct: (id: string) => void
}> = ({ products, onSaveProduct, onDeleteProduct }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);

  const handleEdit = (p: Product) => {
    setEditingProduct({ ...p });
  };

  const handleAdd = () => {
    setEditingProduct({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: CATEGORIES[0].name,
      image: `https://picsum.photos/seed/${Math.random()}/600/600`,
      stock: 0
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const pToSave = { ...editingProduct };
      if (!pToSave.id) pToSave.id = Math.random().toString(36).substr(2, 9);
      onSaveProduct(pToSave);
      setEditingProduct(null);
    }
  };

  const handleAiSuggest = async () => {
    if (!editingProduct?.name || !editingProduct?.category) return;
    setIsAiSuggesting(true);
    const desc = await geminiService.generateProductDescription(editingProduct.name, editingProduct.category);
    setEditingProduct({ ...editingProduct, description: desc });
    setIsAiSuggesting(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Products Inventory</h2>
        <button onClick={handleAdd} className="bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors">
          <Icons.Plus /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt={p.name} />
                    <span className="font-bold">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-500 text-sm">{p.category}</td>
                <td className="p-4 font-bold text-blue-600">${p.price.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {p.stock} units
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Icons.Edit /></button>
                    <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Icons.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 space-y-6 shadow-2xl animate-pop">
            <h3 className="text-2xl font-bold">{editingProduct.id ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Name</label>
                  <input 
                    required 
                    className="w-full border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Category</label>
                  <select 
                    className="w-full border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Price</label>
                  <input 
                    type="number" step="0.01" required 
                    className="w-full border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-1 ml-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase">Description</label>
                    <button 
                      type="button" 
                      onClick={handleAiSuggest} 
                      disabled={isAiSuggesting || !editingProduct.name}
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      <Icons.Sparkles /> {isAiSuggesting ? 'Thinking...' : 'AI Suggest'}
                    </button>
                  </div>
                  <textarea 
                    className="w-full border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 text-sm" 
                    value={editingProduct.description}
                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Stock Level</label>
                  <input 
                    type="number" required 
                    className="w-full border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-grow bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">Save Product</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="px-6 border border-gray-100 rounded-xl font-bold hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- LAYOUT COMPONENTS ---

const AdminLayout: React.FC<{ 
  children: React.ReactNode, 
  onNavigate: (page: Page) => void, 
  activePage: Page,
  onLogout: () => void
}> = ({ children, onNavigate, activePage, onLogout }) => (
  <div className="flex min-h-screen bg-gray-50 w-full">
    <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-8 hidden md:flex">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-blue-400">Nova</span>Admin
        </h1>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Management Hub</p>
      </div>
      <nav className="flex-grow space-y-2">
        <button 
          onClick={() => onNavigate('admin-dash')}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${activePage === 'admin-dash' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          <Icons.Dashboard /> Dashboard
        </button>
        <button 
          onClick={() => onNavigate('admin-products')}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${activePage === 'admin-products' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          <Icons.Package /> Products
        </button>
      </nav>
      <div className="pt-8 border-t border-slate-800 space-y-4">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-all text-sm"
        >
          <Icons.ChevronRight /> View Storefront
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all text-sm"
        >
          <Icons.LogOut /> Sign Out
        </button>
      </div>
    </aside>
    <main className="flex-grow p-8 overflow-auto">
      {children}
    </main>
  </div>
);

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-gray-100 py-16 px-6 mt-12">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-blue-600">NovaMarket</h3>
        <p className="text-sm text-gray-500 leading-relaxed">Premium gadgets and lifestyle accessories curated for the modern world. Quality meets design.</p>
      </div>
      <div>
        <h4 className="font-bold mb-6 uppercase text-[10px] tracking-widest text-gray-400">Shopping</h4>
        <ul className="space-y-4 text-sm text-gray-500 font-medium">
          <li className="hover:text-blue-600 cursor-pointer transition-colors">Electronics</li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors">Fashion</li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors">Home & Living</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 uppercase text-[10px] tracking-widest text-gray-400">Support</h4>
        <ul className="space-y-4 text-sm text-gray-500 font-medium">
          <li className="hover:text-blue-600 cursor-pointer transition-colors">Shipping Policy</li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors">Returns</li>
          <li className="hover:text-blue-600 cursor-pointer transition-colors">Contact Us</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 uppercase text-[10px] tracking-widest text-gray-400">Connect</h4>
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </div>
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
      <p>© 2024 NovaMarket Inc.</p>
      <div className="flex gap-8">
        <span className="hover:text-blue-600 cursor-pointer">Privacy</span>
        <span className="hover:text-blue-600 cursor-pointer">Terms</span>
      </div>
    </div>
  </footer>
);

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nova_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nova_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nova_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nova_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('nova_reviews');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [aiAssistantMsg, setAiAssistantMsg] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('nova_products', JSON.stringify(products));
    localStorage.setItem('nova_cart', JSON.stringify(cart));
    localStorage.setItem('nova_user', JSON.stringify(user));
    localStorage.setItem('nova_orders', JSON.stringify(orders));
    localStorage.setItem('nova_reviews', JSON.stringify(reviews));
  }, [products, cart, user, orders, reviews]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!activeCategory || p.category === activeCategory)
    );
  }, [products, searchQuery, activeCategory]);

  const getProductRating = (productId: string) => {
    const productReviews = reviews.filter(r => r.productId === productId);
    if (productReviews.length === 0) return { avg: 0, count: 0 };
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return { avg: parseFloat((sum / productReviews.length).toFixed(1)), count: productReviews.length };
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleCheckout = (address: string) => {
    if (!user) { setCurrentPage('login'); return; }
    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: user.id,
      items: cart.map(i => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      totalPrice: cartTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
      address
    };
    setProducts(prev => prev.map(p => {
      const ci = cart.find(x => x.id === p.id);
      return ci ? { ...p, stock: p.stock - ci.quantity } : p;
    }));
    setOrders([newOrder, ...orders]);
    setCart([]);
    setCurrentPage('order-success');
  };

  const askAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsAiLoading(true);
    const response = await geminiService.getShoppingAssistantResponse(searchQuery, products.map(p => p.name));
    setAiAssistantMsg(response);
    setIsAiLoading(false);
  };

  // Product Management Logic
  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === updatedProduct.id);
      if (exists) {
        return prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      }
      return [updatedProduct, ...prev];
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const currentProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

  // UI Helpers
  (window as any).scrollToProducts = () => {
    setCurrentPage('products');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {!currentPage.startsWith('admin') && (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-10">
            <h1 className="text-2xl font-black text-blue-600 cursor-pointer tracking-tighter" onClick={() => setCurrentPage('home')}>NOVAMARKET</h1>
            <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              <span className={`hover:text-blue-600 cursor-pointer transition-colors ${currentPage === 'products' ? 'text-blue-600' : ''}`} onClick={() => { setCurrentPage('products'); setActiveCategory(null); }}>Store</span>
              {CATEGORIES.map(cat => (
                <span 
                  key={cat.id} 
                  className={`hover:text-blue-600 cursor-pointer transition-colors ${activeCategory === cat.name ? 'text-blue-600' : ''}`}
                  onClick={() => { setCurrentPage('products'); setActiveCategory(cat.name); }}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setCurrentPage('cart')}>
              <Icons.Cart />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                   <span className="text-xs font-bold text-gray-900 leading-none">{user.name}</span>
                   {user.role === 'admin' && <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest cursor-pointer hover:underline" onClick={() => setCurrentPage('admin-dash')}>Admin Dash</span>}
                </div>
                <button onClick={() => setUser(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Icons.LogOut /></button>
              </div>
            ) : (
              <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100" onClick={() => setCurrentPage('login')}>Sign In</button>
            )}
          </div>
        </nav>
      )}

      <main className="flex-grow">
        {currentPage === 'home' && (
          <Home 
            products={products} 
            onViewDetail={(id) => { setSelectedProductId(id); setCurrentPage('product-detail'); }} 
            onAddToCart={handleAddToCart}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            askAssistant={askAssistant}
            isAiLoading={isAiLoading}
            aiAssistantMsg={aiAssistantMsg}
            getProductRating={getProductRating}
          />
        )}
        {currentPage === 'products' && (
          <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">{activeCategory || 'All Products'}</h2>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Filter store..." 
                  className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-3xl border border-gray-100 cursor-pointer hover:shadow-xl transition-all group" onClick={() => { setSelectedProductId(p.id); setCurrentPage('product-detail'); }}>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                  </div>
                  <div className="mb-1"><StarsDisplay rating={getProductRating(p.id).avg} /></div>
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</h4>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-black text-lg text-slate-800">${p.price.toFixed(2)}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }} 
                      className="bg-slate-900 text-white p-2 rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                    >
                      <Icons.Plus />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-40">
                <p className="text-gray-400 font-medium">No items found matching your search.</p>
              </div>
            )}
          </div>
        )}
        {currentPage === 'product-detail' && currentProduct && (
          <ProductDetail 
            product={currentProduct} 
            reviews={reviews} 
            onAddToCart={handleAddToCart} 
            onBack={() => setCurrentPage('products')} 
            hasPurchased={user ? orders.some(o => o.userId === user.id && o.items.some(i => i.productId === currentProduct.id)) : false}
            user={user}
            getProductRating={getProductRating}
            submitReview={(pid, r, c) => {
              const newRev = { id: Math.random().toString(36).substr(2, 9), productId: pid, userId: user!.id, userName: user!.name, rating: r, comment: c, createdAt: new Date().toISOString() };
              setReviews([newRev, ...reviews]);
            }}
          />
        )}
        {currentPage === 'cart' && (
          <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-10">Shopping Bag</h2>
            {cart.length > 0 ? (
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-6 p-6 bg-white rounded-3xl border border-gray-100 items-center shadow-sm">
                      <img src={item.image} className="w-24 h-24 object-cover rounded-2xl bg-gray-50" alt={item.name} />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{item.name}</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.category}</p>
                          </div>
                          <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="text-gray-300 hover:text-red-500 transition-colors"><Icons.Trash /></button>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <button className="text-gray-400 hover:text-blue-600 font-bold" onClick={() => { if(item.quantity > 1) setCart(cart.map(x => x.id === item.id ? {...x, quantity: x.quantity-1} : x)) }}>−</button>
                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                            <button className="text-gray-400 hover:text-blue-600 font-bold" onClick={() => setCart(cart.map(x => x.id === item.id ? {...x, quantity: x.quantity+1} : x)) }>+</button>
                          </div>
                          <span className="font-black text-xl">${(item.price*item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] h-fit sticky top-24 shadow-2xl">
                  <h3 className="text-xl font-bold mb-8 flex justify-between items-center">Summary <Icons.ChevronRight /></h3>
                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between text-slate-400 text-sm"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-slate-400 text-sm"><span>Shipping</span><span className="text-green-400">FREE</span></div>
                    <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-4xl font-black">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => setCurrentPage('checkout')} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">Complete Purchase</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-40 space-y-4">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-400"><Icons.Cart /></div>
                <h3 className="text-2xl font-bold">Your bag is empty</h3>
                <p className="text-gray-500 text-sm">Discover something new in our collection.</p>
                <button onClick={() => setCurrentPage('home')} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold">Explore Store</button>
              </div>
            )}
          </div>
        )}
        {currentPage === 'checkout' && (
          <div className="max-w-2xl mx-auto py-20 px-6 animate-fade-in">
            <h2 className="text-4xl font-bold mb-8">Checkout</h2>
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Shipping Address</label>
                <textarea placeholder="Ex: 123 Nova Street, Galaxy Way..." className="w-full border border-gray-100 p-4 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner bg-gray-50" />
              </div>
              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between mb-8">
                  <span className="font-bold text-gray-400">Order Total</span>
                  <span className="text-3xl font-black text-blue-600">${cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => handleCheckout("Nova City, Sector 7")} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl active:scale-95">Confirm & Order Now</button>
              </div>
            </div>
          </div>
        )}
        {currentPage === 'login' && <Login onLogin={(r) => { setUser({ id: 'u1', name: r==='admin'?'Husanboy':'Demo User', email: r==='admin'?'husanboy@gmail.com':'user@demo.com', role: r }); setCurrentPage(r==='admin'?'admin-dash':'home'); }} />}
        {currentPage === 'order-success' && (
          <div className="text-center py-40 animate-pop">
            <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-5xl font-black mb-4">Confirmed!</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">Your order has been successfully placed. We're getting it ready for shipment.</p>
            <button onClick={() => setCurrentPage('home')} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl transition-all">Back to Store</button>
          </div>
        )}
        
        {/* Admin Section Router */}
        {currentPage === 'admin-dash' && user?.role === 'admin' && (
          <AdminLayout onNavigate={setCurrentPage} activePage={currentPage} onLogout={() => { setUser(null); setCurrentPage('home'); }}>
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Admin Insights</h2>
                <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm">Real-time Node Status: <span className="text-green-500">Active</span></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gross Revenue</p>
                  <h4 className="text-4xl font-black text-blue-600">${orders.reduce((a, b) => a+b.totalPrice, 0).toFixed(2)}</h4>
                  <p className="text-[10px] font-bold text-green-500">↑ 12.5% vs last period</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
                  <h4 className="text-4xl font-black text-slate-800">{orders.length}</h4>
                  <p className="text-[10px] font-bold text-blue-500">Live order stream synced</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Stock Items</p>
                  <h4 className="text-4xl font-black text-slate-800">{products.length}</h4>
                  <p className="text-[10px] font-bold text-amber-500">{products.filter(p => p.stock < 5).length} low stock alerts</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-64 flex items-center justify-center">
                 <p className="text-xs font-bold text-gray-300 uppercase tracking-[0.3em]">Advanced Sales Analytics Visualizations Coming Soon</p>
              </div>
            </div>
          </AdminLayout>
        )}

        {currentPage === 'admin-products' && user?.role === 'admin' && (
          <AdminLayout onNavigate={setCurrentPage} activePage={currentPage} onLogout={() => { setUser(null); setCurrentPage('home'); }}>
            <AdminProducts 
              products={products} 
              onSaveProduct={handleSaveProduct} 
              onDeleteProduct={handleDeleteProduct} 
            />
          </AdminLayout>
        )}
      </main>

      {!currentPage.startsWith('admin') && <Footer />}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default App;
