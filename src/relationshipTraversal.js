import { RELATION_NODES, RELATION_EDGES } from './relationshipData.js';

// Edges are traversed in both directions for discovery; original source/target and reason
// are preserved so the UI never silently reverses a documented relationship.
export function relationshipNeighborhood(centerId, enabledTypes, maxDepth = 2) {
  const allowed = new Set(enabledTypes);
  const adjacency = new Map(RELATION_NODES.map((node) => [node.id, []]));
  for (const edge of RELATION_EDGES) {
    if (!allowed.has(edge.type)) continue;
    adjacency.get(edge.source)?.push({ nodeId: edge.target, edge });
    adjacency.get(edge.target)?.push({ nodeId: edge.source, edge });
  }
  const distances = new Map();
  const via = new Map();
  if (!adjacency.has(centerId)) return { distances, via };
  distances.set(centerId, 0);
  const queue = [centerId];
  for (let i = 0; i < queue.length; i += 1) {
    const id = queue[i];
    const depth = distances.get(id);
    if (depth >= maxDepth) continue;
    for (const neighbor of adjacency.get(id)) {
      if (distances.has(neighbor.nodeId)) continue;
      distances.set(neighbor.nodeId, depth + 1);
      via.set(neighbor.nodeId, { from: id, edge: neighbor.edge });
      queue.push(neighbor.nodeId);
    }
  }
  return { distances, via };
}

export function describeTwoStepRoute(targetId, via) {
  const last = via.get(targetId);
  if (!last) return null;
  const first = via.get(last.from);
  if (!first) return null;
  const byId = new Map(RELATION_NODES.map((node) => [node.id, node]));
  return {
    throughId: last.from,
    throughTitle: byId.get(last.from)?.title ?? last.from,
    first: first.edge,
    second: last.edge,
  };
}
