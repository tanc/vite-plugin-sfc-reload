<h2 align='center'><samp>vite-plugin-sfc-reload</samp></h2>

<p align='center'>Automatically reload the page when `<template>` sections of Drupal SFC files are modified</p>

<p align='center'>
  <a href='https://www.npmjs.com/package/vite-plugin-sfc-reload'>
    <img src='https://img.shields.io/npm/v/vite-plugin-sfc-reload?color=222&style=flat-square'>
  </a>
  <a href='https://github.com/tanc/vite-plugin-sfc-reload/blob/main/LICENSE.txt'>
    <img src='https://img.shields.io/badge/license-MIT-blue.svg'>
  </a>
</p>

<br>

Based on the vite-plugin-full-reload plugin and adapted for use with SFC Drupal files.
[vite-plugin-full-reload]: https://github.com/ElMassimo/vite-plugin-full-reload

## Why?

When developing a Drupal theme based on Single File Components it can be very useful to have both Hot Module Reloads of the CSS files as well as full page reloads if the `<template>` section changes. This plugin will watch the SFC files for changes and POST the changed component name to the `sfc/compile` callback which in turn will report back which section of the file was updated. Then the plugin decides whether the HMR is sufficient (it does nothing as HMR is already take care of) or if it should trigger a full page refresh which is needed to display template changes.

## Installation 💿

Install the package as a development dependency:

```bash
npm i -D vite-plugin-sfc-reload # yarn add -D vite-plugin-sfc-reload
```

## Usage 🚀

Add it to your plugins in `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import SfcReload from 'vite-plugin-sfc-reload'

export default defineConfig({
  plugins: [SfcReload(["components/**/*.sfc"], { domain: "http://yourlocaldomain.dev" })],
})
```

This is useful to trigger a page refresh for files that are not being imported, such as server-rendered templates.

To see which file globbing options are available, check [picomatch].

## Configuration ⚙️

The following options can be provided:

- <kbd>domain</kbd>
  
  The local development domain where the sfc_dev module is installed and responding on `/sfc/compile`

  **Default:** `http://localhost`

- <kbd>root</kbd>

  Files will be resolved against this directory.

  **Default:** `process.cwd()`

  ```js
  SfcReload('components/**/*.sfc', { root: __dirname }),
  ```

- <kbd>delay</kbd>

  How many milliseconds to wait before reloading the page after a file change.
  It can be used to offset slow template compilation in Rails.

  **Default:** `0`

  ```js
  SfcReload('components/**/*.sfc', { delay: 100 })
  ```

- <kbd>always</kbd>

  Whether to refresh the page even if the modified HTML file is not currently being displayed.

  **Default:** `true`

  ```js
  SfcReload('components/**/*.sfc', { always: false })
  ```

## Acknowledgements

- <kbd>[vite-plugin-full-reload]: https://github.com/ElMassimo/vite-plugin-full-reload</kbd>

  The original plugin this is **heavily** based on (forked off of), thank you!

## License

This library is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
