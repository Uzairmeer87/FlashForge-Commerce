'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';
import { useCart } from '@/components/Providers';
import {
  Zap,
  ShoppingCart,
  ArrowLeft,
  Star,
  CheckCircle,
  ShieldCheck,
  Truck,
  RefreshCw,
  Minus,
  Plus,
  Loader2,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

function getProductImage(name: string): string {
  const keyMap: Record<string, string> = {
    shirt:   'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    jacket:  'https://images.unsplash.com/photo-1551537278-a7ed6f48e8e2?w=800&q=80',
    top:     'https://images.unsplash.com/photo-1562572159-4eaaf0db17a0?w=800&q=80',
    bag:     'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    shoes:   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    tuxedo:  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    tee:     'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    jumper:  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    blouse:  'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&q=80',
    skirt:   'https://images.unsplash.com/photo-1583496661160-fb5386a2788d?w=800&q=80',
  };
  const n = name.toLowerCase();
  for (const [key, url] of Object.entries(keyMap)) {
    if (n.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80';
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="page-wrapper flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading deal details…</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="page-wrapper flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="font-display font-bold text-2xl mb-2">Product Not Found</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          This flash deal might have expired or been removed.
        </p>
        <Link href="/" className="btn-accent">
          Return to Deals
        </Link>
      </div>
    );
  }

  const originalPrice = Math.round(product.price * 1.38);
  const discountPct = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const imgSrc = product.imageUrl || getProductImage(product.name);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: '64rem' }}>
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <Link href="/" className="btn-ghost text-xs sm:text-sm flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Back to Deals
        </Link>
        <button
          onClick={handleShare}
          className="btn-ghost text-xs sm:text-sm flex items-center gap-1.5"
          title="Share Product"
        >
          <Share2 className="w-4 h-4" />
          {copied ? 'Link Copied!' : 'Share'}
        </button>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Product Image Box */}
        <div className="glass-card relative overflow-hidden rounded-2xl p-4 flex items-center justify-center group" style={{ minHeight: '340px' }}>
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="badge-flash flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" fill="white" />
              Flash Deal
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(34,197,94,0.2)',
                color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.4)',
                backdropFilter: 'blur(8px)',
              }}
            >
              -{discountPct}% OFF
            </span>
          </div>

          <img
            src={imgSrc}
            alt={product.name}
            className="w-full max-h-[420px] object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Right: Product Info & Actions */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4" fill={i < 5 ? '#f59e0b' : 'none'} style={{ color: '#f59e0b' }} />
                ))}
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                4.9 (256 verified reviews)
              </span>
            </div>

            <h1 className="font-display font-bold leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
              {product.name}
            </h1>

            <p className="mt-1 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              SKU: {product.sku || product.id}
            </p>
          </div>

          {/* Pricing */}
          <div className="glass-card p-4 rounded-xl flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-black text-3xl text-gradient" style={{ color: 'var(--accent)' }}>
                  ${formatPrice(product.price)}
                </span>
                <span className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>
                  ${formatPrice(originalPrice)}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: '#22c55e' }}>
                You save ${formatPrice(originalPrice - product.price)} ({discountPct}%)
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
              <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>
                In Stock & Ready to Ship
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-sm mb-1.5">Description</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {product.description}
            </p>
          </div>

          {/* Quantity & CTA */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Quantity:
              </span>
              <div
                className="flex items-center rounded-lg overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2 hover:bg-white/5 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-semibold font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-2 hover:bg-white/5 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <button onClick={handleAddToCart} className="btn-ghost justify-center py-3 text-sm font-semibold">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-accent justify-center py-3 text-sm font-semibold">
                <Zap className="w-4 h-4" fill="white" />
                Buy Now
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col items-center text-center p-2">
              <Truck className="w-5 h-5 mb-1" style={{ color: 'var(--accent)' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                Express Delivery
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <ShieldCheck className="w-5 h-5 mb-1" style={{ color: '#22c55e' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                100% Genuine
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <RefreshCw className="w-5 h-5 mb-1" style={{ color: '#3b82f6' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                30-Day Return
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
