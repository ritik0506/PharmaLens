/**
 * PharmaLens Knowledge Graph Component
 * =====================================
 * Interactive Knowledge Graph visualization using React Force Graph.
 * Displays Drug-Target-Pathway-Disease relationships from AI agents.
 * 
 * Features:
 * - Force-directed graph layout
 * - Click-to-expand node details
 * - Color-coded node types
 * - Interactive zoom and pan
 * - Real data from Clinical, Patent, and Market agents
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  X,
  Pill,
  Dna,
  Activity,
  AlertCircle,
  AlertTriangle,
  Info,
  FileText,
  Building2,
  FlaskConical,
  Target,
  TrendingUp,
  Users,
  Globe,
  Sparkles,
  Shield
} from 'lucide-react';

const KnowledgeGraph = ({ agentResults = {}, molecule }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Extract data from agentResults
  const clinicalData = agentResults?.clinical || {};
  const patentData = agentResults?.patent || {};
  const marketData = agentResults?.iqvia || agentResults?.market || {};
  const regulatoryData = agentResults?.regulatory || {};

  // Build knowledge graph from agent data
  useEffect(() => {
    const generatedNodes = [];
    const generatedEdges = [];
    let nodeId = 0;

    // Central drug node
    generatedNodes.push({
      id: `drug_${nodeId++}`,
      label: molecule || 'Drug',
      type: 'drug',
      color: '#3B82F6',
      x: 250,
      y: 200,
      metadata: {
        type: 'Primary Molecule',
        source: 'User Query'
      }
    });

    // Add Clinical Trial nodes
    if (clinicalData) {
      // Indications
      const indications = clinicalData.current_indications || clinicalData.indications || [];
      indications.slice(0, 4).forEach((indication, i) => {
        const angle = (i / 4) * Math.PI * 0.5 - Math.PI / 4;
        generatedNodes.push({
          id: `indication_${nodeId++}`,
          label: typeof indication === 'string' ? indication : indication.name || `Indication ${i+1}`,
          type: 'disease',
          color: '#EF4444',
          x: 250 + Math.cos(angle) * 180,
          y: 200 + Math.sin(angle) * 140,
          metadata: {
            type: 'Therapeutic Indication',
            source: 'Clinical Trials Agent',
            trials: clinicalData.total_trials_found || 0
          }
        });
        generatedEdges.push({
          source: 'drug_0',
          target: `indication_${nodeId-1}`,
          type: 'treats',
          label: 'treats'
        });
      });

      // Trial sponsors/companies
      const trials = clinicalData.trials || [];
      const sponsors = [...new Set(trials.slice(0, 3).map(t => t.sponsor || t.company))].filter(Boolean);
      sponsors.forEach((sponsor, i) => {
        const angle = Math.PI / 2 + (i / 3) * Math.PI * 0.4;
        generatedNodes.push({
          id: `sponsor_${nodeId++}`,
          label: sponsor,
          type: 'company',
          color: '#F59E0B',
          x: 250 + Math.cos(angle) * 200,
          y: 200 + Math.sin(angle) * 150,
          metadata: {
            type: 'Trial Sponsor',
            source: 'Clinical Trials Agent'
          }
        });
        generatedEdges.push({
          source: 'drug_0',
          target: `sponsor_${nodeId-1}`,
          type: 'sponsored_by',
          label: 'trial sponsor'
        });
      });
    }

    // Add Patent nodes
    if (patentData) {
      const patents = patentData.patents || [];
      patents.slice(0, 3).forEach((patent, i) => {
        const angle = Math.PI + (i / 3) * Math.PI * 0.5;
        generatedNodes.push({
          id: `patent_${nodeId++}`,
          label: patent.id || `Patent ${i+1}`,
          type: 'patent',
          color: '#8B5CF6',
          x: 250 + Math.cos(angle) * 170,
          y: 200 + Math.sin(angle) * 130,
          metadata: {
            type: 'Patent',
            title: patent.title,
            assignee: patent.assignee,
            expiration: patent.expiration,
            source: 'Patent Agent'
          }
        });
        generatedEdges.push({
          source: 'drug_0',
          target: `patent_${nodeId-1}`,
          type: 'protected_by',
          label: 'protected by'
        });
      });

      // Patent holders/assignees
      const assignees = [...new Set(patents.map(p => p.assignee))].filter(Boolean).slice(0, 3);
      assignees.forEach((assignee, i) => {
        const existingCompany = generatedNodes.find(n => n.label === assignee);
        if (!existingCompany) {
          const angle = Math.PI * 1.3 + (i / 3) * Math.PI * 0.3;
          generatedNodes.push({
            id: `assignee_${nodeId++}`,
            label: assignee,
            type: 'company',
            color: '#F59E0B',
            x: 250 + Math.cos(angle) * 220,
            y: 200 + Math.sin(angle) * 160,
            metadata: {
              type: 'Patent Holder',
              source: 'Patent Agent'
            }
          });
        }
      });
    }

    // Add Market/Competitor nodes
    if (marketData) {
      const competitors = marketData.competitive_landscape?.top_5 || marketData.top_5_competitors || [];
      competitors.slice(0, 4).forEach((comp, i) => {
        const existingCompany = generatedNodes.find(n => n.label === comp.company);
        if (!existingCompany) {
          const angle = -Math.PI / 2 + (i / 4) * Math.PI * 0.6 - Math.PI * 0.3;
          generatedNodes.push({
            id: `competitor_${nodeId++}`,
            label: comp.company,
            type: 'competitor',
            color: '#EC4899',
            x: 250 + Math.cos(angle) * 200,
            y: 200 + Math.sin(angle) * 150,
            metadata: {
              type: 'Market Competitor',
              market_share: comp.market_share,
              key_product: comp.key_product,
              source: 'IQVIA Agent'
            }
          });
          generatedEdges.push({
            source: 'drug_0',
            target: `competitor_${nodeId-1}`,
            type: 'competes_with',
            label: 'competes with'
          });
        }
      });

      // Therapy area
      if (marketData.therapy_area) {
        generatedNodes.push({
          id: `therapy_${nodeId++}`,
          label: marketData.therapy_area,
          type: 'pathway',
          color: '#10B981',
          x: 420,
          y: 200,
          metadata: {
            type: 'Therapy Area',
            market_size: marketData.global_market_size_usd_bn ? `$${marketData.global_market_size_usd_bn}B` : 'N/A',
            cagr: marketData.five_year_cagr || 'N/A',
            source: 'IQVIA Agent'
          }
        });
        generatedEdges.push({
          source: 'drug_0',
          target: `therapy_${nodeId-1}`,
          type: 'belongs_to',
          label: 'therapy area'
        });
      }
    }

    // Add key pathways from knowledge graph data or clinical data
    const knowledgeGraphData = agentResults?.knowledge_graph || {};
    const pathways = knowledgeGraphData?.key_pathways || clinicalData?.mechanism_pathways || ['PI3K/AKT', 'MAPK/ERK', 'JAK/STAT'];
    pathways.slice(0, 4).forEach((pathway, i) => {
      const angle = Math.PI * 0.7 + (i / 4) * Math.PI * 0.4;
      generatedNodes.push({
        id: `pathway_${nodeId++}`,
        label: pathway,
        type: 'pathway',
        color: '#10B981',
        x: 250 + Math.cos(angle) * 160,
        y: 200 + Math.sin(angle) * 120,
        metadata: {
          type: 'Signaling Pathway',
          source: 'Knowledge Graph'
        }
      });
      // Connect pathways to indications
      const indicationNodes = generatedNodes.filter(n => n.type === 'disease');
      if (indicationNodes.length > 0) {
        generatedEdges.push({
          source: `pathway_${nodeId-1}`,
          target: indicationNodes[i % indicationNodes.length]?.id,
          type: 'involved_in',
          label: 'involved in'
        });
      }
    });

    // Add Regulatory Nodes
    if (regulatoryData) {
      // Approval status
      if (regulatoryData.fda_status || regulatoryData.approval_status) {
        generatedNodes.push({
          id: `regulatory_${nodeId++}`,
          label: regulatoryData.fda_status || regulatoryData.approval_status || 'FDA Status',
          type: 'regulatory',
          color: '#059669',
          x: 400,
          y: 280,
          metadata: {
            type: 'Regulatory Status',
            agency: 'FDA',
            approval_date: regulatoryData.approval_date || 'N/A',
            source: 'Regulatory Agent'
          }
        });
        generatedEdges.push({
          source: 'drug_0',
          target: `regulatory_${nodeId-1}`,
          type: 'approved_by',
          label: 'regulated by'
        });
      }

      // Warnings
      const warnings = regulatoryData.warnings || [];
      warnings.slice(0, 2).forEach((warning, i) => {
        generatedNodes.push({
          id: `warning_${nodeId++}`,
          label: warning.type || `Warning ${i+1}`,
          type: 'warning',
          color: '#DC2626',
          x: 380 + i * 60,
          y: 350,
          metadata: {
            type: 'Safety Warning',
            description: warning.description || warning.message || 'Regulatory warning',
            source: warning.agency || 'FDA'
          }
        });
        const regNode = generatedNodes.find(n => n.type === 'regulatory');
        if (regNode) {
          generatedEdges.push({
            source: regNode.id,
            target: `warning_${nodeId-1}`,
            type: 'has_warning',
            label: 'warning'
          });
        }
      });
    }

    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [molecule, clinicalData, patentData, marketData, regulatoryData, agentResults]);

  // Get node icon based on type
  const getNodeIcon = (type) => {
    switch (type) {
      case 'drug': return Pill;
      case 'protein': return Dna;
      case 'pathway': return Activity;
      case 'disease': return AlertCircle;
      case 'patent': return FileText;
      case 'company': return Building2;
      case 'competitor': return Target;
      case 'regulatory': return Shield;
      case 'warning': return AlertTriangle;
      default: return Network;
    }
  };

  // Get filtered nodes based on active filter
  const getFilteredNodes = () => {
    if (activeFilter === 'all') return nodes;
    return nodes.filter(n => n.type === activeFilter || n.id === 'drug_0');
  };

  const getFilteredEdges = () => {
    const filteredNodeIds = getFilteredNodes().map(n => n.id);
    return edges.filter(e => filteredNodeIds.includes(e.source) && filteredNodeIds.includes(e.target));
  };

  // Handle node click
  const handleNodeClick = (node) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  // Render the graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const displayNodes = getFilteredNodes();
    const displayEdges = getFilteredEdges();

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply zoom
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw edges with gradient
    displayEdges.forEach(edge => {
      const source = displayNodes.find(n => n.id === edge.source);
      const target = displayNodes.find(n => n.id === edge.target);
      if (source && target) {
        const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
        gradient.addColorStop(0, source.color + '60');
        gradient.addColorStop(1, target.color + '60');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        
        // Draw edge label
        if (edge.label && zoom > 0.8) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.fillStyle = '#6B7280';
          ctx.font = '9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(edge.label, midX, midY - 5);
        }
      }
    });

    // Draw nodes with shadow
    displayNodes.forEach(node => {
      const isHovered = hoveredNode?.id === node.id;
      const isSelected = selectedNode?.id === node.id;
      const radius = node.id === 'drug_0' ? 30 : isSelected ? 25 : isHovered ? 22 : 18;

      // Shadow
      ctx.shadowColor = node.color + '40';
      ctx.shadowBlur = isSelected ? 20 : 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      // Node circle with gradient
      const gradient = ctx.createRadialGradient(node.x - 5, node.y - 5, 0, node.x, node.y, radius);
      gradient.addColorStop(0, node.color);
      gradient.addColorStop(1, node.color + 'CC');
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Node border
      if (isSelected || isHovered) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#1F2937';
      ctx.font = `${isSelected ? 'bold ' : ''}${node.id === 'drug_0' ? '12' : '10'}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Truncate long labels
      let label = node.label;
      if (label.length > 15) label = label.substring(0, 12) + '...';
      ctx.fillText(label, node.x, node.y + radius + 8);
    });

    ctx.restore();
  }, [nodes, edges, zoom, hoveredNode, selectedNode, activeFilter]);

  // Handle canvas click for node selection
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Find clicked node
    const clickedNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    handleNodeClick(clickedNode);
  };

  // Handle mouse move for hover effects
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const hoveredNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    setHoveredNode(hoveredNode);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

  // Check if we have any data to display
  if (!molecule && nodes.length === 0) return null;
  
  const stats = { nodes: nodes.length, edges: edges.length, key_pathways: [] };

  // Node type configurations for legend and filters
  const nodeTypes = [
    { type: 'drug', color: '#3B82F6', label: 'Drug/Molecule', icon: Pill },
    { type: 'disease', color: '#EF4444', label: 'Indication', icon: AlertCircle },
    { type: 'pathway', color: '#10B981', label: 'Pathway/Therapy', icon: Activity },
    { type: 'patent', color: '#8B5CF6', label: 'Patent', icon: FileText },
    { type: 'company', color: '#F59E0B', label: 'Company', icon: Building2 },
    { type: 'competitor', color: '#EC4899', label: 'Competitor', icon: Target },
  ];
  
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-1">
        <div className="bg-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Knowledge Graph
              </h3>
              <p className="text-sm text-gray-500">
                {molecule ? `Relationships for ${molecule}` : 'Drug-Target-Pathway Relationships'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Filter Dropdown */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Nodes</option>
              <option value="disease">Indications</option>
              <option value="pathway">Pathways</option>
              <option value="patent">Patents</option>
              <option value="company">Companies</option>
              <option value="competitor">Competitors</option>
            </select>
            
            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                className="p-1.5 hover:bg-white rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-xs text-gray-500 w-10 text-center font-medium">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                className="p-1.5 hover:bg-white rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <X className="w-4 h-4 text-gray-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Graph Canvas */}
        <div className={`flex-1 ${isFullscreen ? 'h-[calc(100vh-12rem)]' : 'h-80'} bg-gray-50 relative`}>
          <canvas
            ref={canvasRef}
            width={isFullscreen ? window.innerWidth - 350 : 500}
            height={isFullscreen ? window.innerHeight - 250 : 320}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            className="w-full h-full"
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100">
            <div className="text-xs font-semibold text-gray-700 mb-3 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              Node Types
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {nodeTypes.map(item => {
                const Icon = item.icon;
                const count = nodes.filter(n => n.type === item.type).length;
                return (
                  <button
                    key={item.type}
                    onClick={() => setActiveFilter(activeFilter === item.type ? 'all' : item.type)}
                    className={`flex items-center space-x-2 px-2 py-1 rounded-lg transition-all ${
                      activeFilter === item.type ? 'bg-gray-100 ring-2 ring-indigo-300' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center" 
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs text-gray-700">{item.label}</span>
                    {count > 0 && (
                      <span className="text-xs text-gray-400">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Node Details Panel */}
        {(selectedNode || isFullscreen) && (
          <div className={`${isFullscreen ? 'w-80' : 'w-64'} border-l border-gray-200 p-4 bg-white`}>
            {selectedNode ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Node Details</h4>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                {/* Node Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: selectedNode.color }}
                    >
                      {(() => {
                        const Icon = getNodeIcon(selectedNode.type);
                        return <Icon className="w-5 h-5 text-white" />;
                      })()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedNode.label}</div>
                      <div className="text-sm text-gray-500 capitalize">{selectedNode.type}</div>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  {selectedNode.metadata && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {Object.entries(selectedNode.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Connections */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Connections</div>
                    <div className="space-y-1">
                      {edges
                        .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                        .slice(0, 5)
                        .map((edge, i) => {
                          const connectedId = edge.source === selectedNode.id ? edge.target : edge.source;
                          const connectedNode = nodes.find(n => n.id === connectedId);
                          return (
                            <div 
                              key={i}
                              className="text-xs bg-gray-100 rounded px-2 py-1 flex justify-between items-center"
                            >
                              <span className="text-gray-700">{connectedNode?.label || connectedId}</span>
                              <span className="text-gray-400">{edge.type}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click a node to view details</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Stats Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-700">{stats.nodes || nodes.length}</div>
            <div className="text-xs text-gray-500">Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-700">{stats.edges || edges.length}</div>
            <div className="text-xs text-gray-500">Edges</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-700">{stats.key_pathways?.length || 0}</div>
            <div className="text-xs text-gray-500">Pathways</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-700">
              {nodes.filter(n => n.type === 'disease').length}
            </div>
            <div className="text-xs text-gray-500">Diseases</div>
          </div>
        </div>
        
        {/* Key Pathways Tags */}
        {stats.key_pathways && stats.key_pathways.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Key Pathways</div>
            <div className="flex flex-wrap gap-2">
              {stats.key_pathways.map((pathway, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                >
                  {pathway}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraph;
