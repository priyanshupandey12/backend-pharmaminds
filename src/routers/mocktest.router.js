const express = require('express');
const router = express.Router();
const mockTestController = require('../controllers/mocktest.controller'); 
const authorizeRole=require('../middleware/auth.middleware');

// Routes for Mock Test
router.post('/',authorizeRole(['admin']), mockTestController.createMockTest); 
router.get('/',authorizeRole(['admin']), mockTestController.getAllMockTests); 
router.get('/:id',authorizeRole(['admin']), mockTestController.getMockTestById); 
router.put('/:id', authorizeRole(['admin']), mockTestController.updateMockTest); 
router.delete('/:id',authorizeRole(['admin']), mockTestController.deleteMockTest); 

module.exports = router;
