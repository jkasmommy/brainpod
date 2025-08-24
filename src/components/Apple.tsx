interface AppleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Apple({ size = 'md', className = '' }: AppleProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizes[size]} ${className} relative inline-block`}>
      {/* SVG Apple Icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full"
        role="img"
        aria-label="Apple"
      >
        {/* Apple Body */}
        <path
          d="M12 21C16.5 21 20 17.5 20 13C20 8.5 16.5 5 12 5C7.5 5 4 8.5 4 13C4 17.5 7.5 21 12 21Z"
          fill="#EF4444"
          className="drop-shadow-sm"
        />
        {/* Apple Highlight */}
        <path
          d="M8 11C10 9 14 9 16 11"
          stroke="#FCA5A5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Apple Stem */}
        <path
          d="M12 5V3"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Apple Leaf */}
        <path
          d="M12 3C13 3 14 4 14 5"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
