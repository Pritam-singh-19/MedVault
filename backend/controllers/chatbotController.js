const axios = require('axios');

const groqApiKey = process.env.GROQ_API_KEY;

const chatbotQuery = async (req, res) => {
  try {
    const { query, reportText } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Build prompt and system message based on context
    let systemContent;
    let userContent;
    if (reportText && reportText.trim() !== "") {
      systemContent =
        'You are a helpful AI assistant that answers questions related to medical/lab reports based on the provided report text.';
      userContent = `Report context:\n${reportText}\n\nUser question:\n${query}`;
    } else {
      systemContent =
        'You are a helpful AI assistant that answers general health, medicine, and medical questions for users.';
      userContent = `User question:\n${query}`;
    }

    // Call Groq API with user query and context
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemContent
          },
          {
            role: 'user',
            content: userContent
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`
        }
      }
    );

    const answer = response.data.choices?.[0]?.message?.content || 'No answer available';

    res.json({ answer });
  } catch (error) {
    console.error('Error in chatbotQuery:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to get answer from Groq API' });
  }
};

module.exports = {
  chatbotQuery
};