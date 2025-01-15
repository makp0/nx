# Function: readCachedProjectGraph

▸ **readCachedProjectGraph**(): [`ProjectGraph`](../../devkit/documents/ProjectGraph) & \{ `computedAt`: `number` ; `errors`: `ProjectGraphErrorTypes`[] }

Synchronously reads the latest cached copy of the workspace's ProjectGraph.

#### Returns

[`ProjectGraph`](../../devkit/documents/ProjectGraph) & \{ `computedAt`: `number` ; `errors`: `ProjectGraphErrorTypes`[] }

**`Throws`**

if there is no cached ProjectGraph to read from
