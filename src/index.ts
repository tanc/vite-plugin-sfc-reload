import { resolve, relative } from 'path'
import { green, red, dim } from 'chalk'
import picomatch from 'picomatch'
import type { Plugin, ViteDevServer } from 'vite'
import fetch from 'node-fetch'

/**
 * Configuration for the watched paths.
 */
interface Config {
  /**
   * Whether full reload should happen regardless of the file path.
   * @default true
   */
  always?: boolean

  /**
   * How many milliseconds to wait before reloading the page after a file change.
   * @default 0
   */
  delay?: number

  /**
   * Whether to log when a file change triggers a full reload.
   * @default true
   */
  log?: boolean

  /**
   * Files will be resolved against this path.
   * @default process.cwd()
   */
  root?: string

  /**
   * The (local) domain the Drupal site can be found at.
   * @default 'http://localhost'
   */
  domain?: string
}

interface responseData {
  template: boolean

  css: boolean

  js: boolean
}

/**
 * Allows to automatically reload the page when a watched file changes.
 */
export default (paths: string | string[], config: Config = {}): Plugin => ({
  name: 'vite-plugin-sfc-reload',

  apply: 'serve',

  // NOTE: Enable globbing so that Vite keeps track of the template files.
  config: () => ({ server: { watch: { disableGlobbing: false } } }),

  configureServer({ watcher, ws, config: { logger } }: ViteDevServer) {
    const {
      root = process.cwd(),
      log = true,
      always = true,
      delay = 0,
      domain = 'http://localhost',
    } = config

    const files = Array.from(paths).map((path) => resolve(root, path))
    const shouldReload = picomatch(files)
    const checkReload = async (path: string) => {
      if (shouldReload(path)) {
        // Todo: full reload on Drupal template files.

        // Try the SFC endpoint on the Drupal site. This requires having the
        // sfc_dev module enabled so print a message if a 404 is returned.
        const checkStatus = (response: any) => {
          if (response.ok) {
            // response.status >= 200 && response.status < 300
            return response
          } else {
            throw 'Failure'
          }
        }

        const filePath = relative(root, path)
        const fetchUrl = `${domain}/sfc/compile`

        const response = await fetch(fetchUrl, {
          method: 'POST',
          body: JSON.stringify({ componentPath: filePath }),
          headers: { 'Content-Type': 'application/json' },
        })

        try {
          if (checkStatus(response)) {
            const responseData = (await response.json()) as responseData
            if (
              Object.keys(responseData).length > 0 &&
              responseData.template === true
            ) {
              setTimeout(
                () =>
                  ws.send({ type: 'full-reload', path: always ? '*' : path }),
                delay
              )
              if (log)
                logger.info(
                  `${green('template update caused page reload')} ${dim(
                    relative(root, path)
                  )}`,
                  { clear: true, timestamp: true }
                )
            }
          }
        } catch {
          if (log)
            logger.info(
              `${red(`unable to access ${fetchUrl}`)} ${dim(
                'have you enabled the sfc_dev module?'
              )}`,
              { clear: true, timestamp: true }
            )
        }
      }
    }

    // Ensure Vite keeps track of the files and triggers HMR as needed.
    watcher.add(files)

    // Do a full page reload if any of the watched files changes.
    watcher.on('add', checkReload)
    watcher.on('change', checkReload)
  },
})
