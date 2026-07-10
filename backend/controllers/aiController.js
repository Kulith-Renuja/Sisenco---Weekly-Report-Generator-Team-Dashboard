const { GoogleGenerativeAI } = require('@google/generative-ai');
const Report = require('../models/Report');

// Initialize the Gemini API Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc    Ask the AI Assistant a question about the team reports
 * @route   POST /api/ai/chat
 * @access  Private (Manager only)
 */
const askAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server.' });
    }

    // 1. Fetch recent reports (limit to 100 to avoid exceeding payload limits)
    const reports = await Report.find({})
      .populate('user', 'name')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    // 2. Map data into a clean, minimized JSON format for the AI prompt
    const minimizedData = reports.map((r) => ({
      userName: r.user?.name || 'Unknown',
      projectName: r.project?.name || 'Unknown',
      weekStartDate: r.weekStartDate,
      weekEndDate: r.weekEndDate,
      tasksCompleted: r.tasksCompleted,
      blockers: r.blockers,
    }));

    // 3. Initialize the specific model version
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 4. Construct a strong System Instruction prompt
    const prompt = `
      You are a helpful manager assistant for a software team. 
      Here is the team's recent weekly report data in JSON format:
      
      ${JSON.stringify(minimizedData)}
      
      Use the dates, usernames, project names, completed tasks, and blockers in the JSON to accurately answer the user's question: 
      "${question}"
      
      Keep your answer concise, professional, and directly address the user's query based ONLY on the provided data. Do not make up information.
    `;

    // 5. Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. Return response to frontend
    res.status(200).json({ answer: text });
  } catch (error) {
    console.error('Error in askAssistant:', error.message);
    res.status(500).json({ message: 'Error processing AI request. Please try again later.' });
  }
};

module.exports = {
  askAssistant,
};
