/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {zod} from '../third_party/index.js';

import {ToolCategory} from './categories.js';
import {defineTool, timeoutSchema} from './ToolDefinition.js';

export const takeSnapshot = defineTool({
  name: 'take_snapshot',
  description: `Take a text snapshot of the currently selected page based on the a11y tree. The snapshot lists page elements along with a unique
identifier (uid). Always use the latest snapshot. Prefer taking a snapshot over taking a screenshot.`,
  annotations: {
    category: ToolCategory.DEBUGGING,
    // Not read-only due to filePath param.
    readOnlyHint: false,
  },
  schema: {
    verbose: zod
      .boolean()
      .optional()
      .describe(
        'Whether to include all possible information available in the full a11y tree. Default is false.',
      ),
    filePath: zod
      .string()
      .optional()
      .describe(
        'The absolute path, or a path relative to the current working directory, to save the snapshot to instead of attaching it to the response.',
      ),
    filter: zod
      .object({
        ignoreRoles: zod.array(zod.string()).optional(),
        preserveRoles: zod.array(zod.string()).optional(),
      })
      .optional()
      .describe(
        'Specialized filter to include/exclude roles. Default ignores roles: none (aka ignored) and option.',
      ),
  },
  handler: async (request, response) => {
    // Only apply filtering when explicitly provided by the caller.
    const filter = request.params.filter;
    response.includeSnapshot({
      verbose: request.params.verbose ?? false,
      filePath: request.params.filePath,
      filter,
    });
  },
});

export const waitFor = defineTool({
  name: 'wait_for',
  description: `Wait for the specified text to appear on the selected page.`,
  annotations: {
    category: ToolCategory.NAVIGATION,
    readOnlyHint: true,
  },
  schema: {
    text: zod.string().describe('Text to appear on the page'),
    ...timeoutSchema,
  },
  handler: async (request, response, context) => {
    await context.waitForTextOnPage(request.params);

    response.appendResponseLine(
      `Element with text "${request.params.text}" found.`,
    );

    response.includeSnapshot();
  },
});
