const router = require('express').Router();
const compose = require('compose-middleware').compose;
const AuthController = require('../controllers/api/auth');
const ViewController = require('../controllers/viewController');

/**
 * Route to render the app main dashboard view.
 */
const dashboardMiddleware = compose([ViewController.renderDashboardView]);
router.get('/', dashboardMiddleware);

module.exports = router;
