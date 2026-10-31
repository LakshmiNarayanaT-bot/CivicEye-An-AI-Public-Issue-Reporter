import React, { useState } from 'react';
import { User, LogOut, CheckCircle2, X, Shield, Lock } from 'lucide-react';

interface AuthModalProps {
  user: { name: string; email: string } | null;
  onLogin: (userData: { name: string; email: string }) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  user,
  onLogin,
  onLogout,
  onClose,
}) => {
  const [name, setName] = useState('Sai Lakshmi');
  const [email, setEmail] = useState('citizen@civiceye.org');

  const handleGoogleSignIn = () => {
    onLogin({
      name: name || 'Civic Citizen',
      email: email || 'citizen@civiceye.org',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {user ? 'Citizen Account' : 'Sign In to CivicEye'}
              </h3>
              <p className="text-xs text-slate-500">Firebase Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                <p className="text-xs text-slate-600">{user.email}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 mt-1">
                  <CheckCircle2 className="w-3 h-3 text-teal-600" /> Verified Citizen
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Your reports are securely saved and synced with your account profile.
            </p>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Sign in with your Google account to save civic reports, track municipal complaint tokens,
              and receive resolution updates.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase">Citizen Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google Account
            </button>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>Private & confidential citizen authentication</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
