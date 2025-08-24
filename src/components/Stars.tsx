interface StarsProps {
  count: number; // 0-3 stars
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Stars({ count, maxStars = 3, size = 'md', className = '' }: StarsProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const validCount = Math.max(0, Math.min(count, maxStars));

  return (
    <div className={`flex items-center space-x-1 ${className}`} role="img" aria-label={`${validCount} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }, (_, index) => {
        const isFilled = index < validCount;
        return (
          <svg
            key={index}
            viewBox="0 0 24 24"
            className={`${sizes[size]} transition-all duration-300`}
            fill={isFilled ? "#FCD34D" : "none"}
            stroke={isFilled ? "#F59E0B" : "#E5E7EB"}
            strokeWidth="2"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              className={isFilled ? "drop-shadow-sm" : ""}
            />
          </svg>
        );
      })}
    </div>
  );
}
