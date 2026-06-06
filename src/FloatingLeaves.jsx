import React, { useMemo } from 'react';

const LeafSVG = ({ id }) => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`lg-${id}`} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#86EFAC" />
        <stop offset="1" stopColor="#22C55E" />
      </linearGradient>
    </defs>
    <path d="M12 2C7.5 2 4 5.5 4 10C4 16 12 22 12 22C12 22 20 16 20 10C20 5.5 16.5 2 12 2Z" fill={`url(#lg-${id})`}/>
    <path d="M12 22C12 10 12 2 12 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M12 12C9 8 7 6 8 4" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round"/>
  </svg>
);

const PillSVG = ({ id }) => (
  <svg width="100%" height="100%" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="32" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#67E8F9" />
        <stop offset="0.5" stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0EA5E9" />
      </linearGradient>
    </defs>
    <rect x="0.5" y="0.5" width="31" height="15" rx="7.5" fill={`url(#lg-${id})`} />
    <line x1="16" y1="0.5" x2="16" y2="15.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
    <rect x="0.5" y="0.5" width="31" height="15" rx="7.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
  </svg>
);

const FlowerSVG = ({ id }) => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`lg-${id}`} cx="50%" cy="50%" r="50%">
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </radialGradient>
    </defs>
    <ellipse cx="12" cy="6" rx="3" ry="4.5" fill="#86EFAC" opacity="0.9"/>
    <ellipse cx="18" cy="9" rx="3" ry="4.5" fill="#86EFAC" opacity="0.9" transform="rotate(60 18 9)"/>
    <ellipse cx="18" cy="15" rx="3" ry="4.5" fill="#86EFAC" opacity="0.9" transform="rotate(120 18 15)"/>
    <ellipse cx="12" cy="18" rx="3" ry="4.5" fill="#86EFAC" opacity="0.9" transform="rotate(180 12 18)"/>
    <ellipse cx="6" cy="15" rx="3" ry="4.5" fill="#86EFAC" opacity="0.9" transform="rotate(240 6 15)"/>
    <ellipse cx="6" cy="9" rx="3" ry="4.5" fill="#86EFAC" opacity="0.9" transform="rotate(300 6 9)"/>
    <circle cx="12" cy="12" r="4" fill={`url(#lg-${id})`}/>
  </svg>
);

const DropletSVG = ({ id }) => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`lg-${id}`} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A7F3D0" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>
    <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9 12 2 12 2C12 2 4 9 4 14C4 18.4183 7.58172 22 12 22Z" fill={`url(#lg-${id})`}/>
    <ellipse cx="9" cy="13" rx="2" ry="3" fill="rgba(255,255,255,0.3)" transform="rotate(-20 9 13)"/>
  </svg>
);

const svgTypes = ['leaf', 'flower', 'droplet'];

function renderSVG(type, id) {
  switch(type) {
    case 'leaf': return <LeafSVG id={id} />;
    case 'pill': return <PillSVG id={id} />;
    case 'flower': return <FlowerSVG id={id} />;
    case 'droplet': return <DropletSVG id={id} />;
    default: return <LeafSVG id={id} />;
  }
}

export default function FloatingLeaves({ count = 10 }) {
  const elements = useMemo(() => (
    Array.from({ length: count }).map((_, i) => {
      const type = svgTypes[i % svgTypes.length];
      const isWide = type === 'pill';
      const size = Math.random() * 18 + 14;
      return {
        id: `el-${i}`,
        type,
        width: isWide ? size * 2 : size,
        height: size,
        left: (i / count) * 100 + Math.random() * 10,
        duration: Math.random() * 14 + 18,
        delay: -(Math.random() * 20),
        rotationX: Math.random() * 360,
      };
    })
  ), [count]);

  return (
    <div className="leaf-container">
      {elements.map((el) => (
        <div
          key={el.id}
          className="animated-leaf"
          style={{
            width: `${el.width}px`,
            height: `${el.height}px`,
            left: `${el.left}vw`,
            animationDuration: `${el.duration}s`,
            animationDelay: `${el.delay}s`,
            '--startX': `${el.rotationX}deg`,
          }}
        >
          {renderSVG(el.type, el.id)}
        </div>
      ))}
    </div>
  );
}

// Named exports for use inside cards
export { LeafSVG, PillSVG, FlowerSVG, DropletSVG };
