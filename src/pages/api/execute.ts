import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import os from 'os';

type ExecuteResponse = {
  output: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecuteResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ output: 'Method not allowed' });
  }

  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ output: 'Language and code are required' });
  }

  const tempDir = os.tmpdir();
  const fileId = uuidv4();
  
  try {
    let fileName: string;
    let executeCommand: string;

    switch (language) {
      case 'python':
        fileName = `${fileId}.py`;
        executeCommand = `python ${fileName}`;
        break;
      case 'java':
        fileName = 'Main.java';
        executeCommand = `javac ${fileName} && java Main`;
        break;
      case 'cpp':
        fileName = `${fileId}.cpp`;
        executeCommand = `g++ ${fileName} -o ${fileId} && ./${fileId}`;
        break;
      case 'c':
        fileName = `${fileId}.c`;
        executeCommand = `gcc ${fileName} -o ${fileId} && ./${fileId}`;
        break;
      case 'ruby':
        fileName = `${fileId}.rb`;
        executeCommand = `ruby ${fileName}`;
        break;
      case 'r':
        fileName = `${fileId}.r`;
        executeCommand = `Rscript ${fileName}`;
        break;
      default:
        return res.status(400).json({ output: 'Unsupported language' });
    }

    const filePath = path.join(tempDir, fileName);
    await writeFile(filePath, code);

    exec(executeCommand, { cwd: tempDir, timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ output: stderr || error.message });
      }
      return res.status(200).json({ output: stdout || stderr });
    });
  } catch (error) {
    return res.status(500).json({ 
      output: 'Error executing code',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
