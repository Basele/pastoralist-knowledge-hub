const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/knowledge.controller');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/', optionalAuth, ctrl.list);
router.get('/:id', optionalAuth, ctrl.get);
router.post('/', authenticate, ctrl.create);
router.patch('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);
router.patch('/:id/review', authenticate, requireRole('ELDER_CUSTODIAN', 'ADMIN', 'SUPER_ADMIN'), ctrl.review);

module.exports = router;
