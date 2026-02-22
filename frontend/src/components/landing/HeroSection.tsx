import { Button } from '@nextui-org/react';
import { Zap, TrendingUp, Shield, Clock, Sparkles } from '../icons';
import { motion } from 'framer-motion';

/**
 * Hero Section - Tech Innovation Theme
 * Modern, bold design with electric gradients and neon accents
 */
export const HeroSection: React.FC<{
  onOCRClick: () => void;
  onManualClick: () => void;
}> = ({ onOCRClick, onManualClick }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-accent-600 -z-10">
        {/* Animated overlay pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
        </div>
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-accent-400/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-secondary-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <div className="container py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Hero content */}
          <div className="space-y-8">
            {/* Badge with glow */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 shadow-neon"
            >
              <Sparkles size={16} className="text-accent-400" />
              <span className="text-sm font-semibold">
                智慧電費分析 2025
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-hero font-display text-white leading-tight"
            >
              找出最省錢的
              <span className="block mt-2 bg-gradient-to-r from-accent-400 to-secondary-400 bg-clip-text text-transparent">
                電價方案
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="subtitle text-white/80 max-w-xl leading-relaxed"
            >
              上傳您的電費單，系統自動計算所有可用方案，幫您找出最省錢的選擇。
              平均每月可節省
              <span className="font-bold text-accent-400 ml-1">10-20%</span>
              電費。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={onOCRClick}
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-white text-primary-600 hover:bg-gray-50 transition-all shadow-neon hover:scale-105 border-0"
                startContent={<Zap size={20} />}
              >
                拍照上傳電費單
              </Button>
              <Button
                onClick={onManualClick}
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all backdrop-blur-md"
              >
                手動輸入
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-8 pt-6"
            >
              {[
                { icon: Shield, text: '資料不上傳', color: 'text-success-400' },
                { icon: Clock, text: '30秒完成', color: 'text-accent-400' },
                { icon: TrendingUp, text: '平均省20%', color: 'text-secondary-400' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg bg-white/10 backdrop-blur-md ${item.color} shadow-lg`}>
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm text-white/90 font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column - Feature cards with glassmorphism */}
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  icon: Zap,
                  title: 'AI 識別',
                  description: '智慧電費單識別',
                  gradient: 'from-primary-500/20 to-accent-500/20',
                  borderColor: 'border-primary-400/30',
                  iconBg: 'bg-gradient-to-br from-primary-500 to-accent-500',
                },
                {
                  icon: TrendingUp,
                  title: '精準比較',
                  description: '20+ 方案分析',
                  gradient: 'from-secondary-500/20 to-pink-500/20',
                  borderColor: 'border-secondary-400/30',
                  iconBg: 'bg-gradient-to-br from-secondary-500 to-pink-500',
                },
                {
                  icon: Shield,
                  title: '資料安全',
                  description: '本地運算不上傳',
                  gradient: 'from-success-500/20 to-emerald-500/20',
                  borderColor: 'border-success-400/30',
                  iconBg: 'bg-gradient-to-br from-success-500 to-emerald-500',
                },
                {
                  icon: Clock,
                  title: '快速分析',
                  description: '秒級完成計算',
                  gradient: 'from-warning-500/20 to-orange-500/20',
                  borderColor: 'border-warning-400/30',
                  iconBg: 'bg-gradient-to-br from-warning-500 to-orange-500',
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className={`p-6 bg-gradient-to-br ${feature.gradient} rounded-2xl border ${feature.borderColor} backdrop-blur-md hover:shadow-neon transition-all cursor-default group`}
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon size={26} className="text-white" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-title font-display mb-4 text-white">
              簡單三步驟，開始省電費
            </h2>
            <p className="subtitle text-white/70">
              不需要複雜的操作，任何人都能輕鬆使用
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                step: '1',
                icon: '📸',
                title: '上傳電費單',
                description: '拍照或手動輸入您的用電資訊',
                gradient: 'from-primary-500 to-accent-500',
              },
              {
                step: '2',
                icon: '⚡',
                title: '智慧分析',
                description: '系統自動計算所有可用方案',
                gradient: 'from-secondary-500 to-pink-500',
              },
              {
                step: '3',
                icon: '💰',
                title: '獲得建議',
                description: '檢視最省錢的方案與省金額',
                gradient: 'from-success-500 to-emerald-500',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative text-center group"
              >
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-4xl mb-6 shadow-neon group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-base font-bold mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
                {idx < 2 && (
                  <div className="hidden sm:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-400/50 via-secondary-400/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
    </div>
  );
};
