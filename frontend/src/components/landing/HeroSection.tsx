import { Button } from '@nextui-org/react';
import { Zap, TrendingUp, Shield, Clock, Sparkles } from '../icons';
import { motion } from 'framer-motion';

/**
 * Hero section for the landing page
 * Features value proposition, trust signals, and clear CTAs
 * Modern tech-inspired design with gradient effects
 */
export const HeroSection: React.FC<{
  onOCRClick: () => void;
  onManualClick: () => void;
}> = ({ onOCRClick, onManualClick }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Modern animated background with mesh gradient */}
      <div className="absolute inset-0 bg-gradient-mesh -z-10" />

      {/* Floating gradient orbs for depth */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-tech-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tech-violet/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-tech-cyan/8 rounded-full blur-3xl animate-float" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Hero content */}
          <div className="space-y-8">
            {/* Modern badge with glow effect */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-tech text-white rounded-full shadow-tech-glow backdrop-blur-sm border border-white/10"
            >
              <Sparkles size={16} className="text-tech-cyan" />
              <span className="text-sm font-semibold tracking-wide">
                智慧電費分析工具
              </span>
            </motion.div>

            {/* Main headline with gradient text */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-hero font-display"
            >
              找出最省錢的
              <span className="block bg-gradient-tech-cyan bg-clip-text text-transparent mt-2">
                電價方案
              </span>
            </motion.h1>

            {/* Enhanced subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="subtitle text-default-600 max-w-xl leading-relaxed"
            >
              上傳您的電費單，系統自動計算所有可用方案，幫您找出最省錢的選擇。
              平均每月可節省
              <span className="font-bold text-tech-blue ml-1">10-20%</span>
              電費。
            </motion.p>

            {/* Enhanced CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={onOCRClick}
                color="primary"
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-gradient-tech hover:opacity-90 transition-all shadow-tech-glow hover:shadow-tech-glow-lg border-0"
                style={{
                  background: 'linear-gradient(135deg, #0066ff 0%, #7c3aed 100%)'
                }}
                startContent={<Zap size={20} />}
              >
                拍照上傳電費單
              </Button>
              <Button
                onClick={onManualClick}
                variant="bordered"
                size="lg"
                className="h-14 px-8 text-base font-semibold border-2 border-default-200 hover:border-tech-blue/50 hover:bg-default-50/50 transition-all"
              >
                手動輸入
              </Button>
            </motion.div>

            {/* Enhanced trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-8 pt-6"
            >
              {[
                { icon: Shield, text: '資料不上傳伺服器', color: 'text-tech-emerald' },
                { icon: Clock, text: '30秒完成分析', color: 'text-tech-cyan' },
                { icon: TrendingUp, text: '平均省10-20%', color: 'text-tech-blue' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-default-100/80 ${item.color} shadow-sm`}>
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm text-default-600 font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column - Enhanced feature cards */}
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  icon: Zap,
                  title: '智慧識別',
                  description: 'AI 自動識別電費單資訊',
                  gradient: 'from-tech-blue/20 to-tech-blue/5',
                  borderColor: 'border-tech-blue/20',
                  iconBg: 'bg-tech-blue',
                },
                {
                  icon: TrendingUp,
                  title: '精準比較',
                  description: '比較 20+ 種電價方案',
                  gradient: 'from-tech-violet/20 to-tech-violet/5',
                  borderColor: 'border-tech-violet/20',
                  iconBg: 'bg-tech-violet',
                },
                {
                  icon: Shield,
                  title: '資料安全',
                  description: '純前端運算，資料不上傳',
                  gradient: 'from-tech-emerald/20 to-tech-emerald/5',
                  borderColor: 'border-tech-emerald/20',
                  iconBg: 'bg-tech-emerald',
                },
                {
                  icon: Clock,
                  title: '快速分析',
                  description: '30 秒內完成分析',
                  gradient: 'from-tech-amber/20 to-tech-amber/5',
                  borderColor: 'border-tech-amber/20',
                  iconBg: 'bg-tech-amber',
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`p-6 bg-gradient-to-br ${feature.gradient} rounded-2xl border ${feature.borderColor} hover:shadow-tech-card-hover transition-all cursor-default backdrop-blur-sm group`}
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon size={26} className="text-white" />
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-default-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced How it works section */}
        <div className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14"
          >
            <h2 className="text-title font-display mb-4">
              簡單三步驟，開始省電費
            </h2>
            <p className="subtitle text-default-500">
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
                gradient: 'from-tech-blue to-tech-cyan',
              },
              {
                step: '2',
                icon: '⚡',
                title: '智慧分析',
                description: '系統自動計算所有可用方案',
                gradient: 'from-tech-violet to-tech-magenta',
              },
              {
                step: '3',
                icon: '💰',
                title: '獲得建議',
                description: '檢視最省錢的方案與省金額',
                gradient: 'from-tech-emerald to-tech-cyan',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative text-center group"
              >
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-4xl mb-5 shadow-tech-glow group-hover:scale-105 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-tech text-white text-sm font-bold mb-3 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-default-500 text-sm leading-relaxed">{item.description}</p>
                {idx < 2 && (
                  <div className="hidden sm:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-tech-blue/30 via-tech-violet/30 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
