import { motion } from "framer-motion";

export default function WebDevSVG() {
  return (
    <motion.svg 
      width="400" 
      height="300" 
      viewBox="0 0 400 300" 
      className="floating-animation"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Browser window */}
      <rect 
        x="50" 
        y="50" 
        width="300" 
        height="200" 
        rx="8" 
        fill="#ffffff" 
        stroke="#e2e8f0" 
        strokeWidth="2"
      />
      
      {/* Browser toolbar */}
      <rect 
        x="50" 
        y="50" 
        width="300" 
        height="30" 
        rx="8" 
        fill="#f1f5f9"
      />
      <circle cx="70" cy="65" r="4" fill="#ef4444" />
      <circle cx="85" cy="65" r="4" fill="#f59e0b" />
      <circle cx="100" cy="65" r="4" fill="#10b981" />
      
      {/* Website content being built */}
      <rect 
        x="70" 
        y="100" 
        width="260" 
        height="20" 
        rx="4" 
        fill="hsl(217, 90%, 40%)"
      />
      <rect 
        x="70" 
        y="130" 
        width="120" 
        height="8" 
        rx="2" 
        fill="#64748b"
      />
      <rect 
        x="70" 
        y="145" 
        width="180" 
        height="8" 
        rx="2" 
        fill="#64748b"
      />
      
      {/* Code editor side panel */}
      <rect 
        x="200" 
        y="100" 
        width="130" 
        height="120" 
        rx="4" 
        fill="#0f172a"
      />
      <motion.rect 
        x="210" 
        y="110" 
        width="80" 
        height="3" 
        rx="1" 
        fill="hsl(217, 90%, 54%)"
        initial={{ width: 0 }}
        animate={{ width: 80 }}
        transition={{ delay: 0.5, duration: 1 }}
      />
      <motion.rect 
        x="210" 
        y="118" 
        width="60" 
        height="3" 
        rx="1" 
        fill="#10b981"
        initial={{ width: 0 }}
        animate={{ width: 60 }}
        transition={{ delay: 0.7, duration: 1 }}
      />
      <motion.rect 
        x="210" 
        y="126" 
        width="100" 
        height="3" 
        rx="1" 
        fill="#f59e0b"
        initial={{ width: 0 }}
        animate={{ width: 100 }}
        transition={{ delay: 0.9, duration: 1 }}
      />
      
      {/* Animated elements */}
      <motion.rect 
        x="70" 
        y="170" 
        width="40" 
        height="40" 
        rx="4" 
        fill="#e2e8f0"
        animate={{ 
          fill: ["#e2e8f0", "hsl(217, 90%, 54%)", "#e2e8f0"] 
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
      <motion.rect 
        x="120" 
        y="170" 
        width="40" 
        height="40" 
        rx="4" 
        fill="#e2e8f0"
        animate={{ 
          fill: ["#e2e8f0", "#10b981", "#e2e8f0"] 
        }}
        transition={{ 
          duration: 3, 
          delay: 1,
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
    </motion.svg>
  );
}
