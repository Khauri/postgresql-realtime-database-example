// very basic example of a restful api
import {Router} from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json('success');
});

export default router;