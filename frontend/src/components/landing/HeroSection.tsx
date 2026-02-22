import { Button } from '@nextui-org/react';
import { Zap, TrendingUp, Shield, Clock, Sparkles } from '../icons';
import { motion } from 'framer-motion';

/**
 * Hero section for the landing page
 * Modern, clean design with better spacing and visual hierarchy
 */
export const HeroSection: React.FC<{
  onOCRClick: () => void;
  onManualClick: () => void;
}> = ({ onOCRClick, onManualClick }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 -z-10" />

      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Hero content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-primary-100 text-primary-700 rounded-full border border-primary-200"
            >
              <Sparkles size={16} />
              <span className="text-sm font-semibold">
                智慧電費分析工具
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-hero font-display"
            >
              找出最省錢的
              <span className="block text-gradient mt-2">
                電價方案
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="subtitle text-gray-600 max-w-xl leading-relaxed"
            >
              上傳您的電費單，系統自動計算所有可用方案，幫您找出最省錢的選擇。
              平均每月可節省
              <span className="font-bold text-primary-600 ml-1">10-20%</span>
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
                color="primary"
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-all shadow-lg hover:shadow-glow border-0"
                startContent={<Zap size={20} />}
              >
                拍照上傳電費單
              </Button>
              <Button
                onClick={onManualClick}
                variant="bordered"
                size="lg"
                className="h-14 px-8 text-base font-semibold border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-all"
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
                { icon: Shield, text: '資料不上傳伺服器', color: 'text-success-600' },
                { icon: Clock, text: '30秒完成分析', color: 'text-secondary-600' },
                { icon: TrendingUp, text: '平均省10-20%', color: 'text-primary-600' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-gray-100 ${item.color} shadow-sm`}>
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column - Feature cards */}
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  icon: Zap,
                  title: '智慧識別',
                  description: 'AI 自動識別電費單資訊',
                  gradient: 'from-primary-100 to-primary-50',
                  borderColor: 'border-primary-200',
                  iconBg: 'bg-primary-600',
                },
                {
                  icon: TrendingUp,
                  title: '精準比較',
                  description: '比較 20+ 種電價方案',
                  gradient: 'from-secondary-100 to-secondary-50',
                  borderColor: 'border-secondary-200',
                  iconBg: 'bg-secondary-600',
                },
                {
                  icon: Shield,
                  title: '資料安全',
                  description: '純前端運算，資料不上傳',
                  gradient: 'from-success-100 to-success-50',
                  borderColor: 'border-success-200',
                  iconBg: 'bg-success-600',
                },
                {
                  icon: Clock,
                  title: '快速分析',
                  description: '30 秒內完成分析',
                  gradient: 'from-warning-100 to-warning-50',
                  borderColor: 'border-warning-200',
                  iconBg: 'bg-warning-600',
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`p-6 bg-gradient-to-br ${feature.gradient} rounded-2xl border ${feature.borderColor} hover:shadow-card-hover transition-all cursor-default backdrop-blur-sm`}
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon size={26} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-title font-display mb-4 text-gray-900">
              簡單三步驟，開始省電費
            </h2>
            <p className="subtitle text-gray-600">
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
                gradient: 'from-primary-600 to-primary-500',
              },
              {
                step: '2',
                icon: '⚡',
                title: '智慧分析',
                description: '系統自動計算所有可用方案',
                gradient: 'from-secondary-600 to-secondary-500',
              },
              {
                step: '3',
                icon: '💰',
                title: '獲得建議',
                description: '檢視最省錢的方案與省金額',
                gradient: 'from-success-600 to-success-500',
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
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-4xl mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-white text-sm font-bold mb-3 shadow-md">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                {idx < 2 && (
                  <div className="hidden sm:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-200 via-secondary-200 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
