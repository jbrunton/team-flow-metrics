import * as express from 'express';
import { syncIssues } from './actions/sync_action';

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const issues = await syncIssues();
    res.json({
      count: issues.length,
      issues: issues
    })
  } catch (e) {
    console.log(e);
    const json = {
      error: e.message,
      data: null
    }
    if (e.response) {
      json.data = e.response.data;
    }
    res.status(500).json(json);
  }
})

module.exports = {
  routerPath: '/sync',
  router: router
}
