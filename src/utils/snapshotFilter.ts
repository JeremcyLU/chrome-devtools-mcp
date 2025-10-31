/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type {TextSnapshotNode} from '../McpContext.js';

export interface SnapshotFilterOptions {
  /**
   * Roles to ignore (remove) from the formatted snapshot tree.
   * Example: ['none', 'option']
   */
  ignoreRoles?: string[];
  /**
   * Roles to always keep, even if present in ignoreRoles.
   */
  preserveRoles?: string[];
}

/**
 * Returns a new TextSnapshotNode tree with nodes filtered according to options.
 * - If a node's role is in preserveRoles, it is always kept.
 * - If a node's role is in ignoreRoles, it (and its subtree) is removed.
 * - Otherwise, the node is kept with its filtered children.
 */
export function filterTextSnapshot(
  root: TextSnapshotNode,
  options?: SnapshotFilterOptions,
): TextSnapshotNode {
  const ignore = new Set((options?.ignoreRoles ?? []).map(r => r.toLowerCase()));
  const preserve = new Set(
    (options?.preserveRoles ?? []).map(r => r.toLowerCase()),
  );

  const visit = (node: TextSnapshotNode): TextSnapshotNode | null => {
    const role = (node.role || '').toLowerCase();
    if (preserve.has(role)) {
      // Keep node regardless, but still filter children for consistency.
      const children = node.children
        .map(visit)
        .filter(Boolean) as TextSnapshotNode[];
      return {...node, children};
    }
    if (ignore.has(role)) {
      return null;
    }
    const children = node.children
      .map(visit)
      .filter(Boolean) as TextSnapshotNode[];
    return {...node, children};
  };

  const filtered = visit(root);
  // Root should always exist; if filtered out, fall back to root with filtered children only.
  return filtered ?? {...root, children: []};
}

