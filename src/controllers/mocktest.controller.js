const MockTest = require('../models/mocktest.model');
const Course = require('../models/course.model');


exports.createMockTest = async (req, res) => {
  try {
    const { title, description, duration, questions, course } = req.body;

    if (!title || !description || !duration || !questions || !course) {
      return res.status(400).json({message: 'All fields are required'});
    }

    const courseExists = await Course.findById(course);

    if (!courseExists) {
      return res.status(404).json({message: 'Course not found'});
    }


    const mockTest = new MockTest({
      title,
      description,
      duration,
      questions,
      course
    });

    const savedMockTest = await mockTest.save();

    courseExists.mockTests.push(savedMockTest._id);
    await courseExists.save();

    res.status(201).json({
      success: true,
      message: 'Mock test created successfully.',
      data: savedMockTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the mock test.',
      error: error.message
    });
  }
};


exports.getAllMockTests = async (req, res) => {
  try {
    const mockTests = await MockTest.find().populate('questions').populate('course');
    res.status(200).json({
      success: true,
      data: mockTests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching mock tests.',
      error: error.message
    });
  }
};


exports.getMockTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const mockTest = await MockTest.findById(id).populate('questions').populate('course');

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: mockTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the mock test.',
      error: error.message
    });
  }
};


exports.updateMockTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedMockTest = await MockTest.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    }).populate('questions').populate('course');

    if (!updatedMockTest) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mock test updated successfully.',
      data: updatedMockTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the mock test.',
      error: error.message
    });
  }
};


exports.deleteMockTest = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMockTest = await MockTest.findByIdAndDelete(id);

    if (!deletedMockTest) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mock test deleted successfully.',
      data: deletedMockTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the mock test.',
      error: error.message
    });
  }
};
