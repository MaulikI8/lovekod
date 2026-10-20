'use client';

import React from 'react';
import GlassDock from './ui/GlassDock';
import { WhatsAppIcon, PhoneIcon } from './Icons';
import { Send, Mail, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { siteConfig } from '../config/site';

// Instagram custom SVG icon
function InstagramIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// TikTok custom SVG icon
function TikTokIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export function SocialGlassDock({ className = "" }) {
  const { siteSettings } = useStore();
  const phone = siteSettings?.whatsapp_number || siteConfig.whatsappRaw || '9779719567133';
  const cleanPhone = String(phone).replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Namaste LoveKod, I would like to inquire about festive kurtha sets.')}`;

  const dockItems = [
    {
      title: 'WhatsApp',
      icon: ({ className }) => <WhatsAppIcon size={20} className={className} />,
      href: waUrl,
    },
    {
      title: 'Instagram',
      icon: InstagramIcon,
      href: 'https://instagram.com/lovekod.np',
    },
    {
      title: 'TikTok',
      icon: TikTokIcon,
      href: 'https://tiktok.com/@lovekod.np',
    },
    {
      title: 'Direct Call',
      icon: ({ className }) => <PhoneIcon size={18} className={className} />,
      href: `tel:+${cleanPhone}`,
    },
    {
      title: 'Store Atelier',
      icon: MapPin,
      href: '/#about',
    },
  ];

  return (
    <div className={`flex flex-col items-center justify-center my-6 ${className}`}>
      <div className="mb-2.5 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-[var(--gold)] opacity-90">
          Connect with LoveKod Concierge
        </span>
      </div>
      <GlassDock items={dockItems} />
    </div>
  );
}

export default SocialGlassDock;
