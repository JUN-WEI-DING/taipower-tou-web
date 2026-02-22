import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, Github, ExternalLink } from '../icons';
import { cn } from '../../lib/utils';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: '首頁', href: '#', id: 'home' },
    { name: '使用說明', href: '#how-to', id: 'how-to' },
    { name: '常見問題', href: '#faq', id: 'faq' },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-orange-500/5'
          : 'bg-background/70 backdrop-blur-md border-b border-border'
      )}
    >
      <div className="container">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="臺電時間電價比較 - 回到首頁"
          >
            <motion.div
              className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
              animate={{
                boxShadow: isScrolled
                  ? '0 4px 20px -2px rgba(249, 115, 22, 0.3)'
                  : '0 4px 12px -2px rgba(249, 115, 22, 0.2)',
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl" />
              {/* Animated overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <Zap size={20} className="text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-foreground leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                臺電時間電價比較
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                找出最省錢的電價方案
              </p>
            </div>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.a
                key={item.id}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground relative group"
                whileHover={{ y: -1 }}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <motion.a
              href="https://github.com/JUN-WEI-DING/taipower-tou-web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              aria-label="檢視 GitHub 專案"
            >
              <Github size={18} />
              <span>GitHub</span>
              <ExternalLink size={14} className="opacity-50" />
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-label={isMobileMenuOpen ? '關閉選單' : '開啟選單'}
            aria-expanded={isMobileMenuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-background border-l border-border z-50 md:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <Zap size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">選單</h2>
                      <p className="text-xs text-muted-foreground">快速導航</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="關閉選單"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto p-6" aria-label="主要導航">
                  <ul className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <a
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all group"
                        >
                          <span className="w-2 h-2 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="font-medium">{item.name}</span>
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/* Footer Actions */}
                <div className="p-6 border-t border-border space-y-3">
                  <a
                    href="https://github.com/JUN-WEI-DING/taipower-tou-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-all"
                  >
                    <Github size={20} />
                    <span className="font-medium">GitHub Repository</span>
                    <ExternalLink size={16} className="ml-auto opacity-50" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;

