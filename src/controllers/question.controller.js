const Question = require('../models/question.model'); 
const MockTest=require('../models/mocktest.model')


exports.createQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer, explanation, mockTest, difficultyLevel } = req.body;

    if (!questionText || !options || !correctAnswer || !mockTest || !difficultyLevel) {
      return res.status(400).json({ message: 'All fields are required' });
    }
   
    const mocktest=await MockTest.findById(mockTest);

    if (!mocktest) {
      return res.status(404).json({ message: 'Mock Test not found' });
    }

    const question = new Question({
      questionText,
      options,
      correctAnswer,
      explanation,
      mockTest,
      difficultyLevel,
    });

    const savedQuestion = await question.save();
    mocktest.questions.push(savedQuestion._id);
    await mocktest.save();
    res.status(201).json({
      success: true,
      message: 'Question created successfully.',
      data: savedQuestion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the question.',
      error: error.message,
    });
  }
};


exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate('mockTest');
    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching questions.',
      error: error.message,
    });
  }
};


exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id).populate('mockTest');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the question.',
      error: error.message,
    });
  }
};


exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).populate('mockTest');

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      data: updatedQuestion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the question.',
      error: error.message,
    });
  }
};

// Delete a question
// exports.deleteQuestion = async (req, res) => {
//   try {
//     const { id } = req.params;



//     const deletedQuestion = await Question.findByIdAndDelete(id);

//     if (!deletedQuestion) {
//       return res.status(404).json({
//         success: false,
//         message: 'Question not found.',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Question deleted successfully.',
//       data: deletedQuestion,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'An error occurred while deleting the question.',
//       error: error.message,
//     });
//   }
// };

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the question to delete
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    // Remove the question from the associated mockTest
    const mockTest = await MockTest.findById(question.mockTest);
    if (mockTest) {
      // Remove the question ID from the mockTest's questions array
      mockTest.questions = mockTest.questions.filter(q => q.toString() !== id);
      await mockTest.save();
    }

    // Delete the question from the Question collection
    const deletedQuestion = await Question.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully.',
      data: deletedQuestion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the question.',
      error: error.message,
    });
  }
};

