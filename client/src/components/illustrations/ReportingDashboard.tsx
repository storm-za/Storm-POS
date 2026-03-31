const BLUE = "hsl(217,90%,40%)";
const BLUE_LIGHT = "hsl(217,90%,55%)";

interface Props {
  className?: string;
}

export default function ReportingDashboard({ className }: Props) {
  const barData = [40, 65, 50, 80, 60, 95, 72];
  const barMaxH = 80;
  const barW = 18;
  const barGap = 8;
  const barStartX = 55;
  const barBaseY = 190;
  const linePoints = barData.map((v, i) => {
    const x = barStartX + i * (barW + barGap) + barW / 2;
    const y = barBaseY - (v / 100) * barMaxH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg
      viewBox="0 0 380 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Storm POS sales analytics and reporting dashboard"
    >
      <rect x="20" y="20" width="340" height="220" rx="10" fill="white" stroke="#111" strokeWidth="2"/>
      <rect x="20" y="20" width="340" height="32" rx="10" fill="white" stroke="#111" strokeWidth="2"/>
      <rect x="20" y="40" width="340" height="12" fill="white"/>
      <rect x="30" y="28" width="60" height="8" rx="3" fill="#f3f4f6"/>
      <rect x="96" y="28" width="40" height="8" rx="3" fill="#f3f4f6"/>
      <rect x="142" y="28" width="40" height="8" rx="3" fill="#f3f4f6"/>
      <rect x="300" y="26" width="50" height="10" rx="4" fill={BLUE}/>
      <rect x="304" y="29" width="30" height="4" rx="2" fill="white"/>
      <rect x="30" y="62" width="90" height="55" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
      <rect x="38" y="70" width="35" height="5" rx="2" fill="#9ca3af"/>
      <rect x="38" y="80" width="60" height="12" rx="2" fill="#111"/>
      <rect x="38" y="97" width="40" height="5" rx="2" fill={BLUE}/>
      <rect x="30" y="127" width="90" height="55" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
      <rect x="38" y="135" width="35" height="5" rx="2" fill="#9ca3af"/>
      <rect x="38" y="145" width="55" height="12" rx="2" fill="#111"/>
      <rect x="38" y="162" width="30" height="5" rx="2" fill="#d1d5db"/>
      <line x1="46" y1="195" x2="46" y2="110" stroke="#e5e7eb" strokeWidth="1"/>
      <line x1="46" y1="195" x2="225" y2="195" stroke="#e5e7eb" strokeWidth="1"/>
      {[0.25, 0.5, 0.75, 1].map((r, i) => (
        <line key={i} x1="46" y1={195 - r * barMaxH} x2="225" y2={195 - r * barMaxH} stroke="#f3f4f6" strokeWidth="1"/>
      ))}
      {barData.map((v, i) => {
        const x = barStartX + i * (barW + barGap);
        const h = (v / 100) * barMaxH;
        const y = barBaseY - h;
        const isHighlight = i === 5;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx="3"
            fill={isHighlight ? BLUE : "#e2e8f0"}
          />
        );
      })}
      <polyline
        points={linePoints}
        stroke={BLUE_LIGHT}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {barData.map((v, i) => {
        const x = barStartX + i * (barW + barGap) + barW / 2;
        const y = barBaseY - (v / 100) * barMaxH;
        const isHighlight = i === 5;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={isHighlight ? 5 : 3.5}
            fill={isHighlight ? BLUE : "white"}
            stroke={BLUE_LIGHT}
            strokeWidth="1.5"
          />
        );
      })}
      <rect x="244" y="62" width="106" height="55" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
      <rect x="252" y="70" width="35" height="5" rx="2" fill="#9ca3af"/>
      <rect x="252" y="80" width="50" height="10" rx="2" fill={BLUE}/>
      <rect x="252" y="95" width="80" height="4" rx="2" fill="#e5e7eb"/>
      <rect x="252" y="103" width="60" height="4" rx="2" fill="#e5e7eb"/>
      <rect x="250" y="127" width="110" height="115" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
      <rect x="258" y="135" width="50" height="5" rx="2" fill="#9ca3af"/>
      <circle cx="305" cy="165" r="28" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
      <circle cx="305" cy="165" r="28" fill="none" stroke={BLUE} strokeWidth="10"
        strokeDasharray="88 176" strokeDashoffset="0" strokeLinecap="round"/>
      <rect x="294" y="160" width="22" height="10" rx="2" fill="#f3f4f6"/>
      <rect x="297" y="162" width="10" height="6" rx="1" fill={BLUE}/>
      <rect x="258" y="205" width="40" height="5" rx="2" fill="#9ca3af"/>
      <rect x="302" y="205" width="50" height="5" rx="2" fill="#d1d5db"/>
      <rect x="258" y="216" width="40" height="5" rx="2" fill="#9ca3af"/>
      <rect x="302" y="216" width="30" height="5" rx="2" fill="#d1d5db"/>
      <rect x="258" y="227" width="40" height="5" rx="2" fill="#9ca3af"/>
      <rect x="302" y="227" width="40" height="5" rx="2" fill={BLUE}/>
    </svg>
  );
}
