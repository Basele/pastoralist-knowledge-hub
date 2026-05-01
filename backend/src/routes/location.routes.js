// location.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/location.controller');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/', optionalAuth, ctrl.list);
router.get('/geojson', optionalAuth, ctrl.geojson);
router.get('/:id', optionalAuth, ctrl.get);
router.post('/', authenticate, ctrl.create);
router.patch('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'ELDER_CUSTODIAN'), ctrl.update);
router.delete('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ctrl.remove);

module.exports = router;
