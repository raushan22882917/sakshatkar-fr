import { Request, Response } from 'express';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

const extractTextFromPDF = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  
  return text;
}

const extractTextFromDOC = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function analyzeResume(req: Request, res: Response) {
  try {
    const { resumeUrl } = req.body;

    if (!resumeUrl) {
      return res.status(400).json({ error: 'Resume URL is required' });
    }

    let resumeText = '';

    // Determine file type and extract text accordingly
    if (resumeUrl.toLowerCase().endsWith('.pdf')) {
      resumeText = await extractTextFromPDF(resumeUrl);
    } else if (resumeUrl.toLowerCase().match(/\.(doc|docx)$/)) {
      resumeText = await extractTextFromDOC(resumeUrl);
    } else {
      throw new Error('Unsupported file format. Please provide a PDF or DOC/DOCX file.');
    }

    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ API key is not configured' });
    }

    const systemPrompt = `You are an expert HR interviewer. Analyze the following resume and create:
1. 3 personalized interview questions based on the candidate's experience
2. 3 technical questions based on the technologies and skills mentioned
3. 2 behavioral questions related to their past roles
4. 2 HR questions about their career goals and aspirations
Format the response as JSON with these arrays: "questions", "technicalQuestions", "behavioralQuestions", "hrQuestions"`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: resumeText,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze resume with GROQ API');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Resume analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze resume' });
  }
}
