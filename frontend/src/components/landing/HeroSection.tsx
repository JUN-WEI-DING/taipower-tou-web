import { Button } from '@nextui-org/react';
import { Zap, TrendingUp, Shield, Clock } from '../icons';
import { motion } from 'framer-motion';

/**
 * Hero section for the landing page
 * Features value proposition, trust signals, and clear CTAs
 */
export const HeroSection: React.FC<{
  onOCRClick: () => void;
  onManualClick: () => void;
}> = ({ onOCRClick, onManualClick }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Hero content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Zap size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">
                智慧電費分析工具
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              找出最省錢的
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                電價方案
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-default-600 max-w-xl">
              上傳您的電費單，系統自動計算所有可用方案，幫您找出最省錢的選擇。平均每月可節省
              <span className="font-bold text-primary"> 10-20%</span>
              電費。
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onOCRClick}
                color="primary"
                size="lg"
                className="h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                startContent={<Zap size={20} />}
              >
                拍照上傳電費單
              </Button>
              <Button
                onClick={onManualClick}
                variant="bordered"
                size="lg"
                className="h-14 px-8 text-base font-semibold border-2 hover:bg-default-50 transition-colors"
              >
                手動輸入
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              {[
                { icon: Shield, text: '資料不上傳伺服器' },
                { icon: Clock, text: '30秒完成分析' },
                { icon: TrendingUp, text: '平均省10-20%' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <item.icon size={18} className="text-default-400" />
                  <span className="text-sm text-default-500">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Feature cards */}
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Zap,
                  title: '智慧識別',
                  description: 'AI 自動識別電費單資訊，無需手動輸入',
                  color: 'bg-primary/10 text-primary',
                },
                {
                  icon: TrendingUp,
                  title: '精準比較',
                  description: '比較 20+ 種電價方案，找出最省錢選擇',
                  color: 'bg-secondary/10 text-secondary',
                },
                {
                  icon: Shield,
                  title: '資料安全',
                  description: '純前端運算，您的資料不上傳任何伺服器',
                  color: 'bg-success/10 text-success',
                },
                {
                  icon: Clock,
                  title: '快速分析',
                  description: '30 秒內完成分析，立即看到結果',
                  color: 'bg-warning/10 text-warning',
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="p-5 bg-content1 rounded-2xl border border-divider hover:shadow-lg transition-shadow cursor-default"
                >
                  <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-3`}>
                    <feature.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-default-500">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              簡單三步驟，開始省電費
            </h2>
            <p className="text-default-500">
              不需要複雜的操作，任何人都能輕鬆使用
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: '上傳電費單',
                description: '拍照或手動輸入您的用電資訊',
              },
              {
                step: '2',
                title: '智慧分析',
                description: '系統自動計算所有可用方案',
              },
              {
                step: '3',
                title: '獲得建議',
                description: '檢視最省錢的方案與省金額',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-default-500">{item.description}</p>
                {idx < 2 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
