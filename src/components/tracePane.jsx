import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  X,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Shrink,
  CircleAlert,
  ScanEye,
  Info,
  Building2,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { getReadableRelationshipName } from "../utils/relationshipUtils";
import { useTheme } from "../context/ThemeContext";

const TracePane = ({ documentId, onClose, onNodeSelect, onExpandingChange }) => {
  // --- Theme Context ---
  const { isDark } = useTheme();

  // --- State Variables ---
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isExpanding, setIsExpanding] = useState(false);
  const [isFetchingNodeData, setIsFetchingNodeData] = useState(false); // Loading state for single click fetch
  const [isIsolationMode, setIsIsolationMode] = useState(false);
  const [relationshipFilter, setRelationshipFilter] = useState("ALL");

  // Cache for fetched node connections to avoid duplicate API calls
  const nodeConnectionsCache = useRef(new Map());

  // Canvas Dragging State
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Node Dragging State
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });

  // Reference to track if a node was moved during the current mouse down cycle
  const wasNodeDraggedRef = useRef(false);
  const clickTimeoutRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // --- Relationship Type Configuration ---
  const relationshipConfig = {
    AS_DOCUMENT: {
      allias: "Published by Government",
      color: "#06B6D4", // Cyan (dark theme)
      colorLight: "#22D3EE", // Lighter cyan-400 for light theme
      textColor: "#0E7490",
      bgColor: "bg-cyan-50",
      angle: 0, // Right (0 degrees)
      angleRange: [-30, 30], // Wider spread
    },
    AMENDS: {
      allias: "Amends",
      color: "#14B8A6", // Teal (dark theme)
      colorLight: "#2DD4BF", // Lighter teal-400 for light theme
      textColor: "#0F766E",
      bgColor: "bg-teal-50",
      angle: 90, // Top
      angleRange: [60, 120],
    },
    REFERS_TO: {
      allias: "Refers To",
      color: "#6366F1", // Indigo (dark theme)
      colorLight: "#818CF8", // Lighter indigo-400 for light theme
      textColor: "#4338CA",
      bgColor: "bg-indigo-50",
      angle: 180, // Left
      angleRange: [150, 210],
    },
  };

  const getRelationshipStyle = (relationshipType) => {
    // Default configuration for unknown relationship types
    const defaultConfig = {
      allias: relationshipType || "Unknown",
      color: "#8B5CF6", // Purple as default (dark theme)
      colorLight: "#A78BFA", // Lighter violet-400 for light theme
      textColor: "#6D28D9",
      bgColor: "bg-purple-50",
      angle: 45, // Default angle
      angleRange: [15, 75], // Default range
    };
    const config = relationshipConfig[relationshipType] || defaultConfig;
    // Return the appropriate color based on theme
    return {
      ...config,
      color: isDark ? config.color : config.colorLight,
    };
  };

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

  // Function to smoothly animate pan to center a node
  const centerNodeWithAnimation = useCallback(
    (nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node || !containerRef.current) return;

      const center = calculateCenter();

      // Calculate the required pan to center this node
      const targetPanX = center.x - node.x * zoom;
      const targetPanY = center.y - node.y * zoom;

      // Animate the pan
      const startPanX = pan.x;
      const startPanY = pan.y;
      const duration = 500; // ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const currentPanX = startPanX + (targetPanX - startPanX) * easeProgress;
        const currentPanY = startPanY + (targetPanY - startPanY) * easeProgress;

        setPan({ x: currentPanX, y: currentPanY });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    },
    [nodes, zoom, pan.x, pan.y, calculateCenter]
  );

  // --- Effects ---

  // Initialize and clean up overflow/fullscreen state
  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Recenter the root node if dimensions change (e.g., fullscreen toggle)
    if (nodes.length === 1) {
      const center = calculateCenter();
      setNodes((prev) =>
        prev.map((n) =>
          n.id === documentId ? { ...n, x: center.x, y: center.y } : n
        )
      );
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

      // Reset isolation mode on new document load
      setIsIsolationMode(false);
      
      // Clear cache when document changes to avoid stale data
      nodeConnectionsCache.current.clear();

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

        setNodes([
          {
            id: document_name,
            x: initialX,
            y: initialY,
            data: { id: document_name, title: documentId },
            isRoot: true,
          },
        ]);
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

  // Notify parent component when any loading state changes (single click fetch or expansion)
  useEffect(() => {
    if (onExpandingChange) {
      // Show loading if either expanding or fetching node data for single click
      onExpandingChange(isExpanding || isFetchingNodeData);
    }
  }, [isExpanding, isFetchingNodeData, onExpandingChange]);

  // --- API Simulation/Integration ---

  const fetchConnectedDocuments = async (nodeId) => {
    // ... (fetchConnectedDocuments remains the same)
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
          {
            relatedEntityId: `${nodeId}_mock_29`,
            name: "AMENDS",
            direction: "INCOMING",
            document_number: "2161-43",
          },
          {
            relatedEntityId: `${nodeId}_mock_30`,
            name: "AMENDS",
            direction: "INCOMING",
            document_number: "2160-64",
          },
          {
            relatedEntityId: `${nodeId}_mock_32`,
            name: "REFERS_TO",
            direction: "OUTGOING",
            document_number: "2159-48",
          },
          {
            relatedEntityId: `${nodeId}_mock_33`,
            name: "AFFECTS",
            direction: "OUTGOING",
            document_number: "9001-A",
          },
          {
            relatedEntityId: `${nodeId}_mock_34`,
            name: "AMENDS",
            direction: "INCOMING",
            document_number: "5432-B",
          },
        ];
      }

      const data = await response.json();
      return data || [];
    } catch (err) {
      console.error("Failed to fetch connections:", err);
      // Return mock data on error
      return [
        {
          relatedEntityId: `${nodeId}_err_29`,
          name: "AMENDS",
          direction: "INCOMING",
          document_number: "0001-E",
        },
        {
          relatedEntityId: `${nodeId}_err_30`,
          name: "REFERENCES",
          direction: "OUTGOING",
          document_number: "0002-R",
        },
      ];
    }
  };

  // --- Interaction Handlers ---

  const handleNodeClick = async (nodeId) => {
    const clickedNode = nodes.find((n) => n.id === nodeId);

    // 2. Always set this node as selected and center it
    setSelectedNodeId(nodeId);
    centerNodeWithAnimation(nodeId);

    // Check if collapsing first
    if (expandedNodes.has(nodeId)) {
      // ✅ Collapse this node:
      //   - If it's the root: remove all descendants + edges.
      //   - Otherwise: remove only outgoing edges, keep nodes.

      const collectDescendants = (currentId, allEdges, visited = new Set()) => {
        if (visited.has(currentId)) return new Set();
        visited.add(currentId);

        const directChildren = allEdges
          .filter((e) => e.from === currentId)
          .map((e) => e.to);

        const allDescendants = new Set(directChildren);
        for (const child of directChildren) {
          const childDesc = collectDescendants(child, allEdges, visited);
          childDesc.forEach((d) => allDescendants.add(d));
        }

        return allDescendants;
      };

      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });

      setEdges((prevEdges) => {
        let updatedEdges;

        if (nodes.find((n) => n.id === nodeId)?.isRoot) {
          // 🧩 Case 1: Collapsing root → remove everything connected to it
          const descendants = collectDescendants(nodeId, prevEdges);
          updatedEdges = prevEdges.filter(
            (e) =>
              !descendants.has(e.from) &&
              !descendants.has(e.to) &&
              e.from !== nodeId &&
              e.to !== nodeId
          );

          // Clean up isolated nodes (only root remains)
          const remainingConnectedIds = new Set(
            updatedEdges.flatMap((e) => [e.from, e.to])
          );

          setNodes((prevNodes) =>
            prevNodes.filter(
              (n) => remainingConnectedIds.has(n.id) || n.isRoot === true
            )
          );
        } else {
          // 🧩 Case 2: Collapsing a child → remove only its outgoing edges
          updatedEdges = prevEdges.filter((e) => e.from !== nodeId);

          // 🧠 Optional cleanup: remove nodes that became isolated
          const remainingConnectedIds = new Set(
            updatedEdges.flatMap((e) => [e.from, e.to])
          );
          setNodes((prevNodes) =>
            prevNodes.filter(
              (n) => remainingConnectedIds.has(n.id) || n.isRoot === true
            )
          );
        }

        return updatedEdges;
      });

      if (isIsolationMode && selectedNodeId === nodeId) {
        setIsIsolationMode(false);
      }

      return;
    }

    // ----------------------------------------------------
    // 4. Expansion Logic Starts - ACTIVATE LOADING STATE HERE
    // ----------------------------------------------------
    setIsExpanding(true); // <-- START LOADING/DIMMING STATE

    // Check cache first - if data was already fetched on single click, reuse it
    let connectedDocs = nodeConnectionsCache.current.get(nodeId);
    
    if (!connectedDocs) {
      // Data not cached, fetch it
      connectedDocs = await fetchConnectedDocuments(nodeId);
      // Cache the result for future use
      nodeConnectionsCache.current.set(nodeId, connectedDocs || []);
    }

    // Update info pane with fetched data
    if (onNodeSelect && clickedNode) {
      onNodeSelect({
        node: clickedNode,
        connections: connectedDocs || [],
      });
    }

    // Expand node (Mark it as expanded regardless of connections)
    setExpandedNodes((prev) => new Set([...prev, nodeId]));

    // 6. If no documents found, stop the process and clear loading
    if (!clickedNode || !connectedDocs?.length) {
      setIsExpanding(false); // <-- STOP LOADING IMMEDIATELY
      return;
    }

    const baseRadius = 400; // Increased radius for better circular spread with round nodes

    // Process all connections first, then update state atomically
    setNodes((prevNodes) => {
      // Group documents by relationship type
      const groupedByType = connectedDocs.reduce((acc, doc) => {
        const type = doc.name || "DEFAULT";
        if (!acc[type]) acc[type] = [];
        acc[type].push(doc);
        return acc;
      }, {});

      const newNodes = [];
      const newEdges = [];
      // Track node IDs we've already added in this expansion to prevent duplicates
      const addedNodeIds = new Set();

      // Get current node position (might have been updated)
      const currentNode = prevNodes.find((n) => n.id === nodeId) || clickedNode;

      // Position nodes based on their relationship type
      Object.entries(groupedByType).forEach(([relType, docs]) => {
        const relStyle = getRelationshipStyle(relType);
        const baseAngle = relStyle.angle * (Math.PI / 180); // Convert to radians
        const [minAngle, maxAngle] = relStyle.angleRange.map(
          (a) => a * (Math.PI / 180)
        );

        docs.forEach((doc, index) => {
          const newNodeId = doc.relatedEntityId;
          const displayTitle = doc.document_number || newNodeId;
          
          // Check if node exists in previous state OR if we've already added it in this batch
          const existingNode = prevNodes.find((n) => n.id === newNodeId);
          const alreadyAdded = addedNodeIds.has(newNodeId);

          // Calculate angle within the range for this relationship type
          let angle;
          if (docs.length === 1) {
            angle = baseAngle;
          } else {
            // Distribute nodes evenly within the angle range
            const angleSpan = maxAngle - minAngle;
            angle = minAngle + (angleSpan * index) / (docs.length - 1);
          }

          // Add variation to radius for better spread around circular nodes
          // Use deterministic variation based on index to ensure consistent positioning
          const variation = (index % 3) * 20 - 20; // Spread between -20, 0, +20
          const radiusVariation = baseRadius + variation;

          // Create new node if it doesn't exist AND we haven't added it in this batch
          if (!existingNode && !alreadyAdded) {
            const newNode = {
              id: newNodeId,
              x: currentNode.x + radiusVariation * Math.cos(angle),
              y: currentNode.y + radiusVariation * Math.sin(angle),
              data: { id: newNodeId, title: displayTitle },
            };
            newNodes.push(newNode);
            addedNodeIds.add(newNodeId); // Track that we've added this node
          }

          // Always create edge for every connection
          newEdges.push({
            from: nodeId,
            to: newNodeId,
            relationshipType: relType,
            direction: doc.direction,
          });
        });
      });

      // Update edges state using functional update to ensure we have latest state
      setEdges((prevEdges) => {
        // Filter out duplicate edges - check from, to, AND relationshipType
        // This allows multiple edges between the same nodes with different relationship types
        const edgesToAdd = newEdges.filter(
          (e) => !prevEdges.some(
            (p) => p.from === e.from && 
                   p.to === e.to && 
                   p.relationshipType === e.relationshipType
          )
        );
        
        // Debug logging
        console.log(`[TracePane] Expanding node ${nodeId}:`, {
          totalConnections: connectedDocs.length,
          relationshipTypes: Object.keys(groupedByType),
          newEdgesCreated: newEdges.length,
          edgesToAdd: edgesToAdd.length,
          existingEdges: prevEdges.length,
          newNodes: newNodes.length,
          uniqueNodeIds: addedNodeIds.size,
        });
        
        if (edgesToAdd.length < newEdges.length) {
          console.warn(`[TracePane] Some edges were filtered out:`, {
            filtered: newEdges.length - edgesToAdd.length,
            duplicates: newEdges.filter((e) =>
              prevEdges.some(
                (p) => p.from === e.from && 
                       p.to === e.to && 
                       p.relationshipType === e.relationshipType
              )
            ),
          });
        }
        
        return [
          ...prevEdges,
          ...edgesToAdd.map((e) => ({ ...e, isNew: true })),
        ];
      });

      // Return updated nodes
      return [
        ...prevNodes,
        ...newNodes.map((n) => ({ ...n, isNew: true })),
      ];
    });

    // 7. Remove isNew flag and stop loading after animation delay
    setTimeout(() => {
      setNodes((prev) => prev.map((n) => ({ ...n, isNew: false })));
      setEdges((prev) => prev.map((e) => ({ ...e, isNew: false })));
      setIsExpanding(false); // <-- STOP LOADING AFTER ANIMATION
    }); 
  };

  const handleNodeMouseUp = (e, nodeId) => {
    e.stopPropagation();

    // 🛑 Prevent clicking the root "gov_01" node
    if (nodeId === "gov_01") {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      wasNodeDraggedRef.current = false;
      setDraggedNodeId(null);
      return;
    }

    if (wasNodeDraggedRef.current) {
      wasNodeDraggedRef.current = false;
      setDraggedNodeId(null);
      return;
    }

    // ✅ Detect double click vs single click
    if (clickTimeoutRef.current) {
      // Double click detected → expand/collapse
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      handleNodeClick(nodeId);
    } else {
      // Single click → select + update info pane (no expand/collapse)
      clickTimeoutRef.current = setTimeout(async () => {
        setSelectedNodeId(nodeId);
        centerNodeWithAnimation(nodeId);

        // 🔥 Fetch connected documents to update info pane
        const clickedNode = nodes.find((n) => n.id === nodeId);
        if (onNodeSelect && clickedNode) {
          // Check cache first
          let connectedDocs = nodeConnectionsCache.current.get(nodeId);
          
          if (!connectedDocs) {
            // Data not cached, fetch it
            setIsFetchingNodeData(true);
            try {
              connectedDocs = await fetchConnectedDocuments(nodeId);
              // Cache the result
              nodeConnectionsCache.current.set(nodeId, connectedDocs || []);
            } finally {
              setIsFetchingNodeData(false);
            }
          }
          
          onNodeSelect({
            node: clickedNode,
            connections: connectedDocs || [],
          });
        }

        clickTimeoutRef.current = null;
      }, 250);
    }

    setDraggedNodeId(null);
  };

  // --- Zoom and View Handlers ---

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.3));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    // Optional: Recenter the root node to the canvas center on reset
    if (nodes.length > 0) {
      const rootNode = nodes.find((n) => n.isRoot);
      if (rootNode) {
        const { x: newX, y: newY } = calculateCenter();
        setNodes((prev) =>
          prev.map((n) =>
            n.id === rootNode.id ? { ...n, x: newX, y: newY } : n
          )
        );
      }
    }
    // Also disable isolation mode on reset view
    setIsIsolationMode(false);
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
    // Check if the click is on any interactive element (nodes, controls, etc.)
    if (
      e.target.closest(".node-draggable") ||
      e.target.closest(".controls-panel") ||
      e.target.closest(".legend-panel")
    )
      return;

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
      const oldNode = nodes.find((n) => n.id === draggedNodeId);
      if (
        oldNode &&
        (Math.abs(oldNode.x - newX) > DRAG_THRESHOLD ||
          Math.abs(oldNode.y - newY) > DRAG_THRESHOLD)
      ) {
        wasNodeDraggedRef.current = true;
      }

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === draggedNodeId) {
            // Apply the new position relative to the drag offset
            return {
              ...node,
              x: newX,
              y: newY,
            };
          }
          return node;
        })
      );
    } else if (isDraggingCanvas) {
      // Handle canvas pan
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    // Note: Node drag end is handled by handleNodeMouseUp
    if (draggedNodeId) {
      // If the node drag finished outside the node area (e.g., canvas area), reset it here.
      setDraggedNodeId(null);
      wasNodeDraggedRef.current = false;
    }
  };

  // --- Render Filtering Logic ---
  const getVisibleNodes = () => {
    let filteredEdges = edges;

    // Apply relationship type filter
    if (relationshipFilter !== "ALL") {
      filteredEdges = filteredEdges.filter(
        (e) => e.relationshipType === relationshipFilter
      );
    }

    // Apply isolation mode (show only connected nodes)
    if (isIsolationMode && selectedNodeId) {
      const connectedNodeIds = filteredEdges
        .filter((e) => e.from === selectedNodeId || e.to === selectedNodeId)
        .flatMap((e) => [e.from, e.to]);

      const visibleIds = new Set([...connectedNodeIds, selectedNodeId]);
      return nodes.filter((n) => visibleIds.has(n.id));
    }

    // Otherwise, show all nodes linked by filtered edges
    const visibleIds = new Set(filteredEdges.flatMap((e) => [e.from, e.to]));
    return nodes.filter((n) => visibleIds.has(n.id) || n.isRoot === true);
  };

  const getVisibleEdges = () => {
    let filteredEdges = edges;

    // Apply relationship filter
    if (relationshipFilter !== "ALL") {
      filteredEdges = filteredEdges.filter(
        (e) => e.relationshipType === relationshipFilter
      );
    }

    // Apply isolation filter
    if (isIsolationMode && selectedNodeId) {
      filteredEdges = filteredEdges.filter(
        (e) => e.from === selectedNodeId || e.to === selectedNodeId
      );
    }

    return filteredEdges;
  };

  const visibleNodes = getVisibleNodes();
  const visibleEdges = getVisibleEdges();

  // --- Render ---

  // Define node dimensions for line calculation - circular nodes
  const NODE_RADIUS = 45; // Radius for circular nodes (reduced size)
  const NODE_DIAMETER = NODE_RADIUS * 2; // 90px diameter
  const NODE_VISUAL_RADIUS = NODE_RADIUS; // For edge connection calculations
  const ARROW_OFFSET = 20; // Extra distance from node edge for arrow positioning

  const NodeComponent = ({
    node,
    isExpanded,
    isSelected,
    onDragStart,
    onMouseUp,
  }) => {
    const isGovNode = node.data.id === "gov_01";
    const displayTitle = isGovNode ? "Sri Lanka" : node.data.title;
    const isActiveInIsolation = isIsolationMode && isSelected;

    return (
      <div
        key={node.id}
        className={`node node-draggable absolute transition-all duration-300 ${
          node.isNew ? "animate-nodeAppear" : ""
        }`}
        style={{
          left: node.x - NODE_RADIUS, // Center the circular node
          top: node.y - NODE_RADIUS, // Center the circular node
          width: NODE_DIAMETER,
          height: NODE_DIAMETER,
        }}
        onMouseDown={(e) => onDragStart(e, node.id, node.x, node.y)}
        // NEW: Attach onMouseUp to the node component for reliable click detection
        onMouseUp={(e) => onMouseUp(e, node.id)}
      >
        <div
          className={`
          dark:bg-gray-900 bg-white rounded-full border-2 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl
          flex flex-col items-center justify-center
          ${isGovNode ? "p-4" : "p-3"}
          ${
            node.isRoot
              ? "border-cyan-400 hover:scale-[1.03] dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 bg-gradient-to-br from-gray-50 to-white"
              : isSelected
              ? "border-cyan-400 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10"
              : "dark:border-gray-600 border-gray-300 hover:scale-[1.03] dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 bg-gradient-to-br from-gray-50 to-white"
          }
          ${isExpanded ? "ring-2 ring-cyan-400/50 scale-[1.03]" : ""}
          ${isSelected ? "ring-4 ring-cyan-400 shadow-2xl scale-[1.05]" : ""}
          ${draggedNodeId === node.id ? "z-10 shadow-2xl scale-[1.05]" : ""}
        `}
          style={{
            width: NODE_DIAMETER,
            height: NODE_DIAMETER,
          }}
        >
          {isGovNode ? (
            <Building2
              className={`w-4 h-4 flex-shrink-0 mb-1 ${
                node.isRoot
                  ? "text-cyan-400"
                  : isSelected
                  ? "text-cyan-300"
                  : "text-cyan-400"
              }`}
            />
          ) : (
            <FileText
              className={`w-4 h-4 flex-shrink-0 mb-1 ${
                node.isRoot
                  ? "text-cyan-400"
                  : isSelected
                  ? "text-cyan-300"
                  : "text-cyan-400"
              }`}
            />
          )}
          
          <div className={`flex flex-col items-center justify-center ${isGovNode ? "text-center" : ""}`}>
            <div
              className={`font-medium text-xs text-center ${
                isSelected ? "dark:text-cyan-200 text-cyan-400" : "dark:text-white text-gray-700"
              }`}
              style={{
                maxWidth: NODE_DIAMETER - 20, // Account for padding
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayTitle}
            </div>
            
          </div>
        </div>
      </div>
    );
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Detect mobile or tablet (less than 1024px width)
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize(); // Run on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

return (
    <React.Fragment>
      <div
        className={
          "fixed " +
          (isMobile 
            ? "top-0 left-0 right-0 bottom-0 w-full h-full" 
            : isFullscreen 
              ? "top-16 left-0 right-0 bottom-0" 
              : "right-0 top-16 h-[calc(100vh-4rem)] w-full sm:w-2/3") +
          " dark:bg-gray-950 bg-white z-50 animate-slideIn flex flex-col border dark:border-gray-800 border-gray-300"
        }
        ref={containerRef}
      >

        {/* Canvas Area */}
        <div
          className="flex-1 relative dark:bg-gray-950 bg-white overflow-hidden"
          onMouseLeave={handleMouseUp}
        >
          {/* Floating Control Buttons */}
          <div className="absolute top-7 right-4 z-10 flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="sm:block hidden p-2 dark:text-gray-400 text-gray-600 hover:text-cyan-400 hover:cursor-pointer transition-colors duration-200 rounded-lg dark:hover:bg-gray-800/50 hover:bg-gray-200/50 dark:bg-gray-900/80 bg-gray-100/80 backdrop-blur-sm border dark:border-gray-700 border-gray-300"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-6 h-6" />
              ) : (
                <Maximize2 className="w-6 h-6" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 dark:text-gray-400 text-gray-600 hover:text-red-400 transition-colors hover:cursor-pointer rounded-lg dark:hover:bg-gray-800/50 hover:bg-gray-200/50 dark:bg-gray-900/80 bg-gray-100/80 backdrop-blur-sm border dark:border-gray-700 border-gray-300"
              aria-label="Close panel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600 mt-2">Loading connections...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <CircleAlert className="w-5 h-5 font-thin me-2 text-red-400" />
              <p className="text-lg font-thin dark:text-gray-300 text-gray-700">{error}</p>
            </div>
          ) : (
            <>
              {/* NEW: Expansion Loading Spinner Overlay */}
              {isExpanding && ( // <--- ADD THIS BLOCK
                <div className="absolute inset-0 flex items-center justify-center z-20 dark:bg-gray-950/80 bg-white/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                    <p className="text-sm dark:text-gray-400 text-gray-600 mt-2">Expanding connections...</p>
                  </div>
                </div>
              )}

              <div
                className={`absolute inset-0 ${
                  isDraggingCanvas ? "cursor-grabbing" : "cursor-grab"
                } ${
                  isExpanding ? "opacity-40" : "opacity-100"
                } transition-opacity duration-300`}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Grid Background - Different for light/dark theme */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, #374151 1px, transparent 1px)",
                    backgroundSize: "25px 25px",
                  }}
                >
                </div>
                <div 
                  className="absolute inset-0 pointer-events-none dark:hidden"
                  style={{
                    backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
                    backgroundSize: "25px 25px",
                  }}
                >
                </div>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    {/* Arrow marker definitions for different relationship types */}
                    {Array.from(new Set(visibleEdges.map(e => e.relationshipType || "DEFAULT"))).map((relType) => {
                      const relStyle = getRelationshipStyle(relType);
                      const markerId = `arrow-${relType}`;
                      const markerIdReverse = `arrow-reverse-${relType}`;
                      return (
                        <React.Fragment key={relType}>
                          {/* Forward arrow (for OUTGOING direction) - smaller and clearer */}
                          <marker
                            id={markerId}
                            markerWidth="8"
                            markerHeight="8"
                            refX="7"
                            refY="2.5"
                            orient="auto"
                            markerUnits="strokeWidth"
                          >
                            <path
                              d="M0,0 L0,5 L7,2.5 z"
                              fill={relStyle.color}
                              stroke={relStyle.color}
                              strokeWidth="0.5"
                              opacity="0.95"
                            />
                          </marker>
                          {/* Reverse arrow (for INCOMING direction) - smaller and clearer */}
                          <marker
                            id={markerIdReverse}
                            markerWidth="8"
                            markerHeight="8"
                            refX="1"
                            refY="2.5"
                            orient="auto"
                            markerUnits="strokeWidth"
                          >
                            <path
                              d="M7,0 L7,5 L0,2.5 z"
                              fill={relStyle.color}
                              stroke={relStyle.color}
                              strokeWidth="0.5"
                              opacity="0.95"
                            />
                          </marker>
                        </React.Fragment>
                      );
                    })}
                  </defs>
                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* MODIFIED: Use visibleEdges */}
                    {visibleEdges.map((edge, i) => {
                      // Try to find nodes in both nodes array and visibleNodes array
                      let fromNode = nodes.find((n) => n.id === edge.from);
                      let toNode = nodes.find((n) => n.id === edge.to);
                      
                      // Fallback to visibleNodes if not found (shouldn't happen, but just in case)
                      if (!fromNode) {
                        fromNode = visibleNodes.find((n) => n.id === edge.from);
                      }
                      if (!toNode) {
                        toNode = visibleNodes.find((n) => n.id === edge.to);
                      }
                      
                      if (!fromNode || !toNode) {
                        console.warn(`[TracePane] Edge rendering: Node not found`, {
                          edgeFrom: edge.from,
                          edgeTo: edge.to,
                          foundFrom: !!fromNode,
                          foundTo: !!toNode,
                          totalNodes: nodes.length,
                          visibleNodesCount: visibleNodes.length,
                        });
                        return null;
                      }

                      // Check if node coordinates are valid
                      if (
                        typeof fromNode.x !== 'number' || 
                        typeof fromNode.y !== 'number' ||
                        typeof toNode.x !== 'number' || 
                        typeof toNode.y !== 'number' ||
                        isNaN(fromNode.x) || 
                        isNaN(fromNode.y) ||
                        isNaN(toNode.x) || 
                        isNaN(toNode.y)
                      ) {
                        console.warn(`[TracePane] Edge rendering: Invalid node coordinates`, {
                          edgeFrom: edge.from,
                          edgeTo: edge.to,
                          fromNodeCoords: { x: fromNode.x, y: fromNode.y },
                          toNodeCoords: { x: toNode.x, y: toNode.y },
                        });
                        return null;
                      }

                      const relStyle = getRelationshipStyle(
                        edge.relationshipType || "DEFAULT"
                      );

                      // Calculate direction vector
                      const dx = toNode.x - fromNode.x;
                      const dy = toNode.y - fromNode.y;
                      const length = Math.sqrt(dx * dx + dy * dy);

                      if (length === 0) return null;

                      // Find all edges between the same nodes to calculate offset
                      const edgesBetweenSameNodes = visibleEdges.filter(
                        (e) => e.from === edge.from && e.to === edge.to
                      );
                      // Find the index of this edge in the filtered array
                      const edgeIndex = edgesBetweenSameNodes.findIndex((e) => e === edge);
                      const totalEdgesBetween = edgesBetweenSameNodes.length;
                      
                      // Calculate perpendicular offset for multiple edges
                      // Spread them evenly around the center line
                      const offsetDistance = totalEdgesBetween > 1 
                        ? (edgeIndex - (totalEdgesBetween - 1) / 2) * 8 // 8px spacing between parallel edges
                        : 0;
                      
                      // Perpendicular vector (90 degrees rotated)
                      const perpX = -dy / length;
                      const perpY = dx / length;

                      // Determine arrow direction based on edge direction
                      const isOutgoing = edge.direction === "OUTGOING";
                      
                      // Calculate start and end points with offset
                      // Non-arrow end connects to node edge, arrow end has offset for visibility
                      const startRadius = isOutgoing 
                        ? NODE_VISUAL_RADIUS  // OUTGOING: start connects to node (no arrow)
                        : NODE_VISUAL_RADIUS + ARROW_OFFSET; // INCOMING: start has arrow offset
                      const endRadius = isOutgoing 
                        ? NODE_VISUAL_RADIUS + ARROW_OFFSET  // OUTGOING: end has arrow offset
                        : NODE_VISUAL_RADIUS; // INCOMING: end connects to node (no arrow)
                      
                      const startX =
                        fromNode.x + (dx / length) * startRadius + perpX * offsetDistance;
                      const startY =
                        fromNode.y + (dy / length) * startRadius + perpY * offsetDistance;
                      const endX =
                        toNode.x - (dx / length) * endRadius + perpX * offsetDistance;
                      const endY =
                        toNode.y - (dy / length) * endRadius + perpY * offsetDistance;

                      // Calculate midpoint for label
                      const midX = (startX + endX) / 2;
                      const midY = (startY + endY) / 2;

                      // Calculate label angle (always keep text readable)
                      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                      const labelAngle =
                        angle > 90 || angle < -90 ? angle + 180 : angle;

                      // Label text
                      const labelText = getReadableRelationshipName(
                        edge.relationshipType || "DEFAULT"
                      );
                      const labelWidth = labelText.length * 7 + 16; // Approximate width
                      const labelHeight = 18;

                      // Create unique key and gradient ID using relationshipType
                      const uniqueKey = `${edge.from}-${edge.to}-${edge.relationshipType}-${i}`;
                      const gradientId = `gradient-${edge.from}-${edge.to}-${edge.relationshipType}-${i}`;
                      
                      // Set up arrow markers based on direction (isOutgoing already calculated above)
                      const relType = edge.relationshipType || "DEFAULT";
                      const forwardMarkerId = `arrow-${relType}`;
                      const reverseMarkerId = `arrow-reverse-${relType}`;
                      const arrowMarkerEnd = isOutgoing ? `url(#${forwardMarkerId})` : undefined;
                      const arrowMarkerStart = !isOutgoing ? `url(#${reverseMarkerId})` : undefined;

                      return (
                        <g
                          key={uniqueKey}
                          className={edge.isNew ? "animate-edgeFadeIn" : ""}
                        >
                          {/* Connection Line with gradient */}
                          <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" style={{stopColor: relStyle.color, stopOpacity: 0.8}} />
                              <stop offset="50%" style={{stopColor: relStyle.color, stopOpacity: 1}} />
                              <stop offset="100%" style={{stopColor: relStyle.color, stopOpacity: 0.8}} />
                            </linearGradient>
                          </defs>
                          <line
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke={`url(#${gradientId})`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            markerEnd={arrowMarkerEnd}
                            markerStart={arrowMarkerStart}
                          />


                          <g
                            transform={`translate(${midX}, ${midY}) rotate(${labelAngle})`}
                          >
                            {/* Background rectangle with glow */}
                            <rect
                              x={-labelWidth / 2 - 2}
                              y={-labelHeight / 2 - 2}
                              width={labelWidth + 4}
                              height={labelHeight + 4}
                              fill={relStyle.color}
                              opacity="0.2"
                              rx="6"
                            />
                            <rect
                              x={-labelWidth / 2}
                              y={-labelHeight / 2}
                              width={labelWidth}
                              height={labelHeight}
                              fill={isDark ? "#1e293b" : "#ffffff"}
                              stroke={relStyle.color}
                              strokeWidth="1.5"
                              rx="4"
                              opacity="0.95"
                            />
                            {/* Text */}
                            <text
                              x="0"
                              y="0"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={relStyle.color}
                              fontSize="9"
                              fontWeight="700"
                            >
                              {labelText}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                </svg>

                <div
                  className="absolute"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "0 0",
                  }}
                >
                  {/* MODIFIED: Use visibleNodes */}
                  {visibleNodes.map((node) => (
                    <NodeComponent
                      key={node.id}
                      node={node}
                      isExpanded={expandedNodes.has(node.id)}
                      isSelected={selectedNodeId === node.id}
                      onDragStart={handleNodeDragStart}
                      onMouseUp={handleNodeMouseUp} // Click/drag handler
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Controls */}
          <div className="controls-panel absolute bottom-4 right-4 flex flex-col gap-2 dark:bg-gray-900 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border dark:border-gray-700 border-gray-300 p-2">
            <button
              onClick={handleZoomIn}
              className="p-2 dark:hover:bg-gray-800/50 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer dark:text-gray-300 text-gray-600 dark:hover:text-cyan-400 hover:text-gray-900"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 dark:hover:bg-gray-800/50 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer dark:text-gray-300 text-gray-600 dark:hover:text-cyan-400 hover:text-gray-900"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 dark:hover:bg-gray-800/50 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer dark:text-gray-300 text-gray-600 dark:hover:text-cyan-400 hover:text-gray-900"
              title="Reset View"
            >
              <Shrink className="w-5 h-5" />
            </button>
            {selectedNodeId && (
              <button
                onClick={() => setIsIsolationMode((prev) => !prev)}
                className={`p-2 rounded-lg transition-colors hover:cursor-pointer ${
                  isIsolationMode
                    ? "bg-cyan-500 dark:text-white text-white hover:bg-cyan-600"
                    : "dark:hover:bg-gray-800/50 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer dark:text-gray-300 text-gray-600 dark:hover:text-cyan-400 hover:text-gray-900"
                }`}
                title={
                  isIsolationMode
                    ? "Exit Isolation Mode"
                    : "Isolate Selected Node"
                }
              >
                <ScanEye className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Top Control Bar */}
          <div className="absolute top-5 left-1 right-4 flex gap-4">
            {/* Relationship Filter */}
            <div className="bg-transparent rounded-xl p-3 flex-1 max-w-xs">
              
              <div className="relative">
                <Select
                  value={relationshipFilter}
                  onValueChange={setRelationshipFilter}
                >
                  <SelectTrigger className="w-full text-xs font-medium rounded-lg px-3 py-4.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 hover:cursor-pointer border dark:border-gray-700 border-gray-300 dark:bg-gray-900/80 bg-white backdrop-blur-sm dark:text-gray-300 text-gray-700">
                  <SelectValue placeholder="All Relationships" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 bg-white dark:text-gray-300 text-gray-700 font-medium border-none">
                  <SelectItem
                    value="ALL"
                    className="text-xs hover:cursor-pointer"
                  >
                    All Relationships
                  </SelectItem>
                  {Array.from(new Set(edges.map(edge => edge.relationshipType)))
                    .filter(type => type && type !== "DEFAULT")
                    .map((type) => {
                      const config = relationshipConfig[type] || relationshipConfig["DEFAULT"];
                      return (
                        <SelectItem
                          key={type}
                          value={type}
                          className="text-xs hover:cursor-pointer"
                        >
                          {config.allias || type}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            {/* Relationship Legend - Only show when relationships exist */}
            {Array.from(new Set(edges.map(edge => edge.relationshipType)))
              .filter(type => type && type !== "DEFAULT").length > 0 && (
                
                <div className="flex flex-wrap gap-3 mt-3">
                  {Array.from(new Set(edges.map(edge => edge.relationshipType)))
                    .filter(type => type && type !== "DEFAULT")
                    .map((type) => {
                      const config = relationshipConfig[type] || relationshipConfig["DEFAULT"];
                      return (
                        <div key={type} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full dark:border-white/20 border-gray-400/40"
                            style={{ backgroundColor: config.color }}
                          ></div>
                          <span className="text-xs font-medium dark:text-gray-300 text-gray-700">
                            {config.allias || type}
                          </span>
                        </div>
                      );
                    })}
              </div>
            )}
          </div>
        </div>        
      </div>

      {showTooltip && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-fadeInOut
               dark:bg-gray-900 bg-white dark:text-white text-gray-700 px-5 py-4 rounded-lg shadow-lg"
        >
          <p className="font-medium">This is the origin node of connections</p>
          <p className="text-sm font-medium">Click other nodes to play</p>
        </div>
      )}

        {/* Footer Info */}
        <div className="dark:bg-gray-900/80 bg-gray-100/80 backdrop-blur-sm border-t dark:border-gray-700 border-gray-300 p-3 text-sm font-thin dark:text-gray-300 text-gray-700 flex justify-between">
          <span>
            <span className="font-light text-cyan-400">{nodes.length}</span>{" "}
            document{nodes.length !== 1 ? "s" : ""} •
            <span className="font-light ml-1 text-cyan-400">
              {edges.length}
            </span>{" "}
            connection{edges.length !== 1 ? "s" : ""}
          </span>
          <div>
            <span className="text-xs dark:text-gray-400 text-gray-600">
              Click nodes to expand and explore connections
            </span>
            <span> • </span>
            <span className="text-xs dark:text-gray-400 text-gray-600">
              Drag nodes or background to interact
            </span>
          </div>
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

        @keyframes nodeAppear {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-nodeAppear {
          animation: nodeAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes edgeFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-edgeFadeIn {
          animation: edgeFadeIn 0.5s ease-in;
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-tooltipFadeIn {
          animation: tooltipFadeIn 0.2s ease-out;
        }

        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          10%,
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        .animate-fadeInOut {
          animation: fadeInOut 2.5s ease-in-out forwards;
        }
      `}</style>
    </React.Fragment>
  );
};

export default TracePane;
