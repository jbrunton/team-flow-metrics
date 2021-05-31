const { workerData } = require('worker_threads')

require('ts-node').register()
require(workerData.aliasModule)
