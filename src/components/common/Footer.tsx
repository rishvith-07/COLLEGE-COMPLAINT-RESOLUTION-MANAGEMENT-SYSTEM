import React from 'react';
import { ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="p-1.5 rounded-lg bg-blue-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              CampusResolve
            </div>
            <p className="text-slate-400 leading-relaxed">
              Official centralized College Complaint Resolution and Grievance Redressal Portal.
              Ensuring transparency, student welfare, and rapid institutional accountability.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home & Overview
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Portal Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-white transition-colors">
                  Public Resolution Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Redressal Cells
            </h4>
            <ul className="space-y-2">
              <li>Hostel & Dining Hygiene</li>
              <li>IT & Campus Wi-Fi Network</li>
              <li>Academics & Examination Cell</li>
              <li>Anti-Ragging & Student Safety</li>
              <li>Campus Estate & Sanitation</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Dean of Student Affairs
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Admin Block, Room 102, Main Campus</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>grievance@college.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>+1-555-CAMPUS (226787)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CampusResolve. Official College Redressal System.</p>
          <div className="flex items-center gap-4">
            <span>Powered by PostgreSQL on Supabase</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-rose-500" /> for Student Welfare
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
