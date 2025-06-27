import { motion } from "framer-motion";

export default function HeroSVG() {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative">
        <motion.svg 
          width="300" 
          height="200" 
          viewBox="0 0 300 200" 
          className="drop-shadow-2xl"
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
          
          {/* Floating data particles */}
          <motion.circle 
            cx="20" 
            cy="50" 
            r="3" 
            fill="#10b981"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              y: [0, -20, 0]
            }}
            transition={{ 
              delay: 2.5, 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 1 
            }}
          />
          
          <motion.circle 
            cx="280" 
            cy="40" 
            r="2.5" 
            fill="#f59e0b"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              x: [-10, 10, -10]
            }}
            transition={{ 
              delay: 3, 
              duration: 2.5, 
              repeat: Infinity, 
              repeatDelay: 0.5 
            }}
          />
          
          <motion.circle 
            cx="35" 
            cy="170" 
            r="2" 
            fill="#8b5cf6"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1.5, 0],
              y: [0, -15, 0]
            }}
            transition={{ 
              delay: 3.5, 
              duration: 1.8, 
              repeat: Infinity, 
              repeatDelay: 1.2 
            }}
          />
          
          {/* Speed lines */}
          <motion.rect 
            x="250" 
            y="130" 
            width="15" 
            height="2" 
            rx="1" 
            fill="#06b6d4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: [0, 1, 0], 
              x: [-20, 0, 20]
            }}
            transition={{ 
              delay: 4, 
              duration: 1, 
              repeat: Infinity, 
              repeatDelay: 2 
            }}
          />
          
          <motion.rect 
            x="250" 
            y="135" 
            width="12" 
            height="1.5" 
            rx="1" 
            fill="#06b6d4"
            initial={{ opacity: 0, x: -15 }}
            animate={{ 
              opacity: [0, 0.8, 0], 
              x: [-15, 0, 15]
            }}
            transition={{ 
              delay: 4.2, 
              duration: 0.8, 
              repeat: Infinity, 
              repeatDelay: 2.2 
            }}
          />
          
          {/* Network connections */}
          <motion.path 
            d="M120 40 Q150 20 180 40" 
            stroke="#ef4444" 
            strokeWidth="2" 
            fill="none" 
            strokeDasharray="3,3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0], 
              opacity: [0, 0.8, 0]
            }}
            transition={{ 
              delay: 5, 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 1 
            }}
          />
          
          {/* Pulsing glow effect */}
          <motion.circle 
            cx="150" 
            cy="100" 
            r="60" 
            fill="url(#pulseGradient)" 
            opacity="0.1"
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          
          {/* Gradient definitions */}
          <defs>
            <radialGradient id="pulseGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(217, 90%, 54%)" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="hsl(217, 90%, 54%)" stopOpacity="0"/>
            </radialGradient>
          </defs>
        </motion.svg>
        
        {/* Additional floating badges with continuous animation */}
        <motion.div 
          className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -5, 0]
          }}
          transition={{ 
            delay: 3.2,
            duration: 0.8,
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          Fast
        </motion.div>
        
        <motion.div 
          className="absolute bottom-4 right-4 bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: [0, 5, 0]
          }}
          transition={{ 
            delay: 3.5,
            duration: 0.8,
            x: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          Secure
        </motion.div>
      </div>
    </div>
  );
}
