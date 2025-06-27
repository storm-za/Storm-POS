import { motion } from "framer-motion";

export default function HeroSVG() {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative">
        <motion.svg 
          width="300" 
          height="200" 
          viewBox="0 0 300 200" 
          className="drop-shadow-2xl floating-animation"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Laptop */}
          <rect 
            x="50" 
            y="40" 
            width="200" 
            height="120" 
            rx="8" 
            fill="#1e293b" 
            stroke="#374151" 
            strokeWidth="2"
          />
          <rect 
            x="60" 
            y="50" 
            width="180" 
            height="100" 
            rx="4" 
            fill="#0f172a"
          />
          
          {/* Animated Code lines */}
          <motion.rect 
            x="70" 
            y="60" 
            width="80" 
            height="4" 
            rx="2" 
            fill="hsl(217, 90%, 54%)"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.5, duration: 1 }}
          />
          <motion.rect 
            x="70" 
            y="70" 
            width="120" 
            height="4" 
            rx="2" 
            fill="#10b981"
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ delay: 0.7, duration: 1 }}
          />
          <motion.rect 
            x="70" 
            y="80" 
            width="60" 
            height="4" 
            rx="2" 
            fill="#f59e0b"
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ delay: 0.9, duration: 1 }}
          />
          <motion.rect 
            x="70" 
            y="90" 
            width="140" 
            height="4" 
            rx="2" 
            fill="hsl(217, 90%, 54%)"
            initial={{ width: 0 }}
            animate={{ width: 140 }}
            transition={{ delay: 1.1, duration: 1 }}
          />
          
          {/* Website preview */}
          <rect 
            x="170" 
            y="60" 
            width="60" 
            height="80" 
            rx="4" 
            fill="#f8fafc" 
            stroke="#e2e8f0"
          />
          <rect 
            x="175" 
            y="65" 
            width="50" 
            height="10" 
            rx="2" 
            fill="hsl(217, 90%, 40%)"
          />
          <rect 
            x="175" 
            y="80" 
            width="30" 
            height="4" 
            rx="1" 
            fill="#64748b"
          />
          <rect 
            x="175" 
            y="88" 
            width="40" 
            height="4" 
            rx="1" 
            fill="#64748b"
          />
          
          {/* Mobile device */}
          <rect 
            x="260" 
            y="60" 
            width="30" 
            height="50" 
            rx="6" 
            fill="#374151" 
            stroke="#4b5563"
          />
          <rect 
            x="265" 
            y="65" 
            width="20" 
            height="35" 
            rx="2" 
            fill="#0f172a"
          />
          <rect 
            x="268" 
            y="70" 
            width="14" 
            height="2" 
            rx="1" 
            fill="hsl(217, 90%, 54%)"
          />
          <rect 
            x="268" 
            y="75" 
            width="10" 
            height="2" 
            rx="1" 
            fill="#10b981"
          />
          
          {/* Animated automation arrows */}
          <motion.path 
            d="M30 100 L60 80" 
            stroke="hsl(217, 90%, 40%)" 
            strokeWidth="3" 
            fill="none" 
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: "reverse" }}
          />
          <polygon points="55,75 65,80 55,85" fill="hsl(217, 90%, 40%)" />
        </motion.svg>
      </div>
    </div>
  );
}
