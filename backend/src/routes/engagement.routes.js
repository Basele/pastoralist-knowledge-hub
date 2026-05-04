const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to get :id from parent
const ctrl = require('../controllers/engagement.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// Comments
router.get('/comments', ctrl.listComments);
router.post('/comments', authenticate, ctrl.createComment);
router.delete('/comments/:commentId', authenticate, ctrl.deleteComment);
router.patch('/comments/:commentId/moderate', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'ELDER_CUSTODIAN'), ctrl.moderateComment);

// Reviews
router.get('/reviews', authenticate, ctrl.listReviews);
router.post('/review', authenticate, requireRole('ELDER_CUSTODIAN', 'ADMIN', 'SUPER_ADMIN'), ctrl.submitReview);

// Consent
router.get('/consent', authenticate, ctrl.listConsent);
router.post('/consent', authenticate, requireRole('ELDER_CUSTODIAN', 'ADMIN', 'SUPER_ADMIN'), ctrl.grantConsent);
router.delete('/consent/:grantId', authenticate, requireRole('ELDER_CUSTODIAN', 'ADMIN', 'SUPER_ADMIN'), ctrl.revokeConsent);

module.exports = router;
