const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  res.json({
    issues: [
      { key: 'DEMO-101', title: 'Demo Issue 101' },
      { key: 'DEMO-102', title: 'Demo Issue 102' }
    ]
  })
})

module.exports = {
  routerPath: '/issues',
  router: router
}
