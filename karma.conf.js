// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-edge-launcher'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution order
        random: true
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/employee-app'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcov' }
      ],
      check: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['EdgeAsChrome'],
    customLaunchers: {
      EdgeAsChrome: {
        base: 'Chrome',
        cmd: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        flags: [
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--window-size=1920,1080',
          '--disable-extensions',
          '--disable-default-apps'
        ]
      },
      EdgeHeadless: {
        base: 'Chrome',
        cmd: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        flags: [
          '--headless',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--window-size=1920,1080',
          '--disable-extensions',
          '--disable-default-apps',
          '--disable-translate',
          '--disable-sync'
        ]
      },
      EdgeCI: {
        base: 'Chrome',
        cmd: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        flags: [
          '--headless',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--remote-debugging-port=9222',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--window-size=1920,1080',
          '--disable-extensions',
          '--disable-default-apps',
          '--disable-translate',
          '--disable-sync'
        ]
      }
    },
    restartOnFileChange: true,
    singleRun: false,
    captureTimeout: 60000,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout: 60000,
    browserNoActivityTimeout: 60000,
    // Configuración específica para Edge
    hostname: 'localhost',
    urlRoot: '/',
    retryLimit: 2
  });
};