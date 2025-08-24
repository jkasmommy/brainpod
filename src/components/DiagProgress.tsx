import { DiagState } from '../lib/diagTypes';

interface DiagProgressProps {
  state: DiagState;
  maxItems: number;
  showAbility?: boolean;
}

export default function DiagProgress({ state, maxItems, showAbility = false }: DiagProgressProps) {
  const progressPercentage = Math.min((state.attempts / maxItems) * 100, 100);
  
  // Normalize ability to 0-100 scale for display
  const abilityPercentage = ((state.ability + 2) / 4) * 100;
  
  // Get ability level description
  const getAbilityLabel = (ability: number) => {
    if (ability <= -1.0) return "Building Foundation";
    if (ability <= -0.3) return "Developing Skills";
    if (ability <= 0.3) return "On Track";
    if (ability <= 0.8) return "Strong Progress";
    return "Advanced";
  };
  
  // Get color based on ability
  const getAbilityColor = (ability: number) => {
    if (ability <= -1.0) return "bg-red-500";
    if (ability <= -0.3) return "bg-orange-500";
    if (ability <= 0.3) return "bg-yellow-500";
    if (ability <= 0.8) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 mb-6 backdrop-blur-sm">
      {/* Question Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Question {state.attempts + 1} of {maxItems}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(progressPercentage)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={state.attempts}
            aria-valuemin={0}
            aria-valuemax={maxItems}
            aria-label={`Progress: ${state.attempts} of ${maxItems} questions completed`}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {state.correctCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Correct</div>
        </div>
        
        <div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {state.skillsSeen.size}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Skills</div>
        </div>
        
        <div>
          <div className={`text-lg font-bold ${
            state.streak > 0 ? 'text-green-600 dark:text-green-400' : 
            state.streak < 0 ? 'text-red-600 dark:text-red-400' : 
            'text-gray-600 dark:text-gray-400'
          }`}>
            {Math.abs(state.streak)}
            {state.streak > 0 ? '🔥' : state.streak < 0 ? '❄️' : ''}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
        </div>
      </div>

      {/* Ability Meter (optional) */}
      {showAbility && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Learning Level
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getAbilityLabel(state.ability)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-700 ease-out ${getAbilityColor(state.ability)}`}
              style={{ width: `${Math.max(5, Math.min(95, abilityPercentage))}%` }}
              role="progressbar"
              aria-valuenow={Math.round(abilityPercentage)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Learning level: ${getAbilityLabel(state.ability)}`}
            />
          </div>
          
          {/* Level markers */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Building</span>
            <span>On Track</span>
            <span>Advanced</span>
          </div>
        </div>
      )}
    </div>
  );
}
