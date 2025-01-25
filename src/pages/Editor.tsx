import React, { useState } from 'react';
import { Box, Select, Button, Text, Flex, useToast } from '@chakra-ui/react';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';

const Editor: React.FC = () => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const toast = useToast();

  const languageOptions = [
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'r', label: 'R' },
  ];

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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(getDefaultCode(newLang));
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      const response = await axios.post('/api/execute', {
        language,
        code
      });
      setOutput(response.data.output);
    } catch (error) {
      toast({
        title: 'Error executing code',
        description: 'There was an error running your code. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setOutput('Error executing code');
    }
    setIsRunning(false);
  };

  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Flex mb={4} gap={4} alignItems="center">
        <Select
          value={language}
          onChange={handleLanguageChange}
          w="200px"
        >
          {languageOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Button
          colorScheme="blue"
          onClick={runCode}
          isLoading={isRunning}
        >
          Run Code
        </Button>
      </Flex>

      <Box mb={4} border="1px" borderColor="gray.200" borderRadius="md">
        <MonacoEditor
          height="400px"
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
      </Box>

      <Box>
        <Text fontWeight="bold" mb={2}>Output:</Text>
        <Box
          p={4}
          bg="gray.50"
          borderRadius="md"
          fontFamily="monospace"
          whiteSpace="pre-wrap"
          minH="100px"
        >
          {output || 'Run your code to see the output here'}
        </Box>
      </Box>
    </Box>
  );
};

export default Editor;
