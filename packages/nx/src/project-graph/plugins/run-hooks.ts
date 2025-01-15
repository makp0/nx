import type { PostRunContext, PreRunContext } from './public-api';
import type { LoadedNxPlugin } from './loaded-nx-plugin';
import { isIsolationEnabled } from './isolation/enabled';

export async function runPreRun(
  plugins: LoadedNxPlugin[],
  pluginContext: PreRunContext
) {
  performance.mark(`preRun:start`);
  const envs = await Promise.all(
    plugins
      .filter((p) => p.preRun)
      .map(async (plugin) => {
        performance.mark(`${plugin.name}:preRun:start`);
        try {
          return await plugin.preRun(pluginContext);
        } finally {
          performance.mark(`${plugin.name}:preRun:end`);
          performance.measure(
            `${plugin.name}:preRun`,
            `${plugin.name}:preRun:start`,
            `${plugin.name}:preRun:end`
          );
        }
      })
  );
  if (isIsolationEnabled()) {
    for (const env of envs) {
      for (const key in env) {
        process.env[key] = env[key];
      }
    }
  }
  performance.mark(`preRun:end`);
  performance.measure(`preRun`, `preRun:start`, `preRun:end`);
}

export async function runPostRun(
  plugins: LoadedNxPlugin[],
  context: PostRunContext
) {
  performance.mark(`postRun:start`);
  await Promise.all(
    plugins
      .filter((p) => p.postRun)
      .map(async (plugin) => {
        performance.mark(`${plugin.name}:postRun:start`);
        try {
          await plugin.postRun(context);
        } finally {
          performance.mark(`${plugin.name}:postRun:end`);
          performance.measure(
            `${plugin.name}:postRun`,
            `${plugin.name}:postRun:start`,
            `${plugin.name}:postRun:end`
          );
        }
      })
  );
  performance.mark(`postRun:end`);
  performance.measure(`postRun`, `postRun:start`, `postRun:end`);
}
