'use client'

interface ProgressIndicatorProps {
  currentPhase: number
  totalPhases: number
  phaseNames: string[]
  className?: string
}

export function ProgressIndicator({ currentPhase, totalPhases, phaseNames, className }: ProgressIndicatorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Progress</span>
        <span>{currentPhase}/{totalPhases}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentPhase / totalPhases) * 100}%` }}
        />
      </div>
      
      <div className="space-y-1">
        {phaseNames.map((phase, index) => (
          <div key={index} className="flex items-center text-sm">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              index < currentPhase 
                ? 'bg-green-500' 
                : index === currentPhase 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
            }`} />
            <span className={
              index < currentPhase 
                ? 'text-green-600' 
                : index === currentPhase 
                  ? 'text-blue-600' 
                  : 'text-gray-500'
            }>
              {phase}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 