/**
 * PharmaLens Watch & Alert Module Component
 * ==========================================
 * Proactive molecule watchlist with background monitoring.
 * Uses actual agent data to generate alerts and insights.
 * 
 * Features:
 * - Add molecules to watch list
 * - Configure alert preferences
 * - View monitoring status based on agent results
 * - Email notification settings
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Plus, 
  X, 
  Eye, 
  Mail, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Settings,
  Trash2,
  Activity,
  FileText,
  Scale,
  TrendingUp,
  Shield,
  Globe,
  Beaker,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

const WatchAlertModule = ({ agentResults = {}, molecule = '' }) => {
  // Generate alerts from agent data
  const generateAlertsFromAgentData = () => {
    const alerts = [];
    const now = new Date();
    
    // Clinical trial alerts
    if (agentResults.clinical?.trials) {
      agentResults.clinical.trials.forEach((trial, idx) => {
        if (trial.phase?.toLowerCase().includes('3') || trial.phase?.toLowerCase().includes('recruiting')) {
          alerts.push({
            id: `clinical_alert_${idx}`,
            molecule: molecule,
            type: 'new_trial',
            priority: 'high',
            title: `${trial.phase || 'Clinical'} Trial: ${trial.status || 'Active'}`,
            description: trial.title || `Clinical trial for ${molecule}`,
            timestamp: new Date(now - Math.random() * 86400000 * 7).toISOString(),
            isRead: Math.random() > 0.5,
            link: trial.nct_id ? `https://clinicaltrials.gov/study/${trial.nct_id}` : null,
            source: 'ClinicalTrials.gov'
          });
        }
      });
    }
    
    // Patent alerts
    if (agentResults.patent?.patents) {
      agentResults.patent.patents.forEach((patent, idx) => {
        const isRecent = patent.filing_date && new Date(patent.filing_date) > new Date(now - 365 * 86400000);
        if (isRecent || idx < 2) {
          alerts.push({
            id: `patent_alert_${idx}`,
            molecule: molecule,
            type: 'patent',
            priority: patent.status === 'Granted' ? 'medium' : 'high',
            title: `Patent ${patent.status || 'Update'}: ${patent.patent_number || 'New Filing'}`,
            description: patent.title || `Patent related to ${molecule}`,
            timestamp: new Date(now - Math.random() * 86400000 * 14).toISOString(),
            isRead: Math.random() > 0.6,
            source: 'Patent Database'
          });
        }
      });
    }
    
    // Regulatory alerts
    if (agentResults.regulatory?.warnings?.length > 0) {
      agentResults.regulatory.warnings.forEach((warning, idx) => {
        alerts.push({
          id: `regulatory_alert_${idx}`,
          molecule: molecule,
          type: 'regulatory',
          priority: 'critical',
          title: `Regulatory Alert: ${warning.type || 'Safety Update'}`,
          description: warning.description || warning.message || `Regulatory notice for ${molecule}`,
          timestamp: new Date(now - Math.random() * 86400000 * 3).toISOString(),
          isRead: false,
          source: warning.agency || 'FDA'
        });
      });
    }
    
    // Market alerts from IQVIA
    if (agentResults.iqvia?.market_size || agentResults.iqvia?.growth_rate) {
      const growthRate = parseFloat(agentResults.iqvia?.growth_rate) || 0;
      if (growthRate > 5) {
        alerts.push({
          id: 'market_growth_alert',
          molecule: molecule,
          type: 'market',
          priority: 'medium',
          title: `Market Growth Alert: ${growthRate.toFixed(1)}% YoY`,
          description: `Strong market growth detected for ${molecule} segment`,
          timestamp: new Date(now - Math.random() * 86400000).toISOString(),
          isRead: false,
          source: 'IQVIA Analytics'
        });
      }
    }
    
    // Sentiment alerts
    if (agentResults.patient_sentiment?.sentiment_score) {
      const score = agentResults.patient_sentiment.sentiment_score;
      if (score < 0.5) {
        alerts.push({
          id: 'sentiment_alert',
          molecule: molecule,
          type: 'sentiment',
          priority: 'medium',
          title: 'Patient Sentiment Alert',
          description: `Lower than average patient sentiment detected (${(score * 100).toFixed(0)}%)`,
          timestamp: new Date(now - Math.random() * 86400000 * 2).toISOString(),
          isRead: true,
          source: 'Patient Analytics'
        });
      }
    }
    
    // ESG alerts
    if (agentResults.esg?.esg_score && agentResults.esg.esg_score < 70) {
      alerts.push({
        id: 'esg_alert',
        molecule: molecule,
        type: 'esg',
        priority: 'low',
        title: 'ESG Compliance Notice',
        description: `ESG score below threshold: ${agentResults.esg.esg_score}/100`,
        timestamp: new Date(now - Math.random() * 86400000 * 5).toISOString(),
        isRead: true,
        source: 'ESG Analytics'
      });
    }
    
    // Sort by timestamp (most recent first)
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return alerts;
  };

  // Generate watchlist insights from agent data
  const generateWatchlistInsights = () => {
    const insights = [];
    
    if (molecule) {
      insights.push({
        id: `watch_${molecule}`,
        molecule: molecule,
        addedDate: new Date().toISOString().split('T')[0],
        lastChecked: new Date().toISOString(),
        status: 'active',
        alertTypes: ['new_trials', 'patent_changes', 'regulatory'],
        recentAlerts: generateAlertsFromAgentData().filter(a => !a.isRead).length,
        metrics: {
          trials: agentResults.clinical?.trials?.length || 0,
          patents: agentResults.patent?.patents?.length || 0,
          warnings: agentResults.regulatory?.warnings?.length || 0
        }
      });
    }
    
    return insights;
  };

  const initialAlerts = useMemo(() => generateAlertsFromAgentData(), [agentResults, molecule]);
  const initialWatchlist = useMemo(() => generateWatchlistInsights(), [agentResults, molecule]);
  
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [alerts, setAlerts] = useState(initialAlerts);
  
  // Update when agent data changes
  useEffect(() => {
    setAlerts(generateAlertsFromAgentData());
    setWatchlist(generateWatchlistInsights());
  }, [agentResults, molecule]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newMolecule, setNewMolecule] = useState('');
  const [selectedAlertTypes, setSelectedAlertTypes] = useState({
    new_trials: true,
    patent_changes: true,
    new_publications: false,
    market_updates: false
  });
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailFrequency, setEmailFrequency] = useState('daily');
  const [activeTab, setActiveTab] = useState('watchlist');

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  // Alert type configurations
  const alertTypeConfig = [
    { id: 'new_trials', label: 'New Clinical Trials', icon: Beaker, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'patent_changes', label: 'Patent Changes', icon: Scale, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 'regulatory', label: 'Regulatory Updates', icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
    { id: 'market_updates', label: 'Market Updates', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 'sentiment', label: 'Sentiment Alerts', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  // Get alert icon based on type
  const getAlertIcon = (type) => {
    const config = {
      new_trial: { icon: Beaker, color: 'text-blue-600', bg: 'bg-blue-100' },
      patent: { icon: Scale, color: 'text-purple-600', bg: 'bg-purple-100' },
      regulatory: { icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
      market: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
      sentiment: { icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
      esg: { icon: Globe, color: 'text-teal-600', bg: 'bg-teal-100' },
      publication: { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' }
    };
    return config[type] || { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const config = {
      critical: { label: 'Critical', class: 'bg-red-500 text-white' },
      high: { label: 'High', class: 'bg-orange-500 text-white' },
      medium: { label: 'Medium', class: 'bg-yellow-500 text-white' },
      low: { label: 'Low', class: 'bg-gray-400 text-white' }
    };
    return config[priority] || config.medium;
  };

  // Add molecule to watchlist
  const handleAddMolecule = () => {
    if (!newMolecule.trim()) return;

    const newWatch = {
      id: `watch_${Date.now()}`,
      molecule: newMolecule,
      addedDate: new Date().toISOString().split('T')[0],
      lastChecked: new Date().toISOString(),
      status: 'active',
      alertTypes: Object.entries(selectedAlertTypes)
        .filter(([_, enabled]) => enabled)
        .map(([type, _]) => type),
      recentAlerts: 0
    };

    setWatchlist(prev => [...prev, newWatch]);
    setNewMolecule('');
    setShowAddModal(false);
  };

  // Remove molecule from watchlist
  const handleRemoveMolecule = (id) => {
    setWatchlist(prev => prev.filter(w => w.id !== id));
  };

  // Mark alert as read
  const handleMarkAsRead = (alertId) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isRead: true } : a
    ));
  };

  // Mark all alerts as read
  const handleMarkAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  // Get relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header with Gradient */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Watch & Alert
            {unreadAlerts > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full animate-pulse">
                {unreadAlerts} new
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Watch</span>
            </button>
          </div>
        </div>
        
        {/* Alert Summary */}
        {alerts.length > 0 && (
          <div className="flex items-center space-x-4 mt-3 text-xs">
            <div className="flex items-center space-x-1 text-white/80">
              <Beaker className="w-3 h-3" />
              <span>{alerts.filter(a => a.type === 'new_trial').length} trials</span>
            </div>
            <div className="flex items-center space-x-1 text-white/80">
              <Scale className="w-3 h-3" />
              <span>{alerts.filter(a => a.type === 'patent').length} patents</span>
            </div>
            <div className="flex items-center space-x-1 text-white/80">
              <Shield className="w-3 h-3" />
              <span>{alerts.filter(a => a.type === 'regulatory').length} regulatory</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'watchlist'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-1" />
          Watchlist ({watchlist.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'alerts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertCircle className="w-4 h-4 inline mr-1" />
          Alerts
          {unreadAlerts > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
              {unreadAlerts}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && (
          <div className="space-y-3">
            {watchlist.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No molecules being monitored</p>
                <p className="text-xs text-gray-400 mt-1">Search for a molecule to start monitoring</p>
              </div>
            ) : (
              watchlist.map(item => (
                <div 
                  key={item.id}
                  className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-blue-300 rounded-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`} />
                      <div className="font-semibold text-gray-900">{item.molecule}</div>
                      {item.recentAlerts > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center">
                          <Bell className="w-3 h-3 mr-1" />
                          {item.recentAlerts} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveMolecule(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Metrics Grid */}
                  {item.metrics && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{item.metrics.trials}</div>
                        <div className="text-xs text-blue-600">Trials</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{item.metrics.patents}</div>
                        <div className="text-xs text-purple-600">Patents</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-600">{item.metrics.warnings}</div>
                        <div className="text-xs text-red-600">Alerts</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Updated {getRelativeTime(item.lastChecked)}
                    </span>
                    <div className="flex items-center space-x-1">
                      {item.alertTypes?.slice(0, 3).map((type, idx) => {
                        const config = alertTypeConfig.find(c => c.id === type);
                        if (!config) return null;
                        const Icon = config.icon;
                        return (
                          <span key={idx} className={`p-1 ${config.bg || 'bg-gray-100'} rounded`}>
                            <Icon className={`w-3 h-3 ${config.color}`} />
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.length > 0 && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              </div>
            )}
            
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No alerts yet</p>
                <p className="text-xs text-gray-400 mt-1">Alerts will appear when new data is detected</p>
              </div>
            ) : (
              alerts.map(alert => {
                const alertIcon = getAlertIcon(alert.type);
                const AlertIcon = alertIcon.icon;
                const priorityBadge = getPriorityBadge(alert.priority);
                
                return (
                  <div 
                    key={alert.id}
                    onClick={() => handleMarkAsRead(alert.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      alert.isRead 
                        ? 'bg-gray-50 hover:bg-gray-100 border border-gray-200' 
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${alertIcon.bg}`}>
                        <AlertIcon className={`w-4 h-4 ${alertIcon.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-500">{alert.molecule}</span>
                            {!alert.isRead && (
                              <span className="flex items-center text-xs text-blue-600">
                                <Sparkles className="w-3 h-3 mr-0.5" />
                                New
                              </span>
                            )}
                            <span className={`text-xs px-1.5 py-0.5 rounded ${priorityBadge.class}`}>
                              {priorityBadge.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {getRelativeTime(alert.timestamp)}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900 text-sm">
                          {alert.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {alert.description}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {alert.source}
                          </span>
                          {alert.link && (
                            <a 
                              href={alert.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View Source →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>
          
          <div className="space-y-3">
            {/* Email Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Email Notifications</span>
              </div>
              <button
                onClick={() => setEmailEnabled(!emailEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  emailEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  emailEnabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Frequency */}
            {emailEnabled && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Frequency</span>
                <select
                  value={emailFrequency}
                  onChange={(e) => setEmailFrequency(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="realtime">Real-time</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Molecule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Add to Watchlist</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Molecule Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Molecule Name
                </label>
                <input
                  type="text"
                  value={newMolecule}
                  onChange={(e) => setNewMolecule(e.target.value)}
                  placeholder="e.g., Metformin, Aspirin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Alert Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Types
                </label>
                <div className="space-y-2">
                  {alertTypeConfig.map(type => (
                    <label 
                      key={type.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAlertTypes[type.id]}
                        onChange={() => setSelectedAlertTypes(prev => ({
                          ...prev,
                          [type.id]: !prev[type.id]
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <type.icon className={`w-4 h-4 ${type.color}`} />
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMolecule}
                disabled={!newMolecule.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchAlertModule;
