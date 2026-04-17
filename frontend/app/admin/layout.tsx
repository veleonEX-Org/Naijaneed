'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, ClipboardList, Users, Settings, LogOut, HeartHandshake, BarChart3, FileText, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('nn_admin_token');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (token) {
      setIsLoggedIn(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('nn_admin_token');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-xl hidden md:flex flex-col">
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-center">
          <Image 
            src="/images/logo.png" 
            alt="NaijaNeed Admin" 
            width={140} 
            height={40} 
            className="h-8 w-auto object-contain"
          />
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <AdminNavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} active={pathname === '/admin/dashboard'}>
            Dashboard
          </AdminNavLink>
          <AdminNavLink href="/admin/needs" icon={<ClipboardList size={20} />} active={pathname === '/admin/needs'}>
            Needs List
          </AdminNavLink>
          <AdminNavLink href="/admin/analytics" icon={<BarChart3 size={20} />} active={pathname === '/admin/analytics'}>
            Analytics
          </AdminNavLink>
          <AdminNavLink href="/admin/reports" icon={<FileText size={20} />} active={pathname === '/admin/reports'}>
            Reports
          </AdminNavLink>
          <AdminNavLink href="/admin/partners" icon={<HeartHandshake size={20} />} active={pathname === '/admin/partners'}>
            Partners
          </AdminNavLink>
          <AdminNavLink href="/admin/users" icon={<Users size={20} />} active={pathname === '/admin/users'}>
            Users
          </AdminNavLink>
          <AdminNavLink href="/admin/config" icon={<Settings size={20} />} active={pathname === '/admin/config'}>
            Config Panel
          </AdminNavLink>
          <AdminNavLink href="/admin/profile" icon={<User size={20} />} active={pathname === '/admin/profile'}>
            My Profile
          </AdminNavLink>
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full p-3 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminNavLink({ href, icon, children, active }: { href: string; icon: any; children: string; active: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
        active 
          ? 'bg-green-600 text-white shadow-lg' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
