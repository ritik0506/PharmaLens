/**
 * PharmaLens Agent Status Card Component
 * =======================================
 * Displays the status of individual AI agents during analysis.
 * Clickable to view detailed agent results.
 */

import { Loader2, CheckCircle2, AlertCircle, Clock, Eye, Sparkles } from 'lucide-react';

const AgentStatusCard = ({ 
  name, 
  status, 
  icon: Icon, 
  delay = 0, 
  onClick,
  isSelected = false,
  hasResults = false 
}) => {
  // Status configurations with enhanced styling
  const statusConfig = {
    idle: {
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      textColor: 'text-gray-500',
      iconBg: 'bg-gray-200',
      iconColor: 'text-gray-400',
      borderColor: 'border-gray-200',
      label: 'Standby',
      StatusIcon: Clock
    },
    thinking: {
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      iconColor: 'text-white',
      borderColor: 'border-blue-200',
      label: 'Analyzing...',
      StatusIcon: Loader2,
      animate: true,
      pulse: true
    },
    completed: {
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
      textColor: 'text-emerald-600',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500',
      iconColor: 'text-white',
      borderColor: 'border-emerald-200',
      label: 'Complete',
      StatusIcon: CheckCircle2
    },
    error: {
      bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
      textColor: 'text-red-600',
      iconBg: 'bg-gradient-to-br from-red-400 to-rose-500',
      iconColor: 'text-white',
      borderColor: 'border-red-200',
      label: 'Error',
      StatusIcon: AlertCircle
    }
  };
  
  const config = statusConfig[status] || statusConfig.idle;
  const { StatusIcon } = config;
  
  const isClickable = status === 'completed' && hasResults;
  
  return (
    <div 
      className={`
        relative ${config.bgColor} rounded-2xl p-4 transition-all duration-300 border-2 overflow-hidden
        ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-100 shadow-xl scale-105' : config.borderColor}
        ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-[1.03] hover:border-indigo-400 group' : ''}
        ${config.pulse ? 'animate-pulse' : ''}
      `}
      style={{ animationDelay: `${delay}ms` }}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Background decoration for completed/thinking states */}
      {(status === 'completed' || status === 'thinking') && (
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
      )}
      
      <div className="relative flex flex-col items-center text-center space-y-3">
        {/* Agent Icon with enhanced styling */}
        <div className={`p-3 rounded-xl ${config.iconBg} ${config.iconColor} shadow-lg ${isSelected ? 'ring-4 ring-white shadow-indigo-200' : ''} transition-all duration-300 ${isClickable ? 'group-hover:scale-110' : ''}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        {/* Agent Name */}
        <h4 className={`font-semibold text-sm leading-tight ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>
          {name.replace(' Agent', '')}
        </h4>
        
        {/* Status Badge */}
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm ${config.textColor} text-xs font-medium shadow-sm`}>
          <StatusIcon className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`} />
          <span>{config.label}</span>
        </div>
        
        {/* View Details Button - Only for completed */}
        {isClickable && (
          <div className="w-full mt-2 py-1.5 px-3 bg-white/80 group-hover:bg-indigo-500 rounded-lg text-xs font-medium text-gray-600 group-hover:text-white transition-all flex items-center justify-center space-x-1.5 shadow-sm">
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </div>
        )}
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}
      
      {/* Thinking shimmer effect */}
      {status === 'thinking' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      )}
    </div>
  );
};

export default AgentStatusCard;
