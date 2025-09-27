const axios = require('axios');
const pdfParse = require('pdf-parse');
const { getGridFSBucket, mongoose } = require('../config/db');

const groqApiKey = process.env.GROQ_API_KEY;

const explainReport = async (req, res) => {
  try {
    const { fileId, text } = req.body;

    let reportText = text;

    if (!reportText) {
      if (!fileId) {
        return res.status(400).json({ error: 'Either text or fileId is required' });
      }

      // Fetch PDF file from GridFS
      const gridFSBucket = getGridFSBucket();
      const _id = new mongoose.Types.ObjectId(fileId);

      const chunks = [];
      const downloadStream = gridFSBucket.openDownloadStream(_id);

      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      const pdfBuffer = await new Promise((resolve, reject) => {
        downloadStream.on('end', () => {
          resolve(Buffer.concat(chunks));
          // Destroy the stream after reading
          downloadStream.destroy();
        });
        downloadStream.on('error', (err) => {
          reject(err);
        });
      });

      // Extract text from PDF buffer
      const data = await pdfParse(pdfBuffer);
      reportText = data.text;
    }

    if (!reportText || reportText.trim().length === 0) {
      console.error('Extracted text is empty:', reportText);
      return res.status(400).json({ error: 'Extracted text is empty' });
    }

    console.log('Sending text to Groq API, text length:', reportText.length);
    console.log('Text snippet:', reportText.substring(0, 200));

    // Call Groq API with extracted text
    let response;
    try {
      response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful AI assistant that explains medical/lab reports in very simple, clear language so even a non-medical person can understand.'
            },
            {
              role: 'user',
              content: `Please explain this medical/lab report in layman's terms:\n\n${reportText}`
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
    } catch (apiError) {
      console.error('Groq API error:', apiError.response?.data || apiError.message || apiError);
      return res.status(500).json({ error: 'Failed to generate summary from Groq API' });
    }

    let summary = response.data.choices?.[0]?.message?.content || 'No summary available';

    // Post-process summary to format question-answer pairs as bullet points
    // Simple heuristic: split by lines, detect lines ending with '?' as questions
    // and format as bullets with answers on next lines
    const lines = summary.split('\n');
    let formattedSummary = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.endsWith('?')) {
        formattedSummary += `\n• ${line}\n`;
        // Append next line(s) as answer until next question or empty line
        let j = i + 1;
        while (j < lines.length && lines[j].trim() !== '' && !lines[j].trim().endsWith('?')) {
          formattedSummary += `  - ${lines[j].trim()}\n`;
          j++;
        }
        i = j - 1;
      } else {
        formattedSummary += `${line}\n`;
      }
    }
    summary = formattedSummary.trim();

    res.json({ summary });

  } catch (error) {
    console.error('Error in explainReport:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

module.exports = {
  explainReport
};
