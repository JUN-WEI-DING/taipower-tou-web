import { Button } from '@nextui-org/react';
import { Zap, TrendingUp, Shield, Clock, Sparkles } from '../icons';
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
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-subtle -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-energy-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-energy-cyan/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse-glow" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Hero content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-energy text-white rounded-full shadow-energy"
            >
              <Sparkles size={16} />
              <span className="text-sm font-semibold">
                智慧電費分析工具
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
            >
              找出最省錢的
              <span className="block text-gradient-primary mt-2">
                電價方案
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-default-600 max-w-xl leading-relaxed"
            >
              上傳您的電費單，系統自動計算所有可用方案，幫您找出最省錢的選擇。
              平均每月可節省
              <span className="font-bold text-energy-blue"> 10-20%</span>
              電費。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={onOCRClick}
                color="primary"
                size="lg"
                className="h-14 px-8 text-base font-semibold shadow-energy hover:shadow-energy-lg transition-all"
                startContent={<Zap size={20} />}
              >
                拍照上傳電費單
              </Button>
              <Button
                onClick={onManualClick}
                variant="bordered"
                size="lg"
                className="h-14 px-8 text-base font-semibold border-2 hover:bg-default-50 transition-all"
              >
                手動輸入
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              {[
                { icon: Shield, text: '資料不上傳伺服器', color: 'text-energy-green' },
                { icon: Clock, text: '30秒完成分析', color: 'text-energy-cyan' },
                { icon: TrendingUp, text: '平均省10-20%', color: 'text-energy-blue' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-default-100 ${item.color}`}>
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm text-default-600 font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column - Feature cards */}
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Zap,
                  title: '智慧識別',
                  description: 'AI 自動識別電費單資訊',
                  color: 'bg-energy-blue/10 text-energy-blue',
                  borderColor: 'border-energy-blue/20',
                },
                {
                  icon: TrendingUp,
                  title: '精準比較',
                  description: '比較 20+ 種電價方案',
                  color: 'bg-energy-cyan/10 text-energy-cyan',
                  borderColor: 'border-energy-cyan/20',
                },
                {
                  icon: Shield,
                  title: '資料安全',
                  description: '純前端運算，資料不上傳',
                  color: 'bg-energy-green/10 text-energy-green',
                  borderColor: 'border-energy-green/20',
                },
                {
                  icon: Clock,
                  title: '快速分析',
                  description: '30 秒內完成分析',
                  color: 'bg-energy-orange/10 text-energy-orange',
                  borderColor: 'border-energy-orange/20',
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 bg-content1 rounded-2xl border ${feature.borderColor} hover:shadow-energy transition-all cursor-default`}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-3`}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-default-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              簡單三步驟，開始省電費
            </h2>
            <p className="text-default-500">
              不需要複雜的操作，任何人都能輕鬆使用
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: '📸',
                title: '上傳電費單',
                description: '拍照或手動輸入您的用電資訊',
              },
              {
                step: '2',
                icon: '⚡',
                title: '智慧分析',
                description: '系統自動計算所有可用方案',
              },
              {
                step: '3',
                icon: '💰',
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
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-energy text-white text-3xl mb-4 shadow-energy">
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-default-200 text-default-600 text-xs font-bold mb-2">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-default-500 text-sm leading-relaxed">{item.description}</p>
                {idx < 2 && (
                  <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-energy-blue/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
