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
import { useAppStore } from '../../store/useAppStore';
import { NodePanel } from './NodePanel';
import { NodeSettings } from './NodeSettings';
import { ChatPanel } from './ChatPanel';
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
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null);

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

  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge({
      ...params,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#D0D6E1', strokeWidth: 1.5 },
    }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((_, node) => {
    if (node.type === 'startNode') return; // Start is never selectable
    setBuilderSelectedNode(node.id);
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
    setSaving(false);
    showToast('Flow saved successfully');
  };

  // Save as new version
  const handleSaveVersion = async () => {
    setSaving(true);
    const viewport = reactFlowInstance.current?.getViewport() || { x: 0, y: 0, zoom: 1 };
    const ver = await createFlowVersion(nodes, edges, viewport);
    setSaving(false);
    showToast(`Version ${ver} created`);
    setShowVersions(false);
  };

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
          <button className={styles.backBtn} onClick={closeBuilder} title="Back to Agents">
            <Icon name="solar:arrow-left-linear" size={16} color="#3A485F" />
          </button>
          <span className={styles.agentName}>{builderAgent.name}</span>
        </div>

        <div className={styles.toolbarTabs}>
          {BUILDER_TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.toolbarTab} ${activeTab === tab ? styles.toolbarTabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Configure' && <Icon name="solar:settings-linear" size={14} />}
              {tab === 'Analytics' && <Icon name="solar:chart-2-linear" size={14} />}
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.toolbarRight}>
          <button className={styles.toolbarSaveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <span className={styles.toolbarDivider} />
          <button className={styles.toolbarSecondaryBtn} disabled>
            <Icon name="solar:play-linear" size={14} />
            Run Test
          </button>
          <button className={styles.toolbarSecondaryBtn} disabled>
            Deploy Agent Now
          </button>
          <button className={styles.toolbarCloseBtn} onClick={closeBuilder} title="Close">
            <Icon name="solar:close-cross-linear" size={18} color="#6F7A90" />
          </button>
        </div>
      </div>

      {/* Main content */}
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
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
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
                style: { stroke: '#D0D6E1', strokeWidth: 1.5 },
              }}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.2}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E9ECF1" />
              <MiniMap
                className={styles.minimap}
                maskColor="rgba(26,6,71,.08)"
                nodeColor={(n) => {
                  if (n.type === 'startNode') return '#009B53';
                  if (n.type === 'endNode') return '#D72825';
                  return '#8C5AE2';
                }}
                nodeStrokeWidth={3}
                pannable
                zoomable
                position="bottom-left"
                style={{ width: 160, height: 100, marginBottom: 44, marginLeft: 12 }}
              />

              {/* Zoom controls — bottom left, below minimap */}
              <Panel position="bottom-left" className={styles.zoomPanel}>
                <button className={styles.zoomBtn} onClick={() => reactFlowInstance.current?.fitView({ padding: 0.3 })}>
                  <Icon name="solar:full-screen-linear" size={14} />
                  Actual Size
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
                            {new Date(v.created_at).toLocaleDateString()}
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
              onSave={handleSave}
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
    </div>
  );
}
