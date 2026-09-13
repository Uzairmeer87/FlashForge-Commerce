'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getActiveUserProfile, setActiveUserProfile, PRESET_PROFILES, type UserProfile } from '@/lib/user';
import { User, Check, ChevronDown, Sparkles, Shield, LogOut } from 'lucide-react';

export default function UserDropdown() {
  const [profile, setProfile] = useState<UserProfile>(getActiveUserProfile());
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncProfile = () => setProfile(getActiveUserProfile());
    window.addEventListener('flashforge_user_changed', syncProfile);
    window.addEventListener('storage', syncProfile);
    return () => {
      window.removeEventListener('flashforge_user_changed', syncProfile);
      window.removeEventListener('storage', syncProfile);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProfile = (p: UserProfile) => {
    setActiveUserProfile(p);
    setOpen(false);
    // Reload page to refresh query cache cleanly
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(15,15,26,0.8)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(10px)',
        }}
        aria-label="User Account"
        aria-expanded={open}
      >
        <img
          src={profile.avatarUrl}
          alt={profile.name}
          className="w-6 h-6 rounded-full object-cover border border-orange-500/40"
        />
        <span className="hidden lg:inline-block text-xs font-semibold max-w-[90px] truncate">
          {profile.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-2xl p-2 z-50 animate-fadeUp shadow-2xl"
          style={{
            background: 'rgba(10,10,20,0.98)',
            border: '1px solid rgba(249,115,22,0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
          }}
        >
          {/* Active Profile Banner */}
          <div className="p-3 rounded-xl mb-2 flex items-center gap-3" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <img src={profile.avatarUrl} alt={profile.name} className="w-9 h-9 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">{profile.name}</p>
              <p className="text-[10px] text-orange-400 font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {profile.role}
              </p>
            </div>
          </div>

          <div className="px-2 py-1 text-[10px] font-mono tracking-wider text-gray-400 uppercase">
            Switch Demo Account
          </div>

          {/* Profile Switcher Options */}
          <div className="flex flex-col gap-1">
            {PRESET_PROFILES.map(p => {
              const isActive = p.id === profile.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProfile(p)}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-all hover:bg-white/5"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                  }}
                >
                  <img src={p.avatarUrl} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{p.role}</p>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
