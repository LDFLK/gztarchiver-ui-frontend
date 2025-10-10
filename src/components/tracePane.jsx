import { useEffect, useState, useRef, useCallback } from "react";
import { X, FileText, ZoomIn, ZoomOut, Maximize2, Minimize2, Shrink, CircleAlert } from "lucide-react";

const TracePane = ({ documentId, onClose }) => {
  // --- State Variables ---
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Canvas Dragging State
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Node Dragging State
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });

  // Reference to track if a node was moved during the current mouse down cycle
  const wasNodeDraggedRef = useRef(false); 

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // --- Utility Functions ---

  const calculateCenter = useCallback(() => {
    if (containerRef.current) {
      return {
        x: containerRef.current.clientWidth / 2,
        y: containerRef.current.clientHeight / 2,
      };
    }
    // Fallback if ref isn't ready
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }, []);

  // --- Effects ---

  // Initialize and clean up overflow/fullscreen state
  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    // Recenter the root node if dimensions change (e.g., fullscreen toggle)
    if (nodes.length === 1) {
        const center = calculateCenter();
        setNodes(prev => prev.map(n => n.id === documentId ? { ...n, x: center.x, y: center.y } : n));
        setPan({ x: 0, y: 0 });
        setZoom(1);
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [documentId, calculateCenter]);


  // Fetch initial document and center it
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      setNodes([]);
      setEdges([]);
      setExpandedNodes(new Set());

      try {
        const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
        const response = await fetch(`${apiUrl}/document/${documentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Error fetching document: ${response.statusText}`);
        }

        const document_name = await response.json();
        
        if (!document_name) {
          setError("No data found for this document.");
          return;
        }

        const { x: initialX, y: initialY } = calculateCenter();

        setNodes([{
          id: document_name,
          x: initialX,
          y: initialY,
          data: { id: document_name, title: documentId },
          isRoot: true,
        }]);
      } catch (err) {
        console.error("Failed to fetch initial document:", err);
        setError(`Error: ${err.message}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId, calculateCenter]);

  // --- API Simulation/Integration ---

  const fetchConnectedDocuments = async (nodeId) => {
    try {
      const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
      const response = await fetch(`${apiUrl}/document-rel/${nodeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        // Mock data matching the user's provided structure
        console.warn("API call failed, using mock data for connections.");
        return [
          { "relatedEntityId": `${nodeId}_mock_29`, "name": "AMENDS", "direction": "INCOMING", "document_number": "2161-43" },
          { "relatedEntityId": `${nodeId}_mock_30`, "name": "AMENDS", "direction": "INCOMING", "document_number": "2160-64" },
          { "relatedEntityId": `${nodeId}_mock_32`, "name": "REFERENCES", "direction": "OUTGOING", "document_number": "2159-48" },
          { "relatedEntityId": `${nodeId}_mock_33`, "name": "AFFECTS", "direction": "OUTGOING", "document_number": "9001-A" },
          { "relatedEntityId": `${nodeId}_mock_34`, "name": "AMENDS", "direction": "INCOMING", "document_number": "5432-B" },
        ];
      }

      const data = await response.json();
      return data || [];
    } catch (err) {
      console.error("Failed to fetch connections:", err);
      // Return mock data on error
      return [
        { "relatedEntityId": `${nodeId}_err_29`, "name": "AMENDS", "direction": "INCOMING", "document_number": "0001-E" },
        { "relatedEntityId": `${nodeId}_err_30`, "name": "REFERENCES", "direction": "OUTGOING", "document_number": "0002-R" },
      ];
    }
  };

  // --- Interaction Handlers ---

  const handleNodeClick = async (nodeId) => {
    if (expandedNodes.has(nodeId)) {
      // Collapse only this node's direct expansion
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
  
      setEdges(prevEdges => {
        // Remove edges from this node
        const updatedEdges = prevEdges.filter(e => e.from !== nodeId);
  
        // Find which nodes are now isolated (no edges left)
        const connectedIds = prevEdges.filter(e => e.from === nodeId).map(e => e.to);
        const remainingConnectedNodes = new Set([
          ...updatedEdges.map(e => e.from),
          ...updatedEdges.map(e => e.to)
        ]);
  
        // Remove only the nodes that are not used anywhere else
        setNodes(prevNodes =>
          prevNodes.filter(n => remainingConnectedNodes.has(n.id) || n.isRoot)
        );
  
        return updatedEdges;
      });
  
      return;
    }
  
    // Expand node
    setExpandedNodes(prev => new Set([...prev, nodeId]));
  
    const connectedDocs = await fetchConnectedDocuments(nodeId);
    const clickedNode = nodes.find(n => n.id === nodeId);
    if (!clickedNode || !connectedDocs?.length) return;
  
    const radius = 250;
    const angleStep = (2 * Math.PI) / connectedDocs.length;
  
    const newNodes = [];
    const newEdges = [];
  
    connectedDocs.forEach((doc, index) => {
      const newNodeId = doc.relatedEntityId;
      const displayTitle = doc.document_number || newNodeId;
  
      const existingNode = nodes.find(n => n.id === newNodeId);
      const angle = index * angleStep;
  
      if (!existingNode) {
        const newNode = {
          id: newNodeId,
          x: clickedNode.x + radius * Math.cos(angle),
          y: clickedNode.y + radius * Math.sin(angle),
          data: { id: newNodeId, title: displayTitle },
        };
        newNodes.push(newNode);
      }
  
      newEdges.push({ from: nodeId, to: newNodeId });
    });
  
    // Merge unique nodes and edges
    setNodes(prev => [
      ...prev,
      ...newNodes.filter(n => !prev.some(p => p.id === n.id)),
    ]);
  
    setEdges(prev => [
      ...prev,
      ...newEdges.filter(
        e => !prev.some(p => p.from === e.from && p.to === e.to)
      ),
    ]);
  };
  
  
  
  const handleNodeMouseUp = (e, nodeId) => {
    e.stopPropagation();
  
    // 🛑 Prevent clicking the root "gov_01" node
    if (nodeId === "gov_01") {
      console.log('action blocked')
      wasNodeDraggedRef.current = false;
      setDraggedNodeId(null);
      return; // Block click expansion
    }
  
    if (!wasNodeDraggedRef.current) {
      handleNodeClick(nodeId);
    }
  
    wasNodeDraggedRef.current = false;
    setDraggedNodeId(null);
  };
  

  // --- Zoom and View Handlers ---

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    // Optional: Recenter the root node to the canvas center on reset
    if (nodes.length > 0) {
        const rootNode = nodes.find(n => n.isRoot);
        if (rootNode) {
            const { x: newX, y: newY } = calculateCenter();
            setNodes(prev => prev.map(n => n.id === rootNode.id ? { ...n, x: newX, y: newY } : n));
        }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // --- Dragging Handlers (Canvas and Node) ---

  const handleNodeDragStart = (e, nodeId, nodeX, nodeY) => {
      e.stopPropagation(); // Prevent canvas drag from starting
      setIsDraggingCanvas(false);
      setDraggedNodeId(nodeId);
      wasNodeDraggedRef.current = false; // Reset the drag movement flag

      // Calculate the offset between mouse position and node center, relative to current view
      const mouseX = (e.clientX - pan.x) / zoom;
      const mouseY = (e.clientY - pan.y) / zoom;
      
      setNodeDragOffset({
          x: mouseX - nodeX,
          y: mouseY - nodeY,
      });
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target.closest('.node-draggable')) return; // Ignore if clicking a node
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const DRAG_THRESHOLD = 5; // Pixels to define a drag vs a click

  const handleMouseMove = (e) => {
    if (draggedNodeId) {
        // Handle node drag
        const mouseX = (e.clientX - pan.x) / zoom;
        const mouseY = (e.clientY - pan.y) / zoom;
        
        const newX = mouseX - nodeDragOffset.x;
        const newY = mouseY - nodeDragOffset.y;

        // Check if movement exceeds threshold to mark it as a drag
        const oldNode = nodes.find(n => n.id === draggedNodeId);
        if (oldNode && (Math.abs(oldNode.x - newX) > DRAG_THRESHOLD || Math.abs(oldNode.y - newY) > DRAG_THRESHOLD)) {
            wasNodeDraggedRef.current = true;
        }

        setNodes(prevNodes => prevNodes.map(node => {
            if (node.id === draggedNodeId) {
                // Apply the new position relative to the drag offset
                return {
                    ...node,
                    x: newX,
                    y: newY,
                };
            }
            return node;
        }));
    } else if (isDraggingCanvas) {
        // Handle canvas pan
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    // Note: Node drag end is handled by handleNodeMouseUp
    // If canvas mouse up fires while a node was being dragged, the node's mouseUp handles the reset.
    if (draggedNodeId) {
        // If the node drag finished outside the node area (e.g., canvas area), reset it here.
        setDraggedNodeId(null);
        wasNodeDraggedRef.current = false;
    }
  };

  // --- Render ---

  // Define node dimensions for line calculation
  const NODE_WIDTH = 160;
  const NODE_HEIGHT = 80;
  const NODE_VISUAL_RADIUS = Math.min(NODE_WIDTH, NODE_HEIGHT) / 2; // ~40

  const NodeComponent = ({ node, isExpanded, onNodeClick, onDragStart, onMouseUp }) => (
    <div
        key={node.id}
        className="node node-draggable absolute transition-shadow duration-100"
        style={{
          left: node.x - NODE_WIDTH / 2, // Center the node div
          top: node.y - NODE_HEIGHT / 2, // Center the node div
          width: NODE_WIDTH
        }}
        onMouseDown={(e) => onDragStart(e, node.id, node.x, node.y)}
        // NEW: Attach onMouseUp to the node component for reliable click detection
        onMouseUp={(e) => onMouseUp(e, node.id)} 
    >
      <div
        className={`
          bg-white rounded-xl border-2 p-3 shadow-lg cursor-pointer transition-all hover:shadow-xl 
          ${node.isRoot ? 'border-cyan-500 hover:scale-[1.03]' : 'border-gray-300 hover:scale-[1.03]'}
          ${isExpanded ? 'ring-2 ring-blue-300 scale-[1.03]' : ''}
          ${draggedNodeId === node.id ? 'z-10 shadow-2xl scale-[1.05]' : ''}
        `}
      >
        <div className="flex items-start gap-2">
          <FileText className={`w-5 h-5 flex-shrink-0 ${
            node.isRoot ? 'text-cyan-500' : 'text-cyan-500'
          }`} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-cyan-700 truncate">
              {node.data.title}
            </div>
            <div className="text-xs text-gray-500 truncate">
              ID: {node.data.id.substring(0, 15)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        className={`fixed ${isFullscreen ? 'inset-0' : 'right-0 top-0 h-full w-full sm:w-2/3'} bg-white shadow-2xl z-50 animate-slideIn flex flex-col`}
        ref={containerRef}
      >
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
          <h2 className="text-lg font-thin text-gray-900">Document Journey</h2>
          <p className="text-sm text-gray-500 font-light">Click documents to see how they connected</p>
          </div>
          <div className="flex items-center gap-2">
          <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-600 hover:cursor-pointer transition-colors duration-200"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
            </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-600 transition-colors"
            aria-label="Close panel"
          >
            <X className="w-6 h-6" />
          </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden" onMouseLeave={handleMouseUp}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <CircleAlert className="w-5 h-5 font-thin me-2"/>
              <p className="text-lg font-thin text-gray-500">{error}</p>
            </div>
          ) : (
            <div
              className={`absolute inset-0 ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                backgroundSize: '25px 25px'
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {edges.map((edge, i) => {
                    const fromNode = nodes.find(n => n.id === edge.from);
                    const toNode = nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    // Calculate direction vector
                    const dx = toNode.x - fromNode.x;
                    const dy = toNode.y - fromNode.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    
                    if (length === 0) return null;

                    // Calculate point where the line should end (short of the target node center)
                    const endX = toNode.x - (dx / length) * NODE_VISUAL_RADIUS; 
                    const endY = toNode.y - (dy / length) * NODE_VISUAL_RADIUS;

                    return (
                      <g key={i}>
                        {/* Straight Line */}
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={endX}
                          y2={endY}
                          stroke="#9E9E9E" 
                          strokeWidth="2.5"
                        />
                        {/* Dot Marker (Circle) */}
                        <circle
                          cx={endX}
                          cy={endY}
                          r="4"
                          fill="#9E9E9E" 
                        />
                      </g>
                    );
                  })}
                </g>
              </svg>

              <div
                className="absolute"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0'
                }}
              >
                {nodes.map((node) => (
                  <NodeComponent
                    key={node.id}
                    node={node}
                    isExpanded={expandedNodes.has(node.id)}
                    onNodeClick={handleNodeClick}
                    onDragStart={handleNodeDragStart}
                    onMouseUp={handleNodeMouseUp} // Passing the new mouse up handler
                  />
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset View"
            >
              <Shrink className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 text-sm font-thin text-gray-600 flex justify-between">
          <span>
            <span className="font-light text-gray-900">{nodes.length}</span> document{nodes.length !== 1 ? 's' : ''} • 
            <span className="font-light ml-1 text-gray-900">{edges.length}</span> connection{edges.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-gray-400">Drag nodes or background to interact</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default TracePane;

