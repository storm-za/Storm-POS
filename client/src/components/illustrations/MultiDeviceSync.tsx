const BLUE = "hsl(217,90%,40%)";

interface Props {
  className?: string;
}

export default function MultiDeviceSync({ className }: Props) {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Storm POS running on desktop, tablet, and phone"
    >
      {/* Desktop monitor */}
      <rect x="20" y="40" width="220" height="150" rx="8" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="20" y="40" width="220" height="24" rx="8" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="20" y="52" width="220" height="12" fill="white"/>
      <circle cx="34" cy="52" r="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="48" cy="52" r="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="62" cy="52" r="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      {/* monitor stand */}
      <line x1="110" y1="190" x2="130" y2="205" stroke="#111" strokeWidth="2.5"/>
      <rect x="100" y="205" width="60" height="6" rx="3" fill="white" stroke="#111" strokeWidth="2"/>
      {/* sidebar panel */}
      <rect x="36" y="76" width="36" height="60" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="36" y="76" width="36" height="12" rx="4" fill={BLUE}/>
      <rect x="40" y="96" width="28" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="40" y="104" width="22" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="40" y="112" width="25" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      {/* main content panel */}
      <rect x="86" y="76" width="140" height="60" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="90" y="80" width="30" height="7" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="125" y="80" width="30" height="7" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="86" y="96" width="140" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="86" y="104" width="100" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="86" y="112" width="120" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="86" y="120" width="80" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="86" y="128" width="60" height="10" rx="3" fill={BLUE}/>
      {/* table row */}
      <rect x="36" y="150" width="204" height="18" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="40" y="154" width="50" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="98" y="154" width="50" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="156" y="154" width="40" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <circle cx="220" cy="157" r="6" fill={BLUE}/>
      <polyline points="217,157 219,160 224,154" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Tablet */}
      <rect x="270" y="70" width="120" height="170" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="270" y="70" width="120" height="18" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="270" y="78" width="120" height="10" fill="white"/>
      <rect x="278" y="75" width="50" height="6" rx="3" fill="white" stroke="#111" strokeWidth="1"/>
      {/* tablet sidebar */}
      <rect x="278" y="96" width="24" height="40" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="278" y="96" width="24" height="10" rx="4" fill={BLUE}/>
      <rect x="280" y="110" width="18" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="280" y="116" width="14" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="280" y="122" width="16" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      {/* tablet content */}
      <rect x="308" y="96" width="72" height="40" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="312" y="100" width="64" height="7" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="312" y="110" width="64" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="312" y="116" width="50" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="312" y="122" width="44" height="6" rx="2" fill={BLUE}/>
      {/* tablet table */}
      <rect x="278" y="148" width="104" height="50" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="282" y="152" width="96" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="282" y="158" width="60" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="282" y="164" width="80" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="282" y="170" width="50" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="282" y="177" width="40" height="10" rx="3" fill={BLUE}/>
      {/* tablet row */}
      <rect x="282" y="210" width="96" height="18" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="286" y="215" width="40" height="5" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="334" y="215" width="30" height="5" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <circle cx="376" cy="217" r="5" fill={BLUE}/>
      <polyline points="373.5,217 375.5,219.5 379,214.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Phone */}
      <rect x="415" y="100" width="50" height="90" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="415" y="100" width="50" height="14" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="415" y="107" width="50" height="7" fill="white"/>
      <rect x="422" y="104" width="20" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      {/* phone card */}
      <rect x="418" y="122" width="44" height="30" rx="3" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="418" y="122" width="44" height="9" rx="3" fill={BLUE}/>
      <rect x="420" y="135" width="40" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="420" y="141" width="30" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      {/* phone row */}
      <rect x="418" y="162" width="44" height="14" rx="3" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="421" y="166" width="22" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <circle cx="454" cy="167" r="4" fill={BLUE}/>
      <polyline points="452,167 453.5,169 456.5,164.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Sync arrows desktop <-> tablet */}
      <line x1="242" y1="115" x2="268" y2="115" stroke={BLUE} strokeWidth="1.5" strokeDasharray="4 3"/>
      <circle cx="242" cy="115" r="3.5" fill={BLUE}/>
      <circle cx="268" cy="115" r="3.5" fill={BLUE}/>
      {/* Sync arrows tablet <-> phone */}
      <line x1="392" y1="140" x2="413" y2="140" stroke={BLUE} strokeWidth="1.5" strokeDasharray="4 3"/>
      <circle cx="392" cy="140" r="3.5" fill={BLUE}/>
      <circle cx="413" cy="140" r="3.5" fill={BLUE}/>
      {/* Curved sync line desktop <-> phone */}
      <path d="M 255 115 Q 255 200 330 200" stroke={BLUE} strokeWidth="1.5" strokeDasharray="5 3" fill="none"/>
      <circle cx="330" cy="200" r="3.5" fill={BLUE}/>
    </svg>
  );
}
