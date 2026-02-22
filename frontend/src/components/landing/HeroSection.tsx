import { Button } from '@nextui-org/react';
import { Zap, TrendingUp, Shield, Clock, ArrowRight, Sparkles, CheckCircle } from '../icons';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';

/**
 * Hero Section - Orange Theme shadcn/ui Design
 * Professional, modern landing page with animated gradients and smooth interactions
 */
export const HeroSection: React.FC<{
  onOCRClick: () => void;
  onManualClick: () => void;
}> = ({ onOCRClick, onManualClick }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section className={styles.hero}>
      {/* Animated gradient backgrounds */}
      <div className={styles.heroBackground}>
        <div className={styles.heroGradient1} />
        <div className={styles.heroGradient2} />
        <div className={styles.heroGradient3} />
      </div>

      <div className="container w-full relative z-10">
        <motion.div
          className={styles.heroContent}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Content */}
          <motion.div variants={containerVariants}>
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <div className={styles.heroBadge}>
                <Sparkles size={18} />
                <span>智慧電費分析工具 v2.0</span>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.div variants={itemVariants}>
              <h1 className={styles.heroTitle}>
                找出最省錢的
                <span className={styles.heroTitleGradient}>
                  電價方案
                </span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p variants={itemVariants} className={styles.heroDescription}>
              上傳您的電費單，系統自動計算所有可用方案，幫您找出最省錢的選擇。
              平均每月可節省 <strong>10-20%</strong> 電費，一年最高省下 <strong>$6,000</strong>。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className={styles.heroActions}>
              <Button
                onClick={onOCRClick}
                color="primary"
                size="lg"
                className={`${styles.btn} ${styles.btnPrimary}`}
                endContent={
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                }
              >
                <Zap size={20} />
                拍照上傳電費單
              </Button>
              <Button
                onClick={onManualClick}
                variant="bordered"
                size="lg"
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                手動輸入用電資訊
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={itemVariants} className={styles.heroFeatures}>
              {[
                { icon: Shield, text: '資料不上傳伺服器' },
                { icon: Clock, text: '30秒完成分析' },
                { icon: TrendingUp, text: '平均省10-20%' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className={styles.feature}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <div className={styles.featureIcon}>
                    <item.icon size={20} />
                  </div>
                  <span className={styles.featureText}>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Preview Card */}
          <motion.div
            className={styles.heroPreview}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <div className={styles.previewDots}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
                <span className={styles.previewTitle}>taipower-tou-comparison.app</span>
              </div>
              <div className={styles.previewBody}>
                <div className={styles.previewPlaceholder}>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Zap size={64} />
                  </motion.div>
                  <p>AI 智慧分析您的電費單</p>
                  <motion.div
                    className="flex items-center gap-2 mt-4 text-primary text-sm font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <CheckCircle size={16} />
                    <span>支援 20+ 種電價方案</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature showcase cards section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 relative z-10"
        >
          {[
            {
              icon: Zap,
              title: 'AI 智慧識別',
              desc: '上傳電費單照片，自動辨識用電資訊',
              color: 'from-orange-500 to-amber-500',
            },
            {
              icon: TrendingUp,
              title: '精準方案比較',
              desc: '20+ 種電價方案，找出最省錢選擇',
              color: 'from-orange-500 to-orange-600',
            },
            {
              icon: Shield,
              title: '資料絕對安全',
              desc: '純前端運算，資料不上傳任何伺服器',
              color: 'from-orange-600 to-orange-700',
            },
            {
              icon: Clock,
              title: '秒級快速分析',
              desc: '上傳後立即計算，無需等待',
              color: 'from-orange-700 to-orange-800',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300 group"
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* How it works section */}
        <div className="py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 mb-6">
              <Zap size={16} className="text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">簡單三步驟</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              開始省電費，<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">超簡單</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              不需要複雜的操作，任何人都能輕鬆使用
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                icon: '📸',
                title: '上傳電費單',
                desc: '拍照或手動輸入您的用電資訊',
                gradient: 'from-orange-400 to-orange-500',
              },
              {
                step: '2',
                icon: '⚡',
                title: '智慧分析',
                desc: '系統自動計算所有可用方案',
                gradient: 'from-amber-400 to-amber-500',
              },
              {
                step: '3',
                icon: '💰',
                title: '獲得建議',
                desc: '檢視最省錢的方案與省金額',
                gradient: 'from-yellow-400 to-yellow-500',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -10 }}
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-2xl font-bold mb-6 shadow-xl shadow-orange-200`}>
                  {item.step}
                </div>
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 md:p-12 border border-orange-100 relative z-10"
        >
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { value: '20+', label: '電價方案' },
              { value: '30秒', label: '分析時間' },
              { value: '10-20%', label: '平均省費' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
