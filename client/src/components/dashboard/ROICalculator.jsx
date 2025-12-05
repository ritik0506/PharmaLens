/**
 * PharmaLens ROI Calculator Component
 * =====================================
 * Displays ROI calculation results from the Market Agent.
 * 
 * Shows:
 * - Projected revenue
 * - Development costs
 * - ROI percentage
 * - Investment recommendation
 */

import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';

const ROICalculator = ({ data, molecule }) => {
  if (!data) return null;
  
  // Safely extract values from potentially nested objects
  const getMarketSize = () => {
    if (typeof data.market_size === 'object') {
      return data.market_size.total_market_usd_bn || data.global_market_size_usd_bn || 4.2;
    }
    return data.global_market_size_usd_bn || data.market_size || 4.2;
  };
  
  const getCAGR = () => {
    if (typeof data.cagr_analysis === 'object') {
      return data.cagr_analysis.five_year_cagr || data.five_year_cagr || '8.5%';
    }
    return data.five_year_cagr || '8.5%';
  };
  
  const getCompetitiveIntensity = () => {
    if (typeof data.competitive_landscape === 'object') {
      return data.competitive_landscape.competitive_intensity || data.competitive_landscape.concentration || 'High';
    }
    return data.competitive_landscape || 'High';
  };
  
  // Calculate derived ROI metrics from market data
  const marketSizeNum = getMarketSize();
  const projectedRevenue = Math.round(marketSizeNum * 1000 * 0.05); // 5% market capture assumption
  const developmentCost = data.investment_metrics?.time_to_peak_sales_years ? 
    Math.round(data.investment_metrics.time_to_peak_sales_years * 50) : 250;
  const roiPercentage = Math.round(((projectedRevenue - developmentCost) / developmentCost) * 100);
  const timeToMarket = data.investment_metrics?.time_to_peak_sales_years || 5;
  
  // Determine recommendation based on ROI
  const getRecommendation = () => {
    if (roiPercentage > 200) return 'STRONG_BUY';
    if (roiPercentage > 100) return 'BUY';
    if (roiPercentage > 50) return 'HOLD';
    return 'REVIEW';
  };
  
  // Determine recommendation styling
  const getRecommendationStyle = (recommendation) => {
    switch (recommendation) {
      case 'STRONG_BUY':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: TrendingUp,
          label: 'Strong Buy'
        };
      case 'BUY':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          icon: TrendingUp,
          label: 'Buy'
        };
      case 'HOLD':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: Target,
          label: 'Hold'
        };
      default:
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-200',
          icon: AlertTriangle,
          label: 'Review'
        };
    }
  };
  
  const recStyle = getRecommendationStyle(data.recommendation || getRecommendation());
  const RecIcon = recStyle.icon;
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value * 1000000);
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header with Recommendation */}
      <div className={`${recStyle.bg} ${recStyle.border} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              ROI Analysis: {molecule}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Market Agent Financial Projections
            </p>
          </div>
          
          {/* Recommendation Badge */}
          <div className={`${recStyle.bg} ${recStyle.text} px-4 py-2 rounded-xl border ${recStyle.border} flex items-center space-x-2`}>
            <RecIcon className="w-5 h-5" />
            <span className="font-bold text-lg">{recStyle.label}</span>
          </div>
        </div>
      </div>
      
      {/* Main Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Projected Revenue */}
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">
              ${projectedRevenue}M
            </div>
            <div className="text-sm text-green-600">Projected Revenue</div>
          </div>
          
          {/* Development Cost */}
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700">
              ${developmentCost}M
            </div>
            <div className="text-sm text-red-600">Development Cost</div>
          </div>
          
          {/* ROI Percentage */}
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {roiPercentage}%
            </div>
            <div className="text-sm text-blue-600">Return on Investment</div>
          </div>
          
          {/* Time to Market */}
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {timeToMarket} yrs
            </div>
            <div className="text-sm text-purple-600">Time to Market</div>
          </div>
        </div>
        
        {/* Additional Metrics */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Market Size</span>
            <span className="font-semibold">${marketSizeNum.toFixed(1)}B</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">5Y CAGR</span>
            <span className="font-semibold">{getCAGR()}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Competition</span>
            <span className="font-semibold">{getCompetitiveIntensity()}</span>
          </div>
        </div>
        
        {/* Investment Thesis */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Award className="w-4 h-4 mr-2 text-yellow-500" />
            Investment Thesis
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {data.investment_thesis || `Based on market analysis, ${molecule} shows ${roiPercentage > 100 ? 'strong' : 'moderate'} repurposing potential with a projected ROI of ${roiPercentage}%. The ${getCompetitiveIntensity().toLowerCase()} competitive landscape and ${getCAGR()} CAGR suggest ${roiPercentage > 150 ? 'favorable' : 'manageable'} market conditions for entry.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
