import { useState, useEffect } from 'react';
import { 
  Table,
  Network,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut
} from 'lucide-react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { MESLogo } from '../ui/MESLogo';
import { ThemeToggle } from '../ui/ThemeToggle';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { key: '/dashboard?view=table', icon: Table, label: 'Table View' },
    { key: '/dashboard?view=graph', icon: Network, label: 'Graph View' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile hamburger button */}
      {isMobile && !isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-[60] w-10 h-10 rounded-md bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all duration-200 text-gray-600"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Backdrop for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden ${
        !isMobile && (isCollapsed ? 'w-16' : 'w-52')
      } ${
        isMobile && 'w-64'
      } ${
        isMobile && (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`h-14 flex items-center transition-all duration-300 border-b border-gray-200 ${
            (isCollapsed && !isMobile) ? 'justify-center px-2' : 'px-5'
          }`}>
            <div className={`flex items-center ${(isCollapsed && !isMobile) ? '' : 'space-x-2.5'}`}>
              <MESLogo size="sm" />
              {(!isCollapsed || isMobile) && (
                <div>
                  <h1 className="text-base font-semibold text-gray-900">MES</h1>
                  <p className="text-xs text-gray-500">RM</p>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Button */}
          {!isMobile && (
            <div className="px-3 py-2.5 border-b border-gray-200 transition-all duration-300">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-center px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 border-0 bg-transparent"
              >
                {isCollapsed ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronLeft size={16} />
                )}
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.key);
                    if (isMobile) setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 group relative border-0 bg-transparent ${
                    (isCollapsed && !isMobile) ? 'justify-center p-2.5 hover:scale-105' : 'space-x-2.5 px-2.5 py-2'
                  }`}
                >
                  <Icon className={`text-gray-500 group-hover:text-blue-600 transition-all duration-200 ${
                    (isCollapsed && !isMobile) ? 'w-5 h-5' : 'w-[18px] h-[18px]'
                  }`} />
                  {(!isCollapsed || isMobile) && (
                    <span className="text-[15px] flex-1 text-left">{item.label}</span>
                  )}
                  {isCollapsed && !isMobile && (
                    <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-3 border-t border-gray-200 space-y-2.5 transition-all duration-300">
            {/* Theme Toggle */}
            <ThemeToggle variant="sidebar" isCollapsed={isCollapsed && !isMobile} />
            
            {/* User Info */}
            <div className={`flex items-center ${
              (isCollapsed && !isMobile) ? 'justify-center' : 'space-x-2.5 px-1.5'
            }`}>
              <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                A
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium truncate text-gray-900">Admin User</p>
                  <p className="text-xs truncate text-gray-500">admin@mes.com</p>
                </div>
              )}
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full justify-center text-[15px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-gray-200/60 rounded-md transition-all duration-200 h-8 flex items-center"
            >
              <LogOut className={`w-4 h-4 ${(!isCollapsed || isMobile) && 'mr-1.5'}`} />
              {(!isCollapsed || isMobile) && 'Sign Out'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${
        !isMobile && (isCollapsed ? 'pl-16' : 'pl-52')
      } ${
        isMobile && 'pl-0'
      }`}>
        <main>
          <div className={`${isMobile && 'pt-20'}`} style={{ height: '100vh', overflow: 'hidden' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
