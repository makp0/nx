import { workspaceRoot } from '@nx/devkit';
import { Configuration } from '@rspack/core';
import { isNxRspackComposablePlugin } from './config';
import { readNxJsonFromDisk } from 'nx/src/devkit-internals';

/**
 * Reads the Rspack options from a give Rspack configuration. The configuration can be:
 * 1. A single standard config object
 * 2. A standard function that returns a config object (standard Rspack)
 * 3. An array of standard config objects (multi-configuration mode)
 * 4. A Nx-specific composable function that takes Nx context, rspack config, and returns the config object.
 *
 * @param rspackConfig
 */
export async function readRspackOptions(
  rspackConfig: unknown
): Promise<Configuration[]> {
  const configs: Configuration[] = [];

  const resolveConfig = async (config: Configuration) => {
    if (isNxRspackComposablePlugin(rspackConfig)) {
      config = await rspackConfig(
        {},
        {
          // These values are only used during build-time, so passing stubs here just to read out
          // the returned config object.
          options: {
            root: workspaceRoot,
            projectRoot: '',
            sourceRoot: '',
            outputFileName: '',
            assets: [],
            main: '',
            tsConfig: '',
            outputPath: '',
            rspackConfig: '',
            useTsconfigPaths: undefined,
          },
          context: {
            root: workspaceRoot,
            cwd: undefined,
            isVerbose: false,
            nxJsonConfiguration: readNxJsonFromDisk(workspaceRoot),
            projectGraph: null,
            projectsConfigurations: null,
          },
        }
      );
    } else if (typeof rspackConfig === 'function') {
      config = await rspackConfig(
        {
          production: true, // we want the production build options
        },
        {}
      );
    } else {
      config = rspackConfig;
    }
    return config;
  };

  if (Array.isArray(rspackConfig)) {
    for (const config of rspackConfig) {
      configs.push(await resolveConfig(config));
    }
  } else {
    configs.push(await resolveConfig(rspackConfig));
  }
  return configs;
}
