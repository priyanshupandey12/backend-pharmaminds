const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller'); 
const authorizeRole=require('../middleware/auth.middleware');

// Routes for Questions
router.post('/',authorizeRole(['admin']), questionController.createQuestion); 
router.get('/', authorizeRole(['admin']), questionController.getAllQuestions); 
router.get('/:id', authorizeRole(['admin']), questionController.getQuestionById); 
router.patch('/:id', authorizeRole(['admin']), questionController.updateQuestion); 
router.delete('/:id',authorizeRole(['admin']), questionController.deleteQuestion); 

module.exports = router;
