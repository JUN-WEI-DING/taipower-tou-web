import { Button } from '@nextui-org/react';
import { Zap, TrendingUp, Shield, Clock, ArrowRight } from '../icons';
import { motion } from 'framer-motion';

/**
 * Hero Section - Clean Minimal Design
 * Inspired by shadcn-landing-page template
 * Simple, clean, focused on content
 */
export const HeroSection: React.FC<{
  onOCRClick: () => void;
  onManualClick: () => void;
}> = ({ onOCRClick, onManualClick }) => {
  return (
    <section className="container w-full">
      <div className="grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-20 md:py-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">
              智慧電費分析工具
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="max-w-screen-md mx-auto text-center text-4xl md:text-6xl font-bold"
          >
            <h1>
              找出最省錢的
              <span className="text-transparent px-2 bg-gradient-to-r from-primary to-orange-600 bg-clip-text">
                電價方案
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-screen-sm mx-auto text-xl text-muted-foreground leading-relaxed"
          >
            上傳您的電費單，系統自動計算所有可用方案，幫您找出最省錢的選擇。
            平均每月可節省
            <span className="font-bold text-primary ml-1">10-20%</span>
            電費。
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={onOCRClick}
              color="primary"
              size="lg"
              className="font-semibold shadow-md hover:shadow-lg transition-all group"
              endContent={<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            >
              拍照上傳電費單
            </Button>
            <Button
              onClick={onManualClick}
              variant="bordered"
              size="lg"
              className="font-semibold border-2 hover:bg-secondary"
            >
              手動輸入
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-6"
          >
            {[
              { icon: Shield, text: '資料不上傳' },
              { icon: Clock, text: '30秒完成' },
              { icon: TrendingUp, text: '平均省10-20%' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                <item.icon size={18} className="text-primary" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Feature preview cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14"
        >
          {[
            { icon: Zap, title: 'AI 識別', desc: '智慧電費單識別' },
            { icon: TrendingUp, title: '精準比較', desc: '20+ 方案分析' },
            { icon: Shield, title: '資料安全', desc: '本地運算不上傳' },
            { icon: Clock, title: '快速分析', desc: '秒級完成計算' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-card rounded-xl border border-border hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-bold text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* How it works section */}
      <div className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-title font-display mb-4 text-card-foreground">
            簡單三步驟，開始省電費
          </h2>
          <p className="subtitle text-muted-foreground">
            不需要複雜的操作，任何人都能輕鬆使用
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {[
            { step: '1', icon: '📸', title: '上傳電費單', desc: '拍照或手動輸入您的用電資訊' },
            { step: '2', icon: '⚡', title: '智慧分析', desc: '系統自動計算所有可用方案' },
            { step: '3', icon: '💰', title: '獲得建議', desc: '檢視最省錢的方案與省金額' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold mb-4 shadow-md">
                {item.step}
              </div>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-card-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
