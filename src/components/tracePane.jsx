// import { useEffect, useState, useRef, useCallback } from "react";
// import {
//   X,
//   FileText,
//   ZoomIn,
//   ZoomOut,
//   Maximize2,
//   Minimize2,
//   Shrink,
//   CircleAlert,
// } from "lucide-react";
// import { getReadableRelationshipName } from "../utils/relationshipUtils";

// const TracePane = ({ documentId, onClose, onNodeSelect }) => {
//   // --- State Variables ---
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [expandedNodes, setExpandedNodes] = useState(new Set());
//   const [selectedNodeId, setSelectedNodeId] = useState(null);
//   const [zoom, setZoom] = useState(1);
//   const [pan, setPan] = useState({ x: 0, y: 0 });
//   const [isExpanding, setIsExpanding] = useState(false);

//   // Canvas Dragging State
//   const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

//   // Node Dragging State
//   const [draggedNodeId, setDraggedNodeId] = useState(null);
//   const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });

//   // Reference to track if a node was moved during the current mouse down cycle
//   const wasNodeDraggedRef = useRef(false);

//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const containerRef = useRef(null);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

//   // --- Relationship Type Configuration ---
//   const relationshipConfig = {
//     AS_DOCUMENT: {
//       allias: "Government Publication",
//       color: "#06B6D4", // Cyan
//       textColor: "#0E7490",
//       bgColor: "bg-cyan-50",
//       angle: 0, // Right (0 degrees)
//       angleRange: [-30, 30], // Wider spread
//     },
//     AMENDS: {
//       allias: "Amendment",
//       color: "#14B8A6", // Teal
//       textColor: "#0F766E",
//       bgColor: "bg-teal-50",
//       angle: 90, // Top
//       angleRange: [60, 120],
//     },
//     REFERS_TO: {
//       allias: "Refers To",
//       color: "#6366F1", // Indigo
//       textColor: "#4338CA",
//       bgColor: "bg-indigo-50",
//       angle: 180, // Left
//       angleRange: [150, 210],
//     },
//     // ,
//     // 'REFERENCES': {
//     //   color: '#6366F1', // Indigo
//     //   textColor: '#4338CA',
//     //   bgColor: 'bg-indigo-50',
//     //   angle: 180, // Left
//     //   angleRange: [150, 210]
//     // },
//     // 'AFFECTS': {
//     //   color: '#8B5CF6', // Purple
//     //   textColor: '#6D28D9',
//     //   bgColor: 'bg-purple-50',
//     //   angle: 270, // Bottom
//     //   angleRange: [240, 300]
//     // },
//     // 'DEFAULT': {
//     //   color: '#9CA3AF', // Gray
//     //   textColor: '#4B5563',
//     //   bgColor: 'bg-gray-50',
//     //   angle: 315, // Bottom-right
//     //   angleRange: [300, 360]
//     // }
//   };

//   // // --- Relationship Type Display Names ---
//   // const relationshipDisplayNames = {
//   //   AS_DOCUMENT: "Government Publication",
//   //   AMENDS: "Amendment",
//   //   REFERS_TO: "Refers To",
//   //   REFERENCES: "References",
//   //   AFFECTS: "Affects",
//   //   DEFAULT: "Related To",
//   // };

//   // const getReadableRelationshipName = (type) => {
//   //   return relationshipDisplayNames[type] || type.replace(/_/g, ' ').toLowerCase();
//   // };

//   const getRelationshipStyle = (relationshipType) => {
//     return (
//       relationshipConfig[relationshipType] || relationshipConfig["DEFAULT"]
//     );
//   };

//   // --- Utility Functions ---

//   const calculateCenter = useCallback(() => {
//     if (containerRef.current) {
//       return {
//         x: containerRef.current.clientWidth / 2,
//         y: containerRef.current.clientHeight / 2,
//       };
//     }
//     // Fallback if ref isn't ready
//     return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
//   }, []);

//   // Function to smoothly animate pan to center a node
//   const centerNodeWithAnimation = useCallback(
//     (nodeId) => {
//       const node = nodes.find((n) => n.id === nodeId);
//       if (!node || !containerRef.current) return;

//       const center = calculateCenter();

//       // Calculate the required pan to center this node
//       const targetPanX = center.x - node.x * zoom;
//       const targetPanY = center.y - node.y * zoom;

//       // Animate the pan
//       const startPanX = pan.x;
//       const startPanY = pan.y;
//       const duration = 500; // ms
//       const startTime = Date.now();

//       const animate = () => {
//         const elapsed = Date.now() - startTime;
//         const progress = Math.min(elapsed / duration, 1);

//         // Easing function (ease-out cubic)
//         const easeProgress = 1 - Math.pow(1 - progress, 3);

//         const currentPanX = startPanX + (targetPanX - startPanX) * easeProgress;
//         const currentPanY = startPanY + (targetPanY - startPanY) * easeProgress;

//         setPan({ x: currentPanX, y: currentPanY });

//         if (progress < 1) {
//           requestAnimationFrame(animate);
//         }
//       };

//       requestAnimationFrame(animate);
//     },
//     [nodes, zoom, pan.x, pan.y, calculateCenter]
//   );

//   // --- Effects ---

//   // Initialize and clean up overflow/fullscreen state
//   useEffect(() => {
//     document.body.style.overflow = "hidden";

//     // Recenter the root node if dimensions change (e.g., fullscreen toggle)
//     if (nodes.length === 1) {
//       const center = calculateCenter();
//       setNodes((prev) =>
//         prev.map((n) =>
//           n.id === documentId ? { ...n, x: center.x, y: center.y } : n
//         )
//       );
//       setPan({ x: 0, y: 0 });
//       setZoom(1);
//     }

//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [documentId, calculateCenter]);

//   // Fetch initial document and center it
//   useEffect(() => {
//     const fetchDocument = async () => {
//       setLoading(true);
//       setError(null);
//       setNodes([]);
//       setEdges([]);
//       setExpandedNodes(new Set());

//       try {
//         const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
//         const response = await fetch(`${apiUrl}/document/${documentId}`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//         });

//         if (!response.ok) {
//           throw new Error(`Error fetching document: ${response.statusText}`);
//         }

//         const document_name = await response.json();

//         if (!document_name) {
//           setError("No data found for this document.");
//           return;
//         }

//         const { x: initialX, y: initialY } = calculateCenter();

//         setNodes([
//           {
//             id: document_name,
//             x: initialX,
//             y: initialY,
//             data: { id: document_name, title: documentId },
//             isRoot: true,
//           },
//         ]);
//       } catch (err) {
//         console.error("Failed to fetch initial document:", err);
//         setError(`Error: ${err.message}. Please try again later.`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (documentId) {
//       fetchDocument();
//     }
//   }, [documentId, calculateCenter]);

//   // --- API Simulation/Integration ---

//   const fetchConnectedDocuments = async (nodeId) => {
//     try {
//       const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
//       const response = await fetch(`${apiUrl}/document-rel/${nodeId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!response.ok) {
//         // Mock data matching the user's provided structure
//         console.warn("API call failed, using mock data for connections.");
//         return [
//           {
//             relatedEntityId: `${nodeId}_mock_29`,
//             name: "AMENDS",
//             direction: "INCOMING",
//             document_number: "2161-43",
//           },
//           {
//             relatedEntityId: `${nodeId}_mock_30`,
//             name: "AMENDS",
//             direction: "INCOMING",
//             document_number: "2160-64",
//           },
//           {
//             relatedEntityId: `${nodeId}_mock_32`,
//             name: "REFERENCES",
//             direction: "OUTGOING",
//             document_number: "2159-48",
//           },
//           {
//             relatedEntityId: `${nodeId}_mock_33`,
//             name: "AFFECTS",
//             direction: "OUTGOING",
//             document_number: "9001-A",
//           },
//           {
//             relatedEntityId: `${nodeId}_mock_34`,
//             name: "AMENDS",
//             direction: "INCOMING",
//             document_number: "5432-B",
//           },
//         ];
//       }

//       const data = await response.json();
//       return data || [];
//     } catch (err) {
//       console.error("Failed to fetch connections:", err);
//       // Return mock data on error
//       return [
//         {
//           relatedEntityId: `${nodeId}_err_29`,
//           name: "AMENDS",
//           direction: "INCOMING",
//           document_number: "0001-E",
//         },
//         {
//           relatedEntityId: `${nodeId}_err_30`,
//           name: "REFERENCES",
//           direction: "OUTGOING",
//           document_number: "0002-R",
//         },
//       ];
//     }
//   };

//   // --- Interaction Handlers ---

//   //   const handleNodeClick = async (nodeId) => {
//   //     const clickedNode = nodes.find((n) => n.id === nodeId);

//   //     // 1. Prevent action if another expansion is currently in progress
//   //     // if (isExpanding) return;

//   //     // 2. Always set this node as selected and center it
//   //     setSelectedNodeId(nodeId);
//   //     centerNodeWithAnimation(nodeId);

//   //     // 3. Handle Collapse (No loading state needed)
//   //     if (expandedNodes.has(nodeId)) {
//   //         // Collapse only this node's direct expansion
//   //         setExpandedNodes((prev) => {
//   //             const newSet = new Set(prev);
//   //             newSet.delete(nodeId);
//   //             return newSet;
//   //         });

//   //         setEdges((prevEdges) => {
//   //             // Remove edges from this node
//   //             const updatedEdges = prevEdges.filter((e) => e.from !== nodeId);

//   //             // Find which nodes are now isolated (no edges left)
//   //             const connectedIds = prevEdges
//   //                 .filter((e) => e.from === nodeId)
//   //                 .map((e) => e.to);
//   //             const remainingConnectedNodes = new Set([
//   //                 ...updatedEdges.map((e) => e.from),
//   //                 ...updatedEdges.map((e) => e.to),
//   //             ]);

//   //             // Remove only the nodes that are not used anywhere else
//   //             setNodes((prevNodes) =>
//   //                 prevNodes.filter((n) => remainingConnectedNodes.has(n.id) || n.isRoot)
//   //             );

//   //             return updatedEdges;
//   //         });

//   //         return;
//   //     }

//   //     // ----------------------------------------------------
//   //     // 4. Expansion Logic Starts - ACTIVATE LOADING STATE HERE
//   //     // ----------------------------------------------------
//   //     setIsExpanding(true); // <-- START LOADING/DIMMING STATE

//   //     // 5. Fetch connections (This is the blocking network request)
//   //     const connectedDocs = await fetchConnectedDocuments(nodeId);

//   //     // Send node info to parent component
//   //     if (onNodeSelect && clickedNode) {
//   //         onNodeSelect({
//   //             node: clickedNode,
//   //             connections: connectedDocs || [],
//   //         });
//   //     }

//   //     // Expand node (Mark it as expanded regardless of connections)
//   //     setExpandedNodes((prev) => new Set([...prev, nodeId]));

//   //     // 6. If no documents found, stop the process and clear loading
//   //     if (!clickedNode || !connectedDocs?.length) {
//   //         setIsExpanding(false); // <-- STOP LOADING IMMEDIATELY
//   //         return;
//   //     }

//   //     const baseRadius = 350; // Increased for better spread

//   //     // Group documents by relationship type
//   //     const groupedByType = connectedDocs.reduce((acc, doc) => {
//   //         const type = doc.name || "DEFAULT";
//   //         if (!acc[type]) acc[type] = [];
//   //         acc[type].push(doc);
//   //         return acc;
//   //     }, {});

//   //     const newNodes = [];
//   //     const newEdges = [];

//   //     // Position nodes based on their relationship type
//   //     Object.entries(groupedByType).forEach(([relType, docs]) => {
//   //         const relStyle = getRelationshipStyle(relType);
//   //         const baseAngle = relStyle.angle * (Math.PI / 180); // Convert to radians
//   //         const [minAngle, maxAngle] = relStyle.angleRange.map(
//   //             (a) => a * (Math.PI / 180)
//   //         );

//   //         docs.forEach((doc, index) => {
//   //             const newNodeId = doc.relatedEntityId;
//   //             const displayTitle = doc.document_number || newNodeId;
//   //             const existingNode = nodes.find((n) => n.id === newNodeId);

//   //             // Calculate angle within the range for this relationship type
//   //             let angle;
//   //             if (docs.length === 1) {
//   //                 angle = baseAngle;
//   //             } else {
//   //                 // Distribute nodes evenly within the angle range
//   //                 const angleSpan = maxAngle - minAngle;
//   //                 angle = minAngle + (angleSpan * index) / (docs.length - 1);
//   //             }

//   //             // Add variation to radius for more natural spread (±15%)
//   //             const radiusVariation = baseRadius * (0.85 + Math.random() * 0.3);

//   //             if (!existingNode) {
//   //                 const newNode = {
//   //                     id: newNodeId,
//   //                     x: clickedNode.x + radiusVariation * Math.cos(angle),
//   //                     y: clickedNode.y + radiusVariation * Math.sin(angle),
//   //                     data: { id: newNodeId, title: displayTitle },
//   //                 };
//   //                 newNodes.push(newNode);
//   //             }

//   //             newEdges.push({
//   //                 from: nodeId,
//   //                 to: newNodeId,
//   //                 relationshipType: relType,
//   //                 direction: doc.direction,
//   //             });
//   //         });
//   //     });

//   //     // Merge unique nodes and edges with animation-ready state
//   //     const nodesToAdd = newNodes.filter(
//   //         (n) => !nodes.some((p) => p.id === n.id)
//   //     );

//   //     setNodes((prev) => [
//   //         ...prev,
//   //         ...nodesToAdd.map((n) => ({ ...n, isNew: true })),
//   //     ]);

//   //     const edgesToAdd = newEdges.filter(
//   //         (e) => !edges.some((p) => p.from === e.from && p.to === e.to)
//   //     );

//   //     setEdges((prev) => [
//   //         ...prev,
//   //         ...edgesToAdd.map((e) => ({ ...e, isNew: true })),
//   //     ]);

//   //     // 7. Remove isNew flag and stop loading after animation delay
//   //     setTimeout(() => {
//   //         setNodes((prev) => prev.map((n) => ({ ...n, isNew: false })));
//   //         setEdges((prev) => prev.map((e) => ({ ...e, isNew: false })));
//   //         setIsExpanding(false); // <-- STOP LOADING AFTER ANIMATION
//   //     }, 50);
//   // };

//   const handleNodeClick = async (nodeId) => {
//     const clickedNode = nodes.find((n) => n.id === nodeId);

//     // 2. Always set this node as selected and center it
//     setSelectedNodeId(nodeId);
//     centerNodeWithAnimation(nodeId);

//     // ********** FIX: Move data fetch and onNodeSelect here **********
//     // This ensures the parent component (info pane) is updated on the first click,
//     // whether the node is collapsing or expanding.
//     const connectedDocs = await fetchConnectedDocuments(nodeId);

//     if (onNodeSelect && clickedNode) {
//       onNodeSelect({
//         node: clickedNode,
//         connections: connectedDocs || [],
//       });
//     }
//     // ****************************************************************

//     // 3. Handle Collapse
//     if (expandedNodes.has(nodeId)) {
//       // Collapse only this node's direct expansion
//       setExpandedNodes((prev) => {
//         const newSet = new Set(prev);
//         newSet.delete(nodeId);
//         return newSet;
//       });

//       setEdges((prevEdges) => {
//         // Remove edges from this node
//         const updatedEdges = prevEdges.filter((e) => e.from !== nodeId);

//         // Find which nodes are now isolated (no edges left)
//         const connectedIds = prevEdges
//           .filter((e) => e.from === nodeId)
//           .map((e) => e.to);
//         const remainingConnectedNodes = new Set([
//           ...updatedEdges.map((e) => e.from),
//           ...updatedEdges.map((e) => e.to),
//         ]);

//         // Remove only the nodes that are not used anywhere else
//         setNodes((prevNodes) =>
//           prevNodes.filter((n) => remainingConnectedNodes.has(n.id) || n.isRoot)
//         );

//         return updatedEdges;
//       });

//       // The function returns here, but the info update has already happened above.
//       return;
//     }

//     // ----------------------------------------------------
//     // 4. Expansion Logic Starts - ACTIVATE LOADING STATE HERE
//     // ----------------------------------------------------
//     setIsExpanding(true); // <-- START LOADING/DIMMING STATE

//     // Expand node (Mark it as expanded regardless of connections)
//     setExpandedNodes((prev) => new Set([...prev, nodeId]));

//     // 6. If no documents found, stop the process and clear loading
//     // We use the connectedDocs fetched at the start of the function.
//     if (!clickedNode || !connectedDocs?.length) {
//       setIsExpanding(false); // <-- STOP LOADING IMMEDIATELY
//       return;
//     }

//     const baseRadius = 350; // Increased for better spread

//     // Group documents by relationship type
//     const groupedByType = connectedDocs.reduce((acc, doc) => {
//       const type = doc.name || "DEFAULT";
//       if (!acc[type]) acc[type] = [];
//       acc[type].push(doc);
//       return acc;
//     }, {});

//     const newNodes = [];
//     const newEdges = [];

//     // Position nodes based on their relationship type
//     Object.entries(groupedByType).forEach(([relType, docs]) => {
//       const relStyle = getRelationshipStyle(relType);
//       const baseAngle = relStyle.angle * (Math.PI / 180); // Convert to radians
//       const [minAngle, maxAngle] = relStyle.angleRange.map(
//         (a) => a * (Math.PI / 180)
//       );

//       docs.forEach((doc, index) => {
//         const newNodeId = doc.relatedEntityId;
//         const displayTitle = doc.document_number || newNodeId;
//         const existingNode = nodes.find((n) => n.id === newNodeId);

//         // Calculate angle within the range for this relationship type
//         let angle;
//         if (docs.length === 1) {
//           angle = baseAngle;
//         } else {
//           // Distribute nodes evenly within the angle range
//           const angleSpan = maxAngle - minAngle;
//           angle = minAngle + (angleSpan * index) / (docs.length - 1);
//         }

//         // Add variation to radius for more natural spread (±15%)
//         const radiusVariation = baseRadius * (0.85 + Math.random() * 0.3);

//         if (!existingNode) {
//           const newNode = {
//             id: newNodeId,
//             x: clickedNode.x + radiusVariation * Math.cos(angle),
//             y: clickedNode.y + radiusVariation * Math.sin(angle),
//             data: { id: newNodeId, title: displayTitle },
//           };
//           newNodes.push(newNode);
//         }

//         newEdges.push({
//           from: nodeId,
//           to: newNodeId,
//           relationshipType: relType,
//           direction: doc.direction,
//         });
//       });
//     });

//     // Merge unique nodes and edges with animation-ready state
//     const nodesToAdd = newNodes.filter(
//       (n) => !nodes.some((p) => p.id === n.id)
//     );

//     setNodes((prev) => [
//       ...prev,
//       ...nodesToAdd.map((n) => ({ ...n, isNew: true })),
//     ]);

//     const edgesToAdd = newEdges.filter(
//       (e) => !edges.some((p) => p.from === e.from && p.to === e.to)
//     );

//     setEdges((prev) => [
//       ...prev,
//       ...edgesToAdd.map((e) => ({ ...e, isNew: true })),
//     ]);

//     // 7. Remove isNew flag and stop loading after animation delay
//     setTimeout(() => {
//       setNodes((prev) => prev.map((n) => ({ ...n, isNew: false })));
//       setEdges((prev) => prev.map((e) => ({ ...e, isNew: false })));
//       setIsExpanding(false); // <-- STOP LOADING AFTER ANIMATION
//     }, 50);
//   };

//   const handleNodeMouseUp = (e, nodeId) => {
//     e.stopPropagation();

//     // 🛑 Prevent clicking the root "gov_01" node and show tooltip
//     if (nodeId === "gov_01") {
//       // Show tooltip at mouse position
//       setTooltipPosition({ x: e.clientX, y: e.clientY });
//       setShowTooltip(true);

//       // Hide tooltip after 2 seconds
//       setTimeout(() => {
//         setShowTooltip(false);
//       }, 1000);

//       wasNodeDraggedRef.current = false;
//       setDraggedNodeId(null);
//       return; // Block click expansion
//     }

//     if (!wasNodeDraggedRef.current) {
//       handleNodeClick(nodeId);
//     }

//     wasNodeDraggedRef.current = false;
//     setDraggedNodeId(null);
//   };

//   // --- Zoom and View Handlers ---

//   const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
//   const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.3));
//   const handleResetView = () => {
//     setZoom(1);
//     setPan({ x: 0, y: 0 });
//     // Optional: Recenter the root node to the canvas center on reset
//     if (nodes.length > 0) {
//       const rootNode = nodes.find((n) => n.isRoot);
//       if (rootNode) {
//         const { x: newX, y: newY } = calculateCenter();
//         setNodes((prev) =>
//           prev.map((n) =>
//             n.id === rootNode.id ? { ...n, x: newX, y: newY } : n
//           )
//         );
//       }
//     }
//   };

//   const toggleFullscreen = () => {
//     setIsFullscreen(!isFullscreen);
//   };

//   // --- Dragging Handlers (Canvas and Node) ---

//   const handleNodeDragStart = (e, nodeId, nodeX, nodeY) => {
//     e.stopPropagation(); // Prevent canvas drag from starting
//     setIsDraggingCanvas(false);
//     setDraggedNodeId(nodeId);
//     wasNodeDraggedRef.current = false; // Reset the drag movement flag

//     // Calculate the offset between mouse position and node center, relative to current view
//     const mouseX = (e.clientX - pan.x) / zoom;
//     const mouseY = (e.clientY - pan.y) / zoom;

//     setNodeDragOffset({
//       x: mouseX - nodeX,
//       y: mouseY - nodeY,
//     });
//   };

//   const handleCanvasMouseDown = (e) => {
//     if (e.target.closest(".node-draggable")) return; // Ignore if clicking a node
//     setIsDraggingCanvas(true);
//     setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
//   };

//   const DRAG_THRESHOLD = 5; // Pixels to define a drag vs a click

//   const handleMouseMove = (e) => {
//     if (draggedNodeId) {
//       // Handle node drag
//       const mouseX = (e.clientX - pan.x) / zoom;
//       const mouseY = (e.clientY - pan.y) / zoom;

//       const newX = mouseX - nodeDragOffset.x;
//       const newY = mouseY - nodeDragOffset.y;

//       // Check if movement exceeds threshold to mark it as a drag
//       const oldNode = nodes.find((n) => n.id === draggedNodeId);
//       if (
//         oldNode &&
//         (Math.abs(oldNode.x - newX) > DRAG_THRESHOLD ||
//           Math.abs(oldNode.y - newY) > DRAG_THRESHOLD)
//       ) {
//         wasNodeDraggedRef.current = true;
//       }

//       setNodes((prevNodes) =>
//         prevNodes.map((node) => {
//           if (node.id === draggedNodeId) {
//             // Apply the new position relative to the drag offset
//             return {
//               ...node,
//               x: newX,
//               y: newY,
//             };
//           }
//           return node;
//         })
//       );
//     } else if (isDraggingCanvas) {
//       // Handle canvas pan
//       setPan({
//         x: e.clientX - dragStart.x,
//         y: e.clientY - dragStart.y,
//       });
//     }
//   };

//   const handleMouseUp = () => {
//     setIsDraggingCanvas(false);
//     // Note: Node drag end is handled by handleNodeMouseUp
//     // If canvas mouse up fires while a node was being dragged, the node's mouseUp handles the reset.
//     if (draggedNodeId) {
//       // If the node drag finished outside the node area (e.g., canvas area), reset it here.
//       setDraggedNodeId(null);
//       wasNodeDraggedRef.current = false;
//     }
//   };

//   // --- Render ---

//   // Define node dimensions for line calculation
//   const NODE_WIDTH = 160;
//   const NODE_HEIGHT = 80;
//   const NODE_VISUAL_RADIUS = Math.min(NODE_WIDTH, NODE_HEIGHT) / 2; // ~40

//   const NodeComponent = ({
//     node,
//     isExpanded,
//     isSelected,
//     onNodeClick,
//     onDragStart,
//     onMouseUp,
//   }) => {
//     const isGovNode = node.data.id === "gov_01";
//     const displayTitle = isGovNode ? "Sri Lanka Gov" : node.data.title;

//     return (
//       <div
//         key={node.id}
//         className={`node node-draggable absolute transition-all duration-300 ${
//           node.isNew ? "animate-nodeAppear" : ""
//         }`}
//         style={{
//           left: node.x - NODE_WIDTH / 2, // Center the node div
//           top: node.y - NODE_HEIGHT / 2, // Center the node div
//           width: NODE_WIDTH,
//         }}
//         onMouseDown={(e) => onDragStart(e, node.id, node.x, node.y)}
//         // NEW: Attach onMouseUp to the node component for reliable click detection
//         onMouseUp={(e) => onMouseUp(e, node.id)}
//       >
//         <div
//           className={`
//           bg-white rounded-xl border-2 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl 
//           ${isGovNode ? "p-4" : "p-3"}
//           ${
//             node.isRoot
//               ? "border-cyan-500 hover:scale-[1.03]"
//               : isSelected
//               ? "border-cyan-500 bg-cyan-50"
//               : "border-gray-300 hover:scale-[1.03]"
//           }
//           ${isExpanded ? "ring-2 ring-cyan-200 scale-[1.03]" : ""}
//           ${isSelected ? "ring-4 ring-cyan-400 shadow-2xl scale-[1.05]" : ""}
//           ${draggedNodeId === node.id ? "z-10 shadow-2xl scale-[1.05]" : ""}
//         `}
//         >
//           <div
//             className={`flex items-center ${
//               isGovNode ? "justify-center" : "items-start"
//             } gap-2`}
//           >
//             <FileText
//               className={`w-5 h-5 flex-shrink-0 ${
//                 node.isRoot
//                   ? "text-cyan-500"
//                   : isSelected
//                   ? "text-cyan-600"
//                   : "text-cyan-500"
//               }`}
//             />
//             <div className={`flex-1 ${isGovNode ? "text-center" : "min-w-0"}`}>
//               <div
//                 className={`font-medium text-sm ${
//                   isGovNode ? "" : "truncate"
//                 } ${isSelected ? "text-cyan-800" : "text-cyan-700"}`}
//               >
//                 {displayTitle}
//               </div>
//               {!isGovNode && (
//                 <div
//                   className={`text-xs truncate ${
//                     isSelected ? "text-cyan-600" : "text-gray-500"
//                   }`}
//                 >
//                   Gazette: {node.data.id.substring(0, 12)}...
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div
//         className={`fixed ${
//           isFullscreen ? "inset-0" : "right-0 top-0 h-full w-full sm:w-2/3"
//         } bg-white shadow-2xl z-50 animate-slideIn flex flex-col`}
//         ref={containerRef}
//       >
//         <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
//           <div>
//             <h2 className="text-lg font-thin text-gray-900">Document Graph</h2>
//             <p className="text-sm text-gray-500 font-light">
//               Click documents to see how they connected
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={toggleFullscreen}
//               className="p-2 text-gray-500 hover:text-gray-600 hover:cursor-pointer transition-colors duration-200"
//               aria-label="Toggle fullscreen"
//             >
//               {isFullscreen ? (
//                 <Minimize2 className="w-6 h-6" />
//               ) : (
//                 <Maximize2 className="w-6 h-6" />
//               )}
//             </button>
//             <button
//               onClick={onClose}
//               className="p-2 text-gray-500 hover:text-gray-600 transition-colors hover:cursor-pointer"
//               aria-label="Close panel"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         {/* Canvas Area */}
//         <div
//           className="flex-1 relative bg-gray-50 overflow-hidden"
//           onMouseLeave={handleMouseUp}
//         >
//           {loading ? (
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="text-center">
//                 <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
//               </div>
//             </div>
//           ) : error ? (
//             <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
//               <CircleAlert className="w-5 h-5 font-thin me-2" />
//               <p className="text-lg font-thin text-gray-500">{error}</p>
//             </div>
//           ) : (
//             <>
//               {/* NEW: Expansion Loading Spinner Overlay */}
//               {isExpanding && ( // <--- ADD THIS BLOCK
//                 <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-50/50">
//                   <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
//                 </div>
//               )}

//               <div // <--- MODIFIED: Apply opacity and transition here
//                 className={`absolute inset-0 ${
//                   isDraggingCanvas ? "cursor-grabbing" : "cursor-grab"
//                 }`}
//                 style={{
//                   backgroundImage:
//                     "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
//                   backgroundSize: "25px 25px",
//                   // NEW: Apply dimming effect
//                   opacity: isExpanding ? 0.4 : 1, // <--- ADD THIS LINE
//                   transition: "opacity 0.3s ease-in-out", // <--- ADD THIS LINE
//                 }}
//                 onMouseDown={handleCanvasMouseDown}
//                 onMouseMove={handleMouseMove}
//                 onMouseUp={handleMouseUp}
//               >
//                 <svg className="absolute inset-0 w-full h-full pointer-events-none">
//                   <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
//                     {edges.map((edge, i) => {
//                       const fromNode = nodes.find((n) => n.id === edge.from);
//                       const toNode = nodes.find((n) => n.id === edge.to);
//                       if (!fromNode || !toNode) return null;

//                       const relStyle = getRelationshipStyle(
//                         edge.relationshipType || "DEFAULT"
//                       );

//                       // Calculate direction vector
//                       const dx = toNode.x - fromNode.x;
//                       const dy = toNode.y - fromNode.y;
//                       const length = Math.sqrt(dx * dx + dy * dy);

//                       if (length === 0) return null;

//                       // Calculate start and end points (short of the node centers)
//                       const startX =
//                         fromNode.x + (dx / length) * NODE_VISUAL_RADIUS;
//                       const startY =
//                         fromNode.y + (dy / length) * NODE_VISUAL_RADIUS;
//                       const endX =
//                         toNode.x - (dx / length) * NODE_VISUAL_RADIUS;
//                       const endY =
//                         toNode.y - (dy / length) * NODE_VISUAL_RADIUS;

//                       // Calculate midpoint for label
//                       const midX = (startX + endX) / 2;
//                       const midY = (startY + endY) / 2;

//                       // Calculate label angle (always keep text readable)
//                       const angle = Math.atan2(dy, dx) * (180 / Math.PI);
//                       const labelAngle =
//                         angle > 90 || angle < -90 ? angle + 180 : angle;

//                       // Label text
//                       const labelText = getReadableRelationshipName(
//                         edge.relationshipType || "DEFAULT"
//                       );
//                       const labelWidth = labelText.length * 7 + 16; // Approximate width
//                       const labelHeight = 18;

//                       return (
//                         <g
//                           key={i}
//                           className={edge.isNew ? "animate-edgeFadeIn" : ""}
//                         >
//                           {/* Connection Line */}
//                           <line
//                             x1={startX}
//                             y1={startY}
//                             x2={endX}
//                             y2={endY}
//                             stroke={relStyle.color}
//                             strokeWidth="2"
//                           />

//                           {/* Start dot */}
//                           <circle
//                             cx={startX}
//                             cy={startY}
//                             r="4"
//                             fill={relStyle.color}
//                           />

//                           {/* End dot */}
//                           <circle
//                             cx={endX}
//                             cy={endY}
//                             r="4"
//                             fill={relStyle.color}
//                           />

//                           {/* Relationship Label - rotated to align with line */}
//                           <g
//                             transform={`translate(${midX}, ${midY}) rotate(${labelAngle})`}
//                           >
//                             {/* Background rectangle */}
//                             <rect
//                               x={-labelWidth / 2}
//                               y={-labelHeight / 2}
//                               width={labelWidth}
//                               height={labelHeight}
//                               fill="white"
//                               stroke={relStyle.color}
//                               strokeWidth="1"
//                               rx="4"
//                               opacity="0.95"
//                             />
//                             {/* Text */}
//                             <text
//                               x="0"
//                               y="0"
//                               textAnchor="middle"
//                               dominantBaseline="central"
//                               fill={relStyle.textColor}
//                               fontSize="10"
//                               fontWeight="600"
//                             >
//                               {labelText}
//                             </text>
//                           </g>
//                         </g>
//                       );
//                     })}
//                   </g>
//                 </svg>

//                 <div
//                   className="absolute"
//                   style={{
//                     transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
//                     transformOrigin: "0 0",
//                   }}
//                 >
//                   {nodes.map((node) => (
//                     <NodeComponent
//                       key={node.id}
//                       node={node}
//                       isExpanded={expandedNodes.has(node.id)}
//                       isSelected={selectedNodeId === node.id}
//                       onNodeClick={handleNodeClick}
//                       onDragStart={handleNodeDragStart}
//                       onMouseUp={handleNodeMouseUp} // Passing the new mouse up handler
//                     />
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Controls */}
//           <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2">
//             <button
//               onClick={handleZoomIn}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
//               title="Zoom In"
//             >
//               <ZoomIn className="w-5 h-5 text-gray-700" />
//             </button>
//             <button
//               onClick={handleZoomOut}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
//               title="Zoom Out"
//             >
//               <ZoomOut className="w-5 h-5 text-gray-700" />
//             </button>
//             <button
//               onClick={handleResetView}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
//               title="Reset View"
//             >
//               <Shrink className="w-5 h-5 text-gray-700" />
//             </button>
//           </div>

//           {/* Relationship Legend */}
//           <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 max-w-xs">
//             <h3 className="text-xs font-light text-gray-700 mb-2">
//               Relationship Types
//             </h3>
//             <div className="space-y-2">
//               {Object.entries(relationshipConfig)
//                 .filter(([key]) => key !== "DEFAULT")
//                 .map(([type, config]) => (
//                   <div key={type} className="flex items-center gap-2">
//                     <div className="flex items-center gap-1">
//                       <div
//                         className="w-1 h-1 rounded-full"
//                         style={{ backgroundColor: config.color }}
//                       ></div>
//                       <div
//                         className="w-6 h-0.5"
//                         style={{ backgroundColor: config.color }}
//                       ></div>
//                       <div
//                         className="w-1 h-1 rounded-full"
//                         style={{ backgroundColor: config.color }}
//                       ></div>
//                     </div>
//                     <span className="text-xs font-light text-gray-700">
//                       {config.allias}
//                     </span>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>

//         {/* Footer Info */}
//         <div className="bg-gray-50 border-t border-gray-200 p-3 text-sm font-thin text-gray-600 flex justify-between">
//           <span>
//             <span className="font-light text-gray-900">{nodes.length}</span>{" "}
//             document{nodes.length !== 1 ? "s" : ""} •
//             <span className="font-light ml-1 text-gray-900">
//               {edges.length}
//             </span>{" "}
//             connection{edges.length !== 1 ? "s" : ""}
//           </span>
//           <span className="text-xs text-gray-400">
//             Drag nodes or background to interact
//           </span>
//         </div>
//       </div>

//       {/* Tooltip for gov_01 node */}
//       {showTooltip && (
//         <div
//           className="fixed z-[100] pointer-events-none"
//           style={{
//             left: tooltipPosition.x,
//             top: tooltipPosition.y - 50,
//             transform: "translateX(-50%)",
//           }}
//         >
//           <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm whitespace-nowrap animate-tooltipFadeIn">
//             This is the root node
//             <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
//               <div className="border-8 border-transparent border-t-gray-900"></div>
//             </div>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//           }
//           to {
//             transform: translateX(0);
//           }
//         }

//         .animate-slideIn {
//           animation: slideIn 0.3s ease-out;
//         }

//         @keyframes nodeAppear {
//           from {
//             opacity: 0;
//             transform: scale(0.5);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }

//         .animate-nodeAppear {
//           animation: nodeAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
//         }

//         @keyframes edgeFadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }

//         .animate-edgeFadeIn {
//           animation: edgeFadeIn 0.5s ease-in;
//         }

//         @keyframes tooltipFadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-tooltipFadeIn {
//           animation: tooltipFadeIn 0.2s ease-out;
//         }
//       `}</style>
//     </>
//   );
// };

// export default TracePane;


import { useEffect, useState, useRef, useCallback } from "react";
import {
  X,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Shrink,
  CircleAlert,
  Focus, // Icon for Isolation Toggle
} from "lucide-react";
import { getReadableRelationshipName } from "../utils/relationshipUtils";

const TracePane = ({ documentId, onClose, onNodeSelect }) => {
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
  // ⭐ NEW STATE: Isolation Mode Toggle
  const [isIsolationMode, setIsIsolationMode] = useState(false); 
  
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // --- Relationship Type Configuration ---
  const relationshipConfig = {
    AS_DOCUMENT: {
      allias: "Government Publication",
      color: "#06B6D4", // Cyan
      textColor: "#0E7490",
      bgColor: "bg-cyan-50",
      angle: 0, // Right (0 degrees)
      angleRange: [-30, 30], // Wider spread
    },
    AMENDS: {
      allias: "Amendment",
      color: "#14B8A6", // Teal
      textColor: "#0F766E",
      bgColor: "bg-teal-50",
      angle: 90, // Top
      angleRange: [60, 120],
    },
    REFERS_TO: {
      allias: "Refers To",
      color: "#6366F1", // Indigo
      textColor: "#4338CA",
      bgColor: "bg-indigo-50",
      angle: 180, // Left
      angleRange: [150, 210],
    },
  };

  const getRelationshipStyle = (relationshipType) => {
    return (
      relationshipConfig[relationshipType] || relationshipConfig["DEFAULT"]
    );
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

    // ********** FIX: Move data fetch and onNodeSelect here **********
    const connectedDocs = await fetchConnectedDocuments(nodeId);

    if (onNodeSelect && clickedNode) {
      onNodeSelect({
        node: clickedNode,
        connections: connectedDocs || [],
      });
    }
    // ****************************************************************

    // 3. Handle Collapse
    if (expandedNodes.has(nodeId)) {
      // Collapse only this node's direct expansion
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });

      setEdges((prevEdges) => {
        // Remove edges from this node
        const updatedEdges = prevEdges.filter((e) => e.from !== nodeId);

        // Find which nodes are now isolated (no edges left)
        const connectedIds = prevEdges
          .filter((e) => e.from === nodeId)
          .map((e) => e.to);
        const remainingConnectedNodes = new Set([
          ...updatedEdges.map((e) => e.from),
          ...updatedEdges.map((e) => e.to),
        ]);

        // Remove only the nodes that are not used anywhere else
        setNodes((prevNodes) =>
          prevNodes.filter((n) => remainingConnectedNodes.has(n.id) || n.isRoot)
        );

        return updatedEdges;
      });

      // Collapse should also turn off isolation mode if it was active on the collapsing node
      if (isIsolationMode && selectedNodeId === nodeId) {
          setIsIsolationMode(false);
      }
      
      return;
    }

    // ----------------------------------------------------
    // 4. Expansion Logic Starts - ACTIVATE LOADING STATE HERE
    // ----------------------------------------------------
    setIsExpanding(true); // <-- START LOADING/DIMMING STATE

    // Expand node (Mark it as expanded regardless of connections)
    setExpandedNodes((prev) => new Set([...prev, nodeId]));

    // 6. If no documents found, stop the process and clear loading
    if (!clickedNode || !connectedDocs?.length) {
      setIsExpanding(false); // <-- STOP LOADING IMMEDIATELY
      return;
    }

    const baseRadius = 350; // Increased for better spread

    // Group documents by relationship type
    const groupedByType = connectedDocs.reduce((acc, doc) => {
      const type = doc.name || "DEFAULT";
      if (!acc[type]) acc[type] = [];
      acc[type].push(doc);
      return acc;
    }, {});

    const newNodes = [];
    const newEdges = [];

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
        const existingNode = nodes.find((n) => n.id === newNodeId);

        // Calculate angle within the range for this relationship type
        let angle;
        if (docs.length === 1) {
          angle = baseAngle;
        } else {
          // Distribute nodes evenly within the angle range
          const angleSpan = maxAngle - minAngle;
          angle = minAngle + (angleSpan * index) / (docs.length - 1);
        }

        // Add variation to radius for more natural spread (±15%)
        const radiusVariation = baseRadius * (0.85 + Math.random() * 0.3);

        if (!existingNode) {
          const newNode = {
            id: newNodeId,
            x: clickedNode.x + radiusVariation * Math.cos(angle),
            y: clickedNode.y + radiusVariation * Math.sin(angle),
            data: { id: newNodeId, title: displayTitle },
          };
          newNodes.push(newNode);
        }

        newEdges.push({
          from: nodeId,
          to: newNodeId,
          relationshipType: relType,
          direction: doc.direction,
        });
      });
    });

    // Merge unique nodes and edges with animation-ready state
    const nodesToAdd = newNodes.filter(
      (n) => !nodes.some((p) => p.id === n.id)
    );

    setNodes((prev) => [
      ...prev,
      ...nodesToAdd.map((n) => ({ ...n, isNew: true })),
    ]);

    const edgesToAdd = newEdges.filter(
      (e) => !edges.some((p) => p.from === e.from && p.to === e.to)
    );

    setEdges((prev) => [
      ...prev,
      ...edgesToAdd.map((e) => ({ ...e, isNew: true })),
    ]);

    // 7. Remove isNew flag and stop loading after animation delay
    setTimeout(() => {
      setNodes((prev) => prev.map((n) => ({ ...n, isNew: false })));
      setEdges((prev) => prev.map((e) => ({ ...e, isNew: false })));
      setIsExpanding(false); // <-- STOP LOADING AFTER ANIMATION
    }, 50);
  };

  const handleNodeMouseUp = (e, nodeId) => {
    e.stopPropagation();

    // 🛑 Prevent clicking the root "gov_01" node and show tooltip
    if (nodeId === "gov_01") {
      // Show tooltip at mouse position
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setShowTooltip(true);

      // Hide tooltip after 2 seconds
      setTimeout(() => {
        setShowTooltip(false);
      }, 1000);

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
  
  // ⭐ NEW HANDLER: Isolation Mode Toggle
  const handleIsolationToggle = (e, nodeId) => {
    e.stopPropagation(); // Prevent the main node click logic
    if (selectedNodeId === nodeId) {
        setIsIsolationMode(prev => !prev);
    } else {
        // If they click the isolation toggle on a non-selected node, 
        // select it first, then enable isolation.
        handleNodeClick(nodeId);
        setIsIsolationMode(true);
    }
  }

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
    if (e.target.closest(".node-draggable") || e.target.closest(".controls-panel") || e.target.closest(".legend-panel")) return; 
    
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

  // Determine which nodes and edges should be visible in Isolation Mode
  const getVisibleNodes = () => {
    if (!isIsolationMode || !selectedNodeId) return nodes;

    const connectedNodeIds = edges
      .filter(e => e.from === selectedNodeId || e.to === selectedNodeId)
      .flatMap(e => [e.from, e.to]);

    const visibleIds = new Set([...connectedNodeIds, selectedNodeId]);

    return nodes.filter(n => visibleIds.has(n.id));
  };

  const getVisibleEdges = () => {
    if (!isIsolationMode || !selectedNodeId) return edges;

    return edges.filter(e => e.from === selectedNodeId || e.to === selectedNodeId);
  };
  
  const visibleNodes = getVisibleNodes();
  const visibleEdges = getVisibleEdges();


  // --- Render ---

  // Define node dimensions for line calculation
  const NODE_WIDTH = 160;
  const NODE_HEIGHT = 80;
  const NODE_VISUAL_RADIUS = Math.min(NODE_WIDTH, NODE_HEIGHT) / 2; // ~40

  const NodeComponent = ({
    node,
    isExpanded,
    isSelected,
    onDragStart,
    onMouseUp,
    onIsolationToggle, // New prop
  }) => {
    const isGovNode = node.data.id === "gov_01";
    const displayTitle = isGovNode ? "Sri Lanka Gov" : node.data.title;
    const isActiveInIsolation = isIsolationMode && isSelected;
    
    return (
      <div
        key={node.id}
        className={`node node-draggable absolute transition-all duration-300 ${
          node.isNew ? "animate-nodeAppear" : ""
        }`}
        style={{
          left: node.x - NODE_WIDTH / 2, // Center the node div
          top: node.y - NODE_HEIGHT / 2, // Center the node div
          width: NODE_WIDTH,
        }}
        onMouseDown={(e) => onDragStart(e, node.id, node.x, node.y)}
        // NEW: Attach onMouseUp to the node component for reliable click detection
        onMouseUp={(e) => onMouseUp(e, node.id)}
      >
        <div
          className={`
          bg-white rounded-xl border-2 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl 
          ${isGovNode ? "p-4" : "p-3"}
          ${
            node.isRoot
              ? "border-cyan-500 hover:scale-[1.03]"
              : isSelected
              ? "border-cyan-500 bg-cyan-50"
              : "border-gray-300 hover:scale-[1.03]"
          }
          ${isExpanded ? "ring-2 ring-cyan-200 scale-[1.03]" : ""}
          ${isSelected ? "ring-4 ring-cyan-400 shadow-2xl scale-[1.05]" : ""}
          ${draggedNodeId === node.id ? "z-10 shadow-2xl scale-[1.05]" : ""}
        `}
        >
          <div
            className={`flex items-center ${
              isGovNode ? "justify-center" : "items-start"
            } gap-2`}
          >
            <FileText
              className={`w-5 h-5 flex-shrink-0 ${
                node.isRoot
                  ? "text-cyan-500"
                  : isSelected
                  ? "text-cyan-600"
                  : "text-cyan-500"
              }`}
            />
            <div className={`flex-1 ${isGovNode ? "text-center" : "min-w-0"}`}>
              <div
                className={`font-medium text-sm ${
                  isGovNode ? "" : "truncate"
                } ${isSelected ? "text-cyan-800" : "text-cyan-700"}`}
              >
                {displayTitle}
              </div>
              {!isGovNode && (
                <div
                  className={`text-xs truncate ${
                    isSelected ? "text-cyan-600" : "text-gray-500"
                  }`}
                >
                  Gazette: {node.data.id.substring(0, 12)}...
                </div>
              )}
            </div>
            
            {/* ⭐ NEW: Isolation Toggle Button */}
            {isSelected && (
                <button 
                    onClick={(e) => onIsolationToggle(e, node.id)}
                    className={`ml-1 p-1 rounded-full transition-colors duration-200 flex-shrink-0 ${
                        isActiveInIsolation 
                            ? 'bg-cyan-500 text-white hover:bg-cyan-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={isActiveInIsolation ? "Exit Isolation Mode" : "Isolate Node View"}
                >
                    <Focus className="w-4 h-4" />
                </button>
            )}
            {/* ********************************* */}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed ${
          isFullscreen ? "inset-0" : "right-0 top-0 h-full w-full sm:w-2/3"
        } bg-white shadow-2xl z-50 animate-slideIn flex flex-col`}
        ref={containerRef}
      >
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-thin text-gray-900">Document Graph</h2>
            <p className="text-sm text-gray-500 font-light">
              Click documents to see how they connected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-600 hover:cursor-pointer transition-colors duration-200"
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
              className="p-2 text-gray-500 hover:text-gray-600 transition-colors hover:cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className="flex-1 relative bg-gray-50 overflow-hidden"
          onMouseLeave={handleMouseUp}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <CircleAlert className="w-5 h-5 font-thin me-2" />
              <p className="text-lg font-thin text-gray-500">{error}</p>
            </div>
          ) : (
            <>
              {/* NEW: Expansion Loading Spinner Overlay */}
              {isExpanding && ( // <--- ADD THIS BLOCK
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-50/50">
                  <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                </div>
              )}

              <div // <--- MODIFIED: Apply opacity and transition here
                className={`absolute inset-0 ${
                  isDraggingCanvas ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
                  backgroundSize: "25px 25px",
                  // NEW: Apply dimming effect
                  opacity: isExpanding ? 0.4 : 1, // <--- ADD THIS LINE
                  transition: "opacity 0.3s ease-in-out", // <--- ADD THIS LINE
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* MODIFIED: Use visibleEdges */}
                    {visibleEdges.map((edge, i) => {
                      const fromNode = nodes.find((n) => n.id === edge.from);
                      const toNode = nodes.find((n) => n.id === edge.to);
                      if (!fromNode || !toNode) return null;

                      const relStyle = getRelationshipStyle(
                        edge.relationshipType || "DEFAULT"
                      );

                      // Calculate direction vector
                      const dx = toNode.x - fromNode.x;
                      const dy = toNode.y - fromNode.y;
                      const length = Math.sqrt(dx * dx + dy * dy);

                      if (length === 0) return null;

                      // Calculate start and end points (short of the node centers)
                      const startX =
                        fromNode.x + (dx / length) * NODE_VISUAL_RADIUS;
                      const startY =
                        fromNode.y + (dy / length) * NODE_VISUAL_RADIUS;
                      const endX =
                        toNode.x - (dx / length) * NODE_VISUAL_RADIUS;
                      const endY =
                        toNode.y - (dy / length) * NODE_VISUAL_RADIUS;

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

                      return (
                        <g
                          key={i}
                          className={edge.isNew ? "animate-edgeFadeIn" : ""}
                        >
                          {/* Connection Line */}
                          <line
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke={relStyle.color}
                            strokeWidth="2"
                          />

                          {/* Start dot */}
                          <circle
                            cx={startX}
                            cy={startY}
                            r="4"
                            fill={relStyle.color}
                          />

                          {/* End dot */}
                          <circle
                            cx={endX}
                            cy={endY}
                            r="4"
                            fill={relStyle.color}
                          />

                          {/* Relationship Label - rotated to align with line */}
                          <g
                            transform={`translate(${midX}, ${midY}) rotate(${labelAngle})`}
                          >
                            {/* Background rectangle */}
                            <rect
                              x={-labelWidth / 2}
                              y={-labelHeight / 2}
                              width={labelWidth}
                              height={labelHeight}
                              fill="white"
                              stroke={relStyle.color}
                              strokeWidth="1"
                              rx="4"
                              opacity="0.95"
                            />
                            {/* Text */}
                            <text
                              x="0"
                              y="0"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={relStyle.textColor}
                              fontSize="10"
                              fontWeight="600"
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
                      onIsolationToggle={handleIsolationToggle} // New toggle handler
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Controls */}
          <div className="controls-panel absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
              title="Reset View"
            >
              <Shrink className="w-5 h-5 text-gray-700" />
            </button>
            {/* ⭐ NEW: Global Isolation Mode Button */}
            {selectedNodeId && (
                <button
                    onClick={() => setIsIsolationMode(prev => !prev)}
                    className={`p-2 rounded-lg transition-colors hover:cursor-pointer ${
                        isIsolationMode 
                            ? 'bg-cyan-500 text-white hover:bg-cyan-600' 
                            : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    title={isIsolationMode ? "Exit Isolation Mode" : "Isolate Selected Node"}
                >
                    <Focus className="w-5 h-5" />
                </button>
            )}
            {/* ************************************** */}
          </div>

          {/* Relationship Legend */}
          <div className="legend-panel absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 max-w-xs">
            <h3 className="text-xs font-light text-gray-700 mb-2">
              Relationship Types
            </h3>
            <div className="space-y-2">
              {Object.entries(relationshipConfig)
                .filter(([key]) => key !== "DEFAULT")
                .map(([type, config]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: config.color }}
                      ></div>
                      <div
                        className="w-6 h-0.5"
                        style={{ backgroundColor: config.color }}
                      ></div>
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: config.color }}
                      ></div>
                    </div>
                    <span className="text-xs font-light text-gray-700">
                      {config.allias}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 text-sm font-thin text-gray-600 flex justify-between">
          <span>
            <span className="font-light text-gray-900">{nodes.length}</span>{" "}
            document{nodes.length !== 1 ? "s" : ""} •
            <span className="font-light ml-1 text-gray-900">
              {edges.length}
            </span>{" "}
            connection{edges.length !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-gray-400">
            Drag nodes or background to interact
          </span>
        </div>
      </div>

      {/* Tooltip for gov_01 node */}
      {showTooltip && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 50,
            transform: "translateX(-50%)",
          }}
        >
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm whitespace-nowrap animate-tooltipFadeIn">
            This is the root node
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="border-8 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}

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
      `}</style>
    </>
  );
};

export default TracePane;