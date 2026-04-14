import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Icon } from '../../components/Icon/Icon';
import { CloseIcon } from '../../components/Icon/CloseIcon';
import { Button } from '../../components/Button/Button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { useAppStore } from '../../store/useAppStore';
import { NodePanel } from './NodePanel';
import { NodeSettings } from './NodeSettings';
import { ChatPanel } from './ChatPanel';
import { ConfigurePanel } from './ConfigurePanel';
import { AnalyticsPanel } from './AnalyticsPanel';
import { ConversationNode, StartNode, EndNode } from './nodes/ConversationNode';
import styles from './AgentCanvas.module.css';

const nodeTypes = {
  conversationNode: ConversationNode,
  startNode: StartNode,
  endNode: EndNode,
};

const BUILDER_TABS = ['Workflow', 'Configure', 'Analytics'];

let nodeIdCounter = 100;
function getNextId() {
  return `n${++nodeIdCounter}`;
}

const MIN_PANEL_WIDTH = 260;
const MAX_PANEL_WIDTH = 480;
const DEFAULT_PANEL_WIDTH = 300;

export function AgentCanvas() {
  const builderAgent = useAppStore(s => s.builderAgent);
  const builderFlow = useAppStore(s => s.builderFlow);
  const builderFlowLoading = useAppStore(s => s.builderFlowLoading);
  const builderSelectedNode = useAppStore(s => s.builderSelectedNode);
  const builderVersions = useAppStore(s => s.builderVersions);
  const setBuilderSelectedNode = useAppStore(s => s.setBuilderSelectedNode);
  const closeBuilder = useAppStore(s => s.closeBuilder);
  const saveFlow = useAppStore(s => s.saveFlow);
  const createFlowVersion = useAppStore(s => s.createFlowVersion);
  const showToast = useAppStore(s => s.showToast);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeTab, setActiveTab] = useState('Workflow');
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const hasUnsavedChanges = useRef(false);
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null);
  const tabsRef = useRef(null);
  const [tabSliderStyle, setTabSliderStyle] = useState({});

  const updateTabSlider = useCallback(() => {
    if (!tabsRef.current) return;
    const activeBtn = tabsRef.current.querySelector('[data-active="true"]');
    if (activeBtn) setTabSliderStyle({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
  }, []);
  useEffect(() => { updateTabSlider(); }, [activeTab, updateTabSlider]);
  useEffect(() => { requestAnimationFrame(updateTabSlider); }, [updateTabSlider]);

  // Load flow data when it arrives
  useEffect(() => {
    if (builderFlow) {
      const flowNodes = (builderFlow.nodes || []).map(n => ({
        ...n,
        data: { ...n.data },
      }));
      setNodes(flowNodes);
      setEdges(builderFlow.edges || []);
      const maxId = flowNodes.reduce((max, n) => {
        const num = parseInt(n.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 100);
      nodeIdCounter = maxId;
    }
  }, [builderFlow?.id]);

  // Sync node data changes from store (e.g. transitions edited in NodeSettings) back to React Flow
  useEffect(() => {
    if (!builderFlow?.nodes) return;
    setNodes(prev => prev.map(n => {
      const storeNode = builderFlow.nodes.find(sn => sn.id === n.id);
      if (storeNode && storeNode.data !== n.data) {
        return { ...n, data: { ...storeNode.data } };
      }
      return n;
    }));
  }, [builderFlow?.nodes]);

  const onConnect = useCallback((params) => {
    hasUnsavedChanges.current = true;
    setEdges(eds => addEdge({
      ...params,
      type: 'smoothstep',
      animated: false,
      style: { stroke: 'var(--neutral-150)', strokeWidth: 1.5 },
    }, eds));
  }, [setEdges]);

  const wrappedOnNodesChange = useCallback((changes) => {
    if (changes.some(c => c.type === 'position' || c.type === 'remove' || c.type === 'add')) {
      hasUnsavedChanges.current = true;
    }
    onNodesChange(changes);
  }, [onNodesChange]);

  const wrappedOnEdgesChange = useCallback((changes) => {
    if (changes.some(c => c.type === 'remove' || c.type === 'add')) {
      hasUnsavedChanges.current = true;
    }
    onEdgesChange(changes);
  }, [onEdgesChange]);

  const onNodeClick = useCallback((_, node) => {
    if (node.type === 'startNode') return;
    setBuilderSelectedNode(node.id);
    // Zoom and center on the clicked node
    reactFlowInstance.current?.fitView({
      nodes: [node],
      padding: 0.5,
      duration: 300,
    });
  }, [setBuilderSelectedNode]);

  const onPaneClick = useCallback(() => {
    setBuilderSelectedNode(null);
  }, [setBuilderSelectedNode]);

  const onInit = useCallback((instance) => {
    reactFlowInstance.current = instance;
    if (builderFlow?.viewport) {
      instance.setViewport(builderFlow.viewport);
    }
  }, [builderFlow?.viewport]);

  // Track zoom
  const onMoveEnd = useCallback((_, viewport) => {
    setZoomLevel(Math.round(viewport.zoom * 100));
  }, []);

  // Drag & Drop support
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/reactflow');
    if (!raw) return;
    const { nodeType, label } = JSON.parse(raw);
    const instance = reactFlowInstance.current;
    if (!instance) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = instance.screenToFlowPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });

    const isEnd = nodeType === 'end';
    const newNode = {
      id: getNextId(),
      type: isEnd ? 'endNode' : 'conversationNode',
      position,
      data: {
        label: label || 'New Node',
        prompt: '',
        nodeType: isEnd ? 'end' : nodeType,
        transitions: [],
        guardrails: '',
      },
    };

    setNodes(nds => [...nds, newNode]);
  }, [setNodes]);

  // ─── Delete selected nodes (Delete / Backspace) ───
  const onKeyDown = useCallback((e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && builderSelectedNode) {
      // Prevent deleting start node
      const node = nodes.find(n => n.id === builderSelectedNode);
      if (node?.type === 'startNode') return;
      // Don't trigger when typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      setNodes(nds => nds.filter(n => n.id !== builderSelectedNode));
      setEdges(eds => eds.filter(e => e.source !== builderSelectedNode && e.target !== builderSelectedNode));
      setBuilderSelectedNode(null);
      showToast('Node deleted');
    }
  }, [builderSelectedNode, nodes, setNodes, setEdges, setBuilderSelectedNode, showToast]);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // ─── Delete node handler (for button click) ───
  const handleDeleteNode = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node?.type === 'startNode') return;
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setBuilderSelectedNode(null);
    showToast('Node deleted');
  }, [nodes, setNodes, setEdges, setBuilderSelectedNode, showToast]);

  // ─── Resizable panel ───
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = panelWidth;

    const onMouseMove = (e) => {
      const diff = startX - e.clientX;
      const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, startWidth + diff));
      setPanelWidth(newWidth);
    };
    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [panelWidth]);

  // Save
  const handleSave = async () => {
    setSaving(true);
    const viewport = reactFlowInstance.current?.getViewport() || { x: 0, y: 0, zoom: 1 };
    await saveFlow(nodes, edges, viewport);
    hasUnsavedChanges.current = false;
    setSaving(false);
    showToast('Flow saved successfully');
  };

  // Close with unsaved changes check
  const handleCloseBuilder = useCallback(() => {
    if (hasUnsavedChanges.current) {
      setShowCloseDialog(true);
    } else {
      closeBuilder();
    }
  }, [closeBuilder]);

  // Save as new version
  const handleSaveVersion = async () => {
    setSaving(true);
    const viewport = reactFlowInstance.current?.getViewport() || { x: 0, y: 0, zoom: 1 };
    const ver = await createFlowVersion(nodes, edges, viewport);
    setSaving(false);
    showToast(`Version ${ver} created`);
    setShowVersions(false);
  };

  // ─── Auto-arrange nodes in execution order ───
  const handleAutoArrange = useCallback(() => {
    if (!nodes.length) return;

    // Build adjacency list from edges
    const adj = {};
    const inDegree = {};
    nodes.forEach(n => { adj[n.id] = []; inDegree[n.id] = 0; });
    edges.forEach(e => {
      if (adj[e.source]) adj[e.source].push(e.target);
      if (inDegree[e.target] !== undefined) inDegree[e.target]++;
    });

    // Topological sort (BFS / Kahn's algorithm)
    const queue = Object.keys(inDegree).filter(id => inDegree[id] === 0);
    const layers = [];
    const visited = new Set();
    while (queue.length) {
      const layerSize = queue.length;
      const layer = [];
      for (let i = 0; i < layerSize; i++) {
        const id = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        layer.push(id);
        for (const next of (adj[id] || [])) {
          inDegree[next]--;
          if (inDegree[next] <= 0 && !visited.has(next)) queue.push(next);
        }
      }
      if (layer.length) layers.push(layer);
    }
    // Add any unvisited nodes to last layer
    const unvisited = nodes.filter(n => !visited.has(n.id)).map(n => n.id);
    if (unvisited.length) layers.push(unvisited);

    // Position: horizontal layers, vertical spread within each layer
    const NODE_W = 260;
    const NODE_H = 180;
    const LAYER_GAP = 320;
    const NODE_GAP = 200;

    const newNodes = nodes.map(n => {
      let layerIdx = layers.findIndex(l => l.includes(n.id));
      if (layerIdx === -1) layerIdx = layers.length;
      const layerNodes = layers[layerIdx] || [n.id];
      const posInLayer = layerNodes.indexOf(n.id);
      const layerHeight = layerNodes.length * NODE_GAP;
      const startY = -(layerHeight / 2) + 300;

      return {
        ...n,
        position: {
          x: layerIdx * LAYER_GAP + 50,
          y: startY + posInLayer * NODE_GAP,
        },
      };
    });

    setNodes(newNodes);
    setTimeout(() => reactFlowInstance.current?.fitView({ padding: 0.3 }), 100);
    showToast('Nodes arranged in execution order');
  }, [nodes, edges, setNodes, showToast]);

  // Apply chat modification to nodes/edges
  const applyFlowUpdate = useCallback((newNodes, newEdges) => {
    if (newNodes) setNodes(newNodes);
    if (newEdges) setEdges(newEdges);
    setTimeout(() => reactFlowInstance.current?.fitView({ padding: 0.3 }), 100);
  }, [setNodes, setEdges]);

  // Selected node object
  const selectedNode = useMemo(() => {
    if (!builderSelectedNode) return null;
    return nodes.find(n => n.id === builderSelectedNode) || null;
  }, [builderSelectedNode, nodes]);

  const showNodeSettings = selectedNode && selectedNode.type !== 'startNode';

  if (!builderAgent) return null;

  return (
    <div className={styles.canvas}>
      {/* Top toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button variant="ghost" size="S" iconOnly leadingIcon="solar:arrow-left-linear" onClick={handleCloseBuilder} title="Back to Agents" />
          <span className={styles.agentName}>{builderAgent.name}</span>
        </div>

        <div className={styles.toolbarCenter}>
          <div className={styles.toolbarTabs} ref={tabsRef}>
            <div className={styles.toolbarSlider} style={tabSliderStyle} />
            {BUILDER_TABS.map(tab => (
              <button
                key={tab}
                data-active={activeTab === tab}
                className={`${styles.toolbarTab} ${activeTab === tab ? styles.toolbarTabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Configure' && <Icon name="solar:settings-linear" size={14} />}
                {tab === 'Analytics' && <Icon name="solar:chart-2-linear" size={14} />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.toolbarRight}>
          <Button variant="secondary" size="L" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <span className={styles.toolbarDivider} />
          <Button variant="ghost" size="L" leadingIcon="solar:play-linear" disabled>
            Run Test
          </Button>
          <Button variant="ghost" size="L" disabled>
            Deploy Agent Now
          </Button>
          <button className={styles.toolbarCloseBtn} onClick={handleCloseBuilder} title="Close">
            <CloseIcon size={18} />
          </button>
        </div>
      </div>

      {/* Main content */}
      {activeTab === 'Configure' ? (
        <ConfigurePanel agent={builderAgent} onSave={handleSave} />
      ) : activeTab === 'Analytics' ? (
        <AnalyticsPanel agent={builderAgent} />
      ) : (
        <div className={styles.body}>
          <NodePanel />

          <div className={styles.flowArea} ref={reactFlowWrapper}>
            {builderFlowLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Loading workflow…</span>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={wrappedOnNodesChange}
                onEdgesChange={wrappedOnEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onInit={onInit}
                onMoveEnd={onMoveEnd}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                deleteKeyCode={null}
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  style: { stroke: 'var(--neutral-150)', strokeWidth: 1.5 },
                }}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.2}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--neutral-100)" />
                <MiniMap
                  className={styles.minimap}
                  maskColor="rgba(26,6,71,.08)"
                  nodeColor={(n) => {
                    if (n.type === 'startNode') return 'var(--status-success)';
                    if (n.type === 'endNode') return 'var(--status-error)';
                    return 'var(--primary-300)';
                  }}
                  nodeStrokeWidth={3}
                  pannable
                  zoomable
                  position="bottom-left"
                  style={{ width: 160, height: 100, marginBottom: 44, marginLeft: 12 }}
                />

                {/* Zoom controls — bottom left, below minimap */}
                <Panel position="bottom-left" className={styles.zoomPanel}>
                  <button className={styles.zoomBtn} onClick={handleAutoArrange} title="Auto-arrange nodes">
                    <Icon name="solar:sort-horizontal-linear" size={14} />
                    Auto-arrange
                  </button>
                  <span className={styles.zoomDivider} />
                  <button className={styles.zoomBtn} onClick={() => reactFlowInstance.current?.fitView({ padding: 0.3 })}>
                    <Icon name="solar:full-screen-linear" size={14} />
                    Fit View
                  </button>
                  <span className={styles.zoomDivider} />
                  <button className={styles.zoomBtn} onClick={() => reactFlowInstance.current?.zoomOut()}>
                    <Icon name="solar:minus-circle-linear" size={14} />
                  </button>
                  <span className={styles.zoomLevel}>{zoomLevel}%</span>
                  <button className={styles.zoomBtn} onClick={() => reactFlowInstance.current?.zoomIn()}>
                    <Icon name="solar:add-circle-linear" size={14} />
                  </button>
                </Panel>

                <Panel position="bottom-right" className={styles.versionPanel}>
                  <div className={styles.versionWrap}>
                    <button className={styles.versionBtn} onClick={() => setShowVersions(!showVersions)}>
                      <Icon name="solar:history-linear" size={14} />
                      v{builderFlow?.version || '1.0'}
                    </button>
                    {showVersions && (
                      <div className={styles.versionDropdown}>
                        <div className={styles.versionDropdownHeader}>
                          <span>Versions</span>
                          <button className={styles.newVersionBtn} onClick={handleSaveVersion}>
                            + New Version
                          </button>
                        </div>
                        {builderVersions.map(v => (
                          <div
                            key={v.id}
                            className={`${styles.versionItem} ${v.is_current ? styles.versionItemActive : ''}`}
                            onClick={() => {
                              if (!v.is_current) {
                                useAppStore.getState().switchFlowVersion(v.id);
                                setShowVersions(false);
                              }
                            }}
                          >
                            <span>v{v.version}</span>
                            <span className={styles.versionDate}>
                              {new Date(v.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                            </span>
                            {v.is_current && <span className={styles.currentBadge}>Current</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Panel>
              </ReactFlow>
            )}
          </div>

          {/* Right panel: resize handle + settings or chat */}
          <div className={styles.rightPanelWrap} style={{ width: panelWidth }}>
            <div
              className={`${styles.resizeHandle} ${isResizing ? styles.resizeHandleActive : ''}`}
              onMouseDown={handleResizeStart}
            />
            {showNodeSettings ? (
              <NodeSettings
                node={selectedNode}
                allNodes={nodes}
                onSave={() => { hasUnsavedChanges.current = true; handleSave(); }}
                onClose={() => setBuilderSelectedNode(null)}
                onDelete={() => handleDeleteNode(selectedNode.id)}
              />
            ) : (
              <ChatPanel
                nodes={nodes}
                edges={edges}
                onApplyFlow={applyFlowUpdate}
                agentName={builderAgent.name}
              />
            )}
          </div>
        </div>
      )}

      {/* Unsaved changes confirmation dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="max-w-[360px] p-0 gap-0 overflow-hidden rounded-lg">
          <DialogTitle className="sr-only">Unsaved Changes</DialogTitle>
          <DialogDescription className="sr-only">You have unsaved changes. Choose to discard or save.</DialogDescription>
          <div style={{ padding: 16, borderBottom: '0.5px solid var(--neutral-150)' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-500)', marginBottom: 8 }}>
              Unsaved Changes
            </div>
            <div style={{ fontSize: 13, color: 'var(--neutral-300)', lineHeight: 1.5 }}>
              You have unsaved changes to this workflow. Would you like to save before leaving?
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 12 }}>
            <Button variant="secondary" size="L" fullWidth style={{ flex: 1, minWidth: 0 }} onClick={() => { setShowCloseDialog(false); closeBuilder(); }}>
              Discard
            </Button>
            <Button variant="primary" size="L" fullWidth style={{ flex: 1, minWidth: 0 }} onClick={async () => { setShowCloseDialog(false); await handleSave(); closeBuilder(); }}>
              Save & Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
