import { workspaceRoot } from '@nx/devkit';
import { isNxWebpackComposablePlugin } from '../config';
import { Configuration } from 'webpack';
import { readNxJsonFromDisk } from 'nx/src/devkit-internals';

/**
 * Reads the webpack options from a give webpack configuration. The configuration can be:
 * 1. A standard config object
 * 2. A standard function that returns a config object (webpack.js.org/configuration/configuration-types/#exporting-a-function)
 * 3. An array of standard config objects (multi-configuration mode)
 * 4. A Nx-specific composable function that takes Nx context, webpack config, and returns the config object.
 *
 * @param webpackConfig
 */
export async function readWebpackOptions(
  webpackConfig: unknown
): Promise<Configuration[]> {
  const configs: Configuration[] = [];

  const resolveConfig = async (config: Configuration) => {
    if (isNxWebpackComposablePlugin(webpackConfig)) {
      config = await webpackConfig(
        {},
        {
          // These values are only used during build-time, so passing stubs here just to read out
          // the returned config object.
          options: {
            root: workspaceRoot,
            projectRoot: '',
            sourceRoot: '',
            outputFileName: undefined,
            outputPath: undefined,
            assets: undefined,
            useTsconfigPaths: undefined,
          },
          context: {
            root: workspaceRoot,
            cwd: undefined,
            isVerbose: false,
            projectsConfigurations: null,
            projectGraph: null,
            nxJsonConfiguration: readNxJsonFromDisk(workspaceRoot),
          },
        }
      );
    } else if (typeof webpackConfig === 'function') {
      config = await webpackConfig(
        {
          production: true, // we want the production build options
        },
        {}
      );
    } else {
      config = webpackConfig;
    }
    return config;
  };

  if (Array.isArray(webpackConfig)) {
    for (const config of webpackConfig) {
      configs.push(await resolveConfig(config));
    }
  } else {
    configs.push(await resolveConfig(webpackConfig));
  }
  return configs;
}
