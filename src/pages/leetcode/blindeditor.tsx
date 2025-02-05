import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Input, Button, message, Select } from 'antd';
import { FaClock, FaCopy, FaPaste, FaRedo, FaTrash } from 'react-icons/fa';
import problems from '../../../api/leetcode/scraped_problems.json';
import Editor from '@monaco-editor/react';

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Option } = Select;

interface Problem {
  id: string;
  title: string;
  description: string;
  topic: string;
}

const BlindEditor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [problem, setProblem] = useState<Problem | null>(null);
  const [approach, setApproach] = useState<string>('');
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [code, setCode] = useState<string>('// Write your code here');
  const [language, setLanguage] = useState<string>('javascript');
  const [timer, setTimer] = useState(300); // 5 minutes timer
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');

  useEffect(() => {
    if (id) {
      const currentProblem = problems.find((p: Problem) => p.id === id);
      if (currentProblem) {
        setProblem(currentProblem);
      }
    }
  }, [id]);

  // Timer function
  useEffect(() => {
    let interval;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
      // Add your logic for when time runs out (optional)
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const handleApproachSubmit = () => {
    if (!approach.trim()) {
      message.error('Please write your approach before proceeding');
      return;
    }
    setShowEditor(true);
    setIsRunning(true); // Start the timer when the editor is shown
  };

  const handleCodeSubmit = () => {
    message.success('Code submitted successfully!');
    setIsRunning(false); // Stop the timer when code is submitted
    // Simulate code execution (you can replace this with actual backend logic)
    setOutput(`Output for the ${language} code:\n${code}`); // You can modify this to show the actual output
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    message.success('Output copied to clipboard');
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setOutput(text);
      message.success('Output pasted from clipboard');
    });
  };

  const handleClean = () => {
    setCode('');
    setOutput('');
    message.success('Editor cleaned');
  };

  const handleRestart = () => {
    setTimer(300); // Reset timer to 5 minutes
    setIsRunning(true); // Restart the timer
    setOutput(''); // Clear output
    message.success('Editor restarted');
  };

  if (!problem) {
    return <div>Loading...</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: 'black' }}>
      <Sider width={500} theme="light" style={{ padding: '20px', overflowY: 'auto' }}>
        <div className="mb-4 text-blue-600">
          <h1 className="text-xl font-bold">{problem.title}</h1>
          <div className="text-sm text-gray-500 mb-2">Topic: {problem.topic}</div>
          <div
            className="problem-description"
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />
        </div>
        {!showEditor && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Your Approach</h2>
            <TextArea
              rows={6}
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              placeholder="Describe your approach to solve this problem..."
            />
            <Button type="primary" className="mt-4" onClick={handleApproachSubmit}>
              Submit Approach
            </Button>
          </div>
        )}
      </Sider>
      <Content style={{ padding: '20px' }}>
        {showEditor ? (
          <div className="h-full">
            <div className="flex justify-between mb-4 items-center">
              <Select
                value={language}
                onChange={setLanguage}
                style={{ width: '200px' }}
              >
                <Option value="javascript">JavaScript</Option>
                <Option value="python">Python</Option>
                <Option value="c++">C++</Option>
                <Option value="c">C</Option>
              </Select>
              <div className="flex items-center">
                <FaClock className="mr-2" />
                <span>{`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}</span>
              </div>
            </div>
            <Editor
              height="70vh"
              defaultLanguage={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
            <Button type="primary" className="mt-4" onClick={handleCodeSubmit}>
              Submit Solution
            </Button>
            {output && (
              <div className="mt-4 p-4 border rounded-md bg-gray-800 text-white">
                <h3 className="font-semibold text-lg">Output:</h3>
                <pre>{output}</pre>
                <div className="flex space-x-4 mt-2">
                  <Button
                    icon={<FaCopy />}
                    onClick={handleCopy}
                    type="default"
                    className="text-white"
                  >
                    Copy
                  </Button>
                  <Button
                    icon={<FaPaste />}
                    onClick={handlePaste}
                    type="default"
                    className="text-white"
                  >
                    Paste
                  </Button>
                  <Button
                    icon={<FaTrash />}
                    onClick={handleClean}
                    type="default"
                    className="text-white"
                  >
                    Clean
                  </Button>
                  <Button
                    icon={<FaRedo />}
                    onClick={handleRestart}
                    type="default"
                    className="text-white"
                  >
                    Restart
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Submit your approach to start coding
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default BlindEditor;
