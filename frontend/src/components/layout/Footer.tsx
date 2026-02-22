import { motion } from 'framer-motion';
import { Zap, Github, ExternalLink } from '../icons';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 via-orange-50/50 to-gray-50 dark:from-gray-900 dark:via-orange-950/10 dark:to-gray-900 border-t border-border">
      {/* Subtle orange accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />

      <div className="container">
        <div className="footer-content py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Brand Section */}
            <div className="footer-main">
              <motion.div
                className="footer-brand flex items-center gap-3 mb-4"
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Zap size={20} className="text-white" />
                </div>
                <span className="footer-brand-text text-lg font-bold text-foreground">
                  臺電時間電價比較
                </span>
              </motion.div>

              <p className="footer-description text-sm text-muted-foreground leading-relaxed">
                幫助您找出最省錢的電價方案，根據臺灣電力公司最新費率計算。
                平均每月可節省 10-20% 電費。
              </p>
            </div>

            {/* Links Section */}
            <div className="footer-links grid grid-cols-2 gap-8">
              <div className="footer-section">
                <h4 className="footer-heading text-sm font-semibold text-foreground mb-4">
                  功能
                </h4>
                <ul className="footer-list space-y-2">
                  <li>
                    <motion.a
                      href="#features"
                      className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      20+ 方案比較
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      href="#features"
                      className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      AI 智慧識別
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      href="#features"
                      className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      資料安全
                    </motion.a>
                  </li>
                </ul>
              </div>

              <div className="footer-section">
                <h4 className="footer-heading text-sm font-semibold text-foreground mb-4">
                  關於
                </h4>
                <ul className="footer-list space-y-2">
                  <li>
                    <motion.a
                      href="https://github.com/JUN-WEI-DING/taipower-tou-web"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      <Github size={14} />
                      <span>GitHub</span>
                      <ExternalLink size={10} className="opacity-50" />
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      href="https://taipower.com.tw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      <span>臺灣電力公司</span>
                      <ExternalLink size={10} className="opacity-50" />
                    </motion.a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Privacy Badge */}
            <div className="footer-privacy">
              <motion.div
                className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      資料隱私保護
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      純前端應用，所有資料僅在您的瀏覽器中處理，從不上傳伺服器。
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="footer-bottom mt-12 pt-8 border-t border-border/60">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="footer-copyright text-sm text-muted-foreground">
                © {currentYear} 臺電時間電價比較網站 | 資料來源：臺灣電力公司
              </p>

              <div className="flex items-center gap-4">
                <motion.span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  <Zap size={12} />
                  <span> Powered by OCR</span>
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
