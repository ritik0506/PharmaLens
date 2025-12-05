/**
 * PharmaLens Research Dashboard
 * ==============================
 * Main dashboard for drug repurposing analysis.
 * 
 * Features:
 * - Drug name input with auto-suggest
 * - API call to Node.js backend
 * - Agent status visualization with clickable cards
 * - Detailed agent results panel
 * - ROI results display
 * - Citation panel with hover-to-verify
 * - PDF report generation
 * - Watch & Alert module
 * - Interactive Knowledge Graph
 */

import { useState, useContext } from 'react';
import { 
  Search, 
  Loader2, 
  Brain, 
  TrendingUp, 
  FileText, 
  Eye,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Users,
  Network,
  Ship,
  BarChart3,
  Globe,
  Database,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { ResearchContext } from '../context/ResearchContext';
import { researchService } from '../services/api';
import AgentStatusCard from '../components/dashboard/AgentStatusCard';
import AgentDetailPanel from '../components/dashboard/AgentDetailPanel';
import ROICalculator from '../components/dashboard/ROICalculator';
import AutoSuggestInput from '../components/dashboard/AutoSuggestInput';
import CitationPanel from '../components/dashboard/CitationPanel';
import ReportGenerator from '../components/dashboard/ReportGenerator';
import WatchAlertModule from '../components/dashboard/WatchAlertModule';
import KnowledgeGraph from '../components/graph/KnowledgeGraph';
import StrategySelector from '../components/StrategySelector';

const ResearchDashboard = () => {
  const { privacyMode } = useContext(ResearchContext);
  const [drugName, setDrugName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [activeTab, setActiveTab] = useState('results'); // 'results', 'graph', 'citations', 'watch'
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showStrategySelector, setShowStrategySelector] = useState(false);
  
  // 7 Mandatory Agents + 3 Strategic Agents (EY Focus)
  const [agentStatuses, setAgentStatuses] = useState([
    // Master Orchestrator
    { name: 'Master Orchestrator', status: 'idle', icon: Brain, key: 'orchestrator', color: 'indigo', category: 'core' },
    // 6 Mandatory Worker Agents
    { name: 'IQVIA Insights Agent', status: 'idle', icon: BarChart3, key: 'iqvia', color: 'blue', category: 'mandatory' },
    { name: 'EXIM Trends Agent', status: 'idle', icon: Ship, key: 'exim', color: 'cyan', category: 'mandatory' },
    { name: 'Patent Landscape Agent', status: 'idle', icon: FileText, key: 'patent', color: 'purple', category: 'mandatory' },
    { name: 'Clinical Trials Agent', status: 'idle', icon: Shield, key: 'clinical', color: 'green', category: 'mandatory' },
    { name: 'Internal Knowledge Agent', status: 'idle', icon: Database, key: 'internal', color: 'orange', category: 'mandatory' },
    { name: 'Web Intelligence Agent', status: 'idle', icon: Globe, key: 'web_intel', color: 'pink', category: 'mandatory' },
    // 3 Strategic Agents (High Value - EY Focus)
    { name: 'Regulatory Compliance', status: 'idle', icon: Shield, key: 'regulatory', color: 'red', category: 'strategic' },
    { name: 'Patient Sentiment', status: 'idle', icon: Users, key: 'patient_sentiment', color: 'rose', category: 'strategic' },
    { name: 'ESG & Sustainability', status: 'idle', icon: TrendingUp, key: 'esg', color: 'emerald', category: 'strategic' }
  ]);
  
  /**
   * Handle research form submission
   * Calls the Node.js backend which orchestrates AI agents
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!drugName.trim()) {
      setError('Please enter a drug or molecule name');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults(null);
    setSelectedAgent(null);
    setActiveTab('agents');
    
    // Update agent statuses to "thinking"
    setAgentStatuses(prev => prev.map(agent => ({
      ...agent,
      status: 'thinking'
    })));
    
    try {
      // Call the research API
      const response = await researchService.analyze(drugName, privacyMode);
      
      // Simulate progressive agent completion for all 10 agents
      const agentKeys = [
        'Master Orchestrator', 'IQVIA Insights Agent', 'EXIM Trends Agent', 
        'Patent Landscape Agent', 'Clinical Trials Agent', 'Internal Knowledge Agent', 
        'Web Intelligence Agent', 'Regulatory Compliance', 'Patient Sentiment', 'ESG & Sustainability'
      ];
      for (let i = 0; i < agentKeys.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setAgentStatuses(prev => prev.map(agent => 
          agent.name === agentKeys[i] ? { ...agent, status: 'completed' } : agent
        ));
      }
      
      setResults(response.data);
      setActiveTab('agents'); // Show agents overview by default
    } catch (err) {
      console.error('Research failed:', err);
      setError(err.response?.data?.error || 'Failed to process research request');
      setAgentStatuses(prev => prev.map(agent => ({
        ...agent,
        status: 'error'
      })));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle strategy query selection
   */
  const handleStrategySelect = (query) => {
    setDrugName(query.molecule);
    setShowStrategySelector(false);
  };

  /**
   * Handle agent card click - Opens modal with agent details
   */
  const handleAgentClick = (agent) => {
    // Allow click if agent has completed, regardless of data availability
    // AgentDetailPanel will show mock data if real data is not available
    if (agent.status === 'completed') {
      setSelectedAgent(selectedAgent === agent.name ? null : agent.name);
    }
  };

  /**
   * Get agent data from results - Maps all 10 agents to API response keys
   */
  const getAgentData = (agentName) => {
    if (!results?.results) return null;
    
    const keyMap = {
      // Core
      'Master Orchestrator': 'orchestrator',
      // Mandatory Agents
      'IQVIA Insights Agent': 'iqvia',
      'EXIM Trends Agent': 'exim',
      'Patent Landscape Agent': 'patent',
      'Clinical Trials Agent': 'clinical',
      'Internal Knowledge Agent': 'internal',
      'Web Intelligence Agent': 'web_intel',
      // Strategic Agents
      'Regulatory Compliance': 'regulatory',
      'Patient Sentiment': 'patient_sentiment',
      'ESG & Sustainability': 'esg'
    };
    
    return results.results[keyMap[agentName]] || null;
  };
  
  /**
   * Reset the form and results
   */
  const handleReset = () => {
    setDrugName('');
    setResults(null);
    setError(null);
    setSelectedAgent(null);
    setActiveTab('agents');
    setAgentStatuses(prev => prev.map(agent => ({
      ...agent,
      status: 'idle'
    })));
  };
  
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Sparkles className="w-8 h-8 mr-3 text-indigo-500" />
          Drug Repurposing Analysis
        </h1>
        <p className="text-gray-600 text-lg">
          Enter a drug or molecule name to analyze with our 10 specialized AI agents
        </p>
      </div>
      
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Strategy Selector */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowStrategySelector(!showStrategySelector)}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Use Strategic Query Library
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showStrategySelector ? 'rotate-180' : ''}`} />
            </button>
            {showStrategySelector && (
              <div className="mt-3">
                <StrategySelector onSelectQuery={handleStrategySelect} />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <AutoSuggestInput
                value={drugName}
                onChange={setDrugName}
                onSelect={(value) => {
                  setDrugName(value);
                }}
                placeholder="Enter drug name (e.g., Aspirin, Metformin, Imatinib, Semaglutide)"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !drugName.trim()}
              className={`px-8 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center space-x-2 shadow-lg ${
                isLoading || !drugName.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : privacyMode === 'secure'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>Analyze with 10 Agents</span>
                </>
              )}
            </button>
          </div>
          
          {/* Mode Indicator */}
          <div className={`text-sm text-center py-3 rounded-xl flex items-center justify-center space-x-2 ${
            privacyMode === 'secure' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
          }`}>
            <Shield className="w-4 h-4" />
            <span>
              Processing in <strong>{privacyMode === 'secure' ? 'Local Secure Mode (Llama 3)' : 'Cloud Mode (GPT-4)'}</strong>
            </span>
          </div>
        </form>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      {/* Agent Status Cards - Clickable Overview */}
      {(isLoading || results) && (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-200">
                  <Users className="w-5 h-5 text-white" />
                </div>
                AI Agent Overview
              </h2>
              <p className="text-sm text-gray-500 mt-1 ml-13">
                Click on any completed agent to view detailed analysis
              </p>
            </div>
            {results && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                <span className="text-sm text-green-700 font-medium flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {agentStatuses.filter(a => a.status === 'completed').length} of {agentStatuses.length} agents completed
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
            {agentStatuses.map((agent, index) => (
              <AgentStatusCard 
                key={agent.name}
                name={agent.name}
                status={agent.status}
                icon={agent.icon}
                delay={index * 80}
                onClick={() => handleAgentClick(agent)}
                isSelected={selectedAgent === agent.name}
                hasResults={!!getAgentData(agent.name) || agent.status === 'completed'}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Agents Thinking...
          </h3>
          <p className="text-gray-600">
            Our AI agents are analyzing {drugName} for repurposing opportunities
          </p>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-blue-500 rounded-full agent-thinking"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Results Display */}
      {results && !isLoading && (
        <div className="space-y-6">
          {/* Success Header - Enhanced */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl p-1 shadow-lg shadow-green-200">
            <div className="bg-white rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Analysis Complete!</h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    <span className="font-medium text-emerald-600">{drugName}</span> analyzed successfully • 
                    <span className="text-gray-400 ml-1">{results.results?.processingTimeMs || 0}ms</span>
                  </p>
                </div>
              </div>
              <ReportGenerator 
                data={results} 
                molecule={drugName} 
              />
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1">
              <div className="bg-white rounded-t-xl">
                <nav className="flex space-x-1 p-3 overflow-x-auto">
                  {[
                    { id: 'results', label: 'Summary & ROI', icon: TrendingUp, color: 'emerald' },
                    { id: 'graph', label: 'Knowledge Graph', icon: Network, color: 'blue' },
                    { id: 'citations', label: 'Citations', icon: FileText, color: 'purple' },
                    { id: 'watch', label: 'Watch & Alert', icon: Eye, color: 'orange' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-200 scale-105`
                          : 'text-gray-600 hover:bg-gray-100 hover:scale-102'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {/* Results/Summary Tab */}
              {activeTab === 'results' && (
                <div className="space-y-6">
                  {/* ROI Calculator Card */}
                  <ROICalculator data={results.results?.market} molecule={drugName} />
                  
                  {/* Additional Results Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Clinical Summary */}
                    {results.results?.clinical && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-blue-600" />
                          Clinical Insights
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trials Found</span>
                            <span className="font-semibold">{results.results.clinical.total_trials_found}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Safety Score</span>
                            <span className="font-semibold text-green-600">{results.results.clinical.safety_score}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Efficacy Rating</span>
                            <span className="font-semibold">{results.results.clinical.efficacy_rating}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Patent Summary */}
                    {results.results?.patent && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-purple-600" />
                          Patent Landscape
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Active Patents</span>
                            <span className="font-semibold">{results.results.patent.active_patents}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">FTO Status</span>
                            <span className="font-semibold">{results.results.patent.freedom_to_operate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expiration</span>
                            <span className="font-semibold">{results.results.patent.earliest_expiration}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Validation Summary */}
                  {results.results?.validation && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-yellow-600" />
                        Validation Results (The Skeptic)
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {results.results.validation.confidence_score || 85}%
                          </div>
                          <div className="text-sm text-gray-600">Confidence Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {results.results.validation.risk_flags?.length || 2}
                          </div>
                          <div className="text-sm text-gray-600">Risk Flags</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {results.results.validation.verified_claims || 12}
                          </div>
                          <div className="text-sm text-gray-600">Verified Claims</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Knowledge Graph Tab */}
              {activeTab === 'graph' && (
                <KnowledgeGraph 
                  molecule={drugName}
                  agentResults={results.results}
                />
              )}
              
              {/* Citations Tab */}
              {activeTab === 'citations' && (
                <CitationPanel 
                  agentResults={results.results}
                  molecule={drugName}
                />
              )}
              
              {/* Watch & Alert Tab */}
              {activeTab === 'watch' && (
                <WatchAlertModule 
                  agentResults={results.results}
                  molecule={drugName}
                />
              )}
            </div>
          </div>
          
          {/* New Research Button */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
            >
              Start New Research
            </button>
          </div>
        </div>
      )}

      {/* Agent Detail Modal - Renders at root level for proper overlay */}
      {selectedAgent && (
        <AgentDetailPanel
          agent={agentStatuses.find(a => a.name === selectedAgent)}
          data={getAgentData(selectedAgent)}
          onClose={() => setSelectedAgent(null)}
          molecule={drugName}
        />
      )}
    </div>
  );
};

export default ResearchDashboard;
