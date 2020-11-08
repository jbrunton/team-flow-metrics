import * as express from 'express';
import { syncIssues } from './actions/sync_action';

const router = express.Router()

router.get('/', async (req, res) => {
  const issues = await syncIssues();
  res.json({
    count: issues.length,
    issues: issues
  })
})

module.exports = {
  routerPath: '/sync',
  router: router
}
