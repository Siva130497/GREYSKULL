export function RainPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern id="rain" width="20" height="20" patternUnits="userSpaceOnUse">
        <line x1="10" y1="0" x2="0" y2="20" stroke="white" strokeWidth="1" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#rain)" />
    </svg>
  );
}

export function CloudPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20">
      <circle cx="20" cy="20" r="18" fill="white" />
      <circle cx="80" cy="60" r="22" fill="white" />
      <circle cx="140" cy="30" r="16" fill="white" />
    </svg>
  );
}

export function SnowPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-25">
      {Array.from({ length: 40 }).map((_, i) => (
        <circle
          key={i}
          cx={Math.random() * 400}
          cy={Math.random() * 200}
          r="1.5"
          fill="white"
        />
      ))}
    </svg>
  );
}

export function ClearPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20">
      <circle cx="80%" cy="30%" r="120" fill="white" />
    </svg>
  );
}