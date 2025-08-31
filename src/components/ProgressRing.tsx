/**
 * Progress Ring Component
 * SVG-based circular progress indicator with smooth animations
 */

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
}

export default function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  className = '',
  color = '#3B82F6', // blue-500
  backgroundColor = '#E5E7EB', // gray-200
  showPercentage = true,
  label
}: ProgressRingProps) {
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {Math.round(progress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Confidence Ring - specialized version for confidence levels
 */
interface ConfidenceRingProps {
  confidence: number; // 0-1
  size?: number;
  className?: string;
}

export function ConfidenceRing({ 
  confidence, 
  size = 60, 
  className = '' 
}: ConfidenceRingProps) {
  // Convert confidence to percentage
  const percentage = confidence * 100;
  
  // Color based on confidence level
  const getColor = (conf: number) => {
    if (conf >= 0.8) return '#10B981'; // green-500
    if (conf >= 0.6) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  };
  
  // Label based on confidence level
  const getLabel = (conf: number) => {
    if (conf >= 0.8) return 'High';
    if (conf >= 0.6) return 'Med';
    return 'Low';
  };
  
  return (
    <ProgressRing
      progress={percentage}
      size={size}
      strokeWidth={6}
      color={getColor(confidence)}
      showPercentage={false}
      label={getLabel(confidence)}
      className={className}
    />
  );
}

/**
 * Mastery Ring - specialized version for skill mastery
 */
interface MasteryRingProps {
  mastered: number;
  total: number;
  size?: number;
  className?: string;
}

export function MasteryRing({ 
  mastered, 
  total, 
  size = 60, 
  className = '' 
}: MasteryRingProps) {
  const percentage = total > 0 ? (mastered / total) * 100 : 0;
  
  return (
    <ProgressRing
      progress={percentage}
      size={size}
      strokeWidth={6}
      color="#8B5CF6" // purple-500
      showPercentage={false}
      label={`${mastered}/${total}`}
      className={className}
    />
  );
}
