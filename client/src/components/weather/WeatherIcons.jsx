function Svg({ children, className = "" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

export function IconSun({ className = "" }) {
  return (
    <Svg className={className}>
      <circle cx="32" cy="32" r="12" fill="white" opacity="0.95" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 32 + Math.cos(a) * 18;
        const y1 = 32 + Math.sin(a) * 18;
        const x2 = 32 + Math.cos(a) * 26;
        const y2 = 32 + Math.sin(a) * 26;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
          />
        );
      })}
    </Svg>
  );
}

export function IconCloud({ className = "" }) {
  return (
    <Svg className={className}>
      <path
        d="M22 44h24c7 0 12-4 12-10s-5-10-12-10c-1 0-2 0-3 .2C40 19 35 16 29 16c-7 0-12 5-12 12v.4C12 29.5 8 33.5 8 38s5 6 14 6Z"
        fill="white"
        opacity="0.92"
      />
    </Svg>
  );
}

export function IconRain({ className = "" }) {
  return (
    <Svg className={className}>
      <path
        d="M22 36h24c7 0 12-4 12-10s-5-10-12-10c-1 0-2 0-3 .2C40 11 35 8 29 8c-7 0-12 5-12 12v.4C12 21.5 8 25.5 8 30s5 6 14 6Z"
        fill="white"
        opacity="0.92"
      />
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={i}
          x1={18 + i * 6}
          y1={40}
          x2={14 + i * 6}
          y2={52}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.75"
        />
      ))}
    </Svg>
  );
}

export function IconSnow({ className = "" }) {
  return (
    <Svg className={className}>
      <path
        d="M22 36h24c7 0 12-4 12-10s-5-10-12-10c-1 0-2 0-3 .2C40 11 35 8 29 8c-7 0-12 5-12 12v.4C12 21.5 8 25.5 8 30s5 6 14 6Z"
        fill="white"
        opacity="0.92"
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle
          key={i}
          cx={16 + (i % 4) * 10}
          cy={42 + Math.floor(i / 4) * 10}
          r="2"
          fill="white"
          opacity="0.8"
        />
      ))}
    </Svg>
  );
}

export function IconFog({ className = "" }) {
  return (
    <Svg className={className}>
      <path
 d="M22 32h24c7 0 12-4 12-10s-5-10-12-10c-1 0-2 0-3 .2C40 7 35 4 29 4c-7 0-12 5-12 12v.4C12 17.5 8 21.5 8 26s5 6 14 6Z"
        fill="white"
        opacity="0.85"
      />
      {[40, 46, 52].map((y, idx) => (
        <path
          key={idx}
          d={`M12 ${y}h40`}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.55"
        />
      ))}
    </Svg>
  );
}

export function IconStorm({ className = "" }) {
  return (
    <Svg className={className}>
      <path
        d="M22 34h24c7 0 12-4 12-10s-5-10-12-10c-1 0-2 0-3 .2C40 9 35 6 29 6c-7 0-12 5-12 12v.4C12 19.5 8 23.5 8 28s5 6 14 6Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M30 38l-6 10h8l-4 10 12-16h-8l4-4z"
        fill="white"
        opacity="0.85"
      />
    </Svg>
  );
}

export function WeatherIcon({ theme, className = "" }) {
  switch (theme) {
    case "clear":
      return <IconSun className={className} />;
    case "rain":
      return <IconRain className={className} />;
    case "snow":
      return <IconSnow className={className} />;
    case "fog":
      return <IconFog className={className} />;
    case "storm":
      return <IconStorm className={className} />;
    case "cloudy":
    default:
      return <IconCloud className={className} />;
  }
}