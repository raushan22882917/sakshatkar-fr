import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Language {
  value: string;
  label: string;
  id: number;
}

interface ExampleResponse {
  language: string;
  language_id: number;
  example_code: string;
}

const Editor: React.FC = () => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const languageOptions: Language[] = [
    { value: 'python', label: 'Python', id: 71 },
    { value: 'java', label: 'Java', id: 62 },
    { value: 'cpp', label: 'C++', id: 54 },
    { value: 'c', label: 'C', id: 50 },
    { value: 'ruby', label: 'Ruby', id: 72 },
    { value: 'r', label: 'R', id: 80 },
  ];

  useEffect(() => {
    // Load example code when language changes
    const loadExampleCode = async () => {
      try {
        const response = await axios.get<ExampleResponse>(`http://localhost:8000/api/example/${language}`);
        setCode(response.data.example_code);
      } catch (error) {
        console.error('Error loading example code:', error);
        // Fallback to default code if API fails
        setCode(getDefaultCode(language));
      }
    };

    loadExampleCode();
  }, [language]);

  const getDefaultCode = (lang: string) => {
    switch (lang) {
      case 'python':
        return 'print("Hello, World!")';
      case 'java':
        return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
      case 'cpp':
        return `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;
      case 'c':
        return `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;
      case 'ruby':
        return 'puts "Hello, World!"';
      case 'r':
        return 'print("Hello, World!")';
      default:
        return '';
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      const selectedLang = languageOptions.find(lang => lang.value === language);
      if (!selectedLang) throw new Error('Invalid language selected');

      const response = await axios.post('http://localhost:8000/api/execute', {
        code,
        language_id: selectedLang.id,
        stdin: '',
      });

      const { status, output, error, execution_time, memory } = response.data;

      if (status === 'success') {
        setOutput(`Output:\n${output}\n\nExecution Time: ${execution_time}s\nMemory Used: ${memory}KB`);
        toast({
          title: "Code executed successfully",
          description: "Check the output below",
        });
      } else if (status === 'compilation_error') {
        throw new Error(`Compilation Error:\n${error}`);
      } else if (status === 'wrong_answer') {
        throw new Error(`Wrong Answer:\nYour output: ${output}\nExpected: ${response.data.expected}`);
      } else {
        throw new Error(error || 'An error occurred during execution');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while executing the code';
      toast({
        variant: "destructive",
        title: "Error running code",
        description: errorMessage,
      });
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleRunCode}
          disabled={isRunning}
          className="ml-auto"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            'Run Code'
          )}
        </Button>
      </div>

      <div className="h-[500px] border rounded-md">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Output:</h3>
        <pre className="bg-secondary p-4 rounded-md whitespace-pre-wrap font-mono">
          {output || 'Run your code to see the output here'}
        </pre>
      </div>
    </div>
  );
};

export default Editor;
