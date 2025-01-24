import { useState, useEffect, useRef } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Copy, Layout } from "lucide-react";
import { CodeOutput } from "./CodeOutput";
import { codeExecutionService } from "@/services/codeExecutionService";
import * as monaco from 'monaco-editor';
import { TestCases, TestCase } from "./TestCases";
import { useToast } from "@/components/ui/use-toast";

const languages = [
  { id: "python", name: "Python", extension: ".py" },
  { id: "javascript", name: "JavaScript", extension: ".js" },
  { id: "typescript", name: "TypeScript", extension: ".ts" },
  { id: "java", name: "Java", extension: ".java" },
  { id: "cpp", name: "C++", extension: ".cpp" },
];

interface CodeEditorProps {
  onChange: (value: string | undefined) => void;
  value: string;
  initialLanguage?: string;
  testCases?: TestCase[];
  onTestCasesChange?: (testCases: TestCase[]) => void;
}

export default function CodeEditor({ 
  onChange, 
  value, 
  initialLanguage = "javascript",
  testCases = [],
  onTestCasesChange = () => {}
}: CodeEditorProps) {
  const { toast } = useToast();
  const [language, setLanguage] = useState(initialLanguage);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add custom commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });

    // Configure editor
    configureEditorForLanguage(language, monaco);
  };

  // Configure editor settings for specific language
  const configureEditorForLanguage = (lang: string, monaco: Monaco) => {
    const config: monaco.editor.IStandaloneEditorConstructionOptions = {
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: isExecuting,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: "on",
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      quickSuggestions: true,
      snippetSuggestions: "top",
      renderWhitespace: "selection",
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    };

    // Language-specific settings
    switch (lang) {
      case "python":
        config.insertSpaces = true;
        config.tabSize = 4;
        break;
      case "java":
        config.insertSpaces = true;
        config.tabSize = 4;
        break;
      default:
        config.insertSpaces = true;
        config.tabSize = 2;
    }

    editorRef.current?.updateOptions(config);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setOutput(null);
    setError(null);
    if (monacoRef.current) {
      configureEditorForLanguage(value, monacoRef.current);
    }
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    setIsExecuting(true);
    setOutput(null);
    setError(null);

    try {
      // Get the first test case as sample input
      const sampleInput = testCases[0]?.input || '';
      
      const result = await codeExecutionService.executeCode({
        code: `${editorRef.current?.getValue() || ""}\n\n// Sample input:\n${sampleInput}\n`,
        language,
        input: sampleInput
      });

      if (result.error) {
        setError(result.error);
      } else {
        setOutput(result.output);
        
        // Check if output matches the expected output
        const cleanActualOutput = result.output.trim().replace(/\s+/g, '');
        const cleanExpectedOutput = (testCases[0]?.expectedOutput || '').trim().replace(/\s+/g, '');
        
        if (cleanActualOutput === cleanExpectedOutput) {
          toast({
            title: "Sample Test Passed! ",
            description: "Your code works for the sample input. Try running all test cases!",
            variant: "default"
          });
        }
      }
    } catch (error: any) {
      console.error("Code execution error:", error);
      setError(
        error.message || "Failed to execute code. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    if (editorRef.current) {
      editorRef.current.setValue("");
      onChange("");
    }
    setOutput(null);
    setError(null);
  };

  const handleCopyCode = async () => {
    const code = editorRef.current?.getValue();
    if (code) {
      await navigator.clipboard.writeText(code);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    const updatedTestCases = [...testCases];
    let passedCount = 0;
    
    try {
      for (let i = 0; i < updatedTestCases.length; i++) {
        const testCase = updatedTestCases[i];
        
        // Execute the code with test input
        const result = await codeExecutionService.executeCode({
          code: `${editorRef.current?.getValue() || ""}\n\n// Test input:\n${testCase.input}\n`,
          language,
          input: testCase.input
        });

        if (result.error) {
          testCase.actualOutput = result.error;
          testCase.passed = false;
        } else {
          // Clean up the output (remove whitespace, newlines, etc.)
          const cleanActualOutput = result.output.trim().replace(/\s+/g, '');
          const cleanExpectedOutput = testCase.expectedOutput.trim().replace(/\s+/g, '');
          
          testCase.actualOutput = result.output.trim();
          testCase.passed = cleanActualOutput === cleanExpectedOutput;
          
          if (testCase.passed) {
            passedCount++;
          }
        }
      }

      onTestCasesChange(updatedTestCases);

      // Show test results summary
      const totalTests = updatedTestCases.length;
      const passRate = Math.round((passedCount / totalTests) * 100);
      
      toast({
        title: passedCount === totalTests 
          ? `All Tests Passed! (${passRate}%) ` 
          : `${passedCount}/${totalTests} Tests Passed (${passRate}%)`,
        description: passedCount === totalTests
          ? "Great job! Your code passed all test cases."
          : `Your code passed ${passedCount} out of ${totalTests} test cases. Check the results for details.`,
        variant: passedCount === totalTests ? "default" : "destructive",
      });

    } catch (error: any) {
      console.error("Test execution error:", error);
      toast({
        title: "Test Execution Error",
        description: error.message || "Failed to execute tests. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  useEffect(() => {
    // Load Sapling SDK script for code content
    const script = document.createElement('script');
    script.src = 'https://sapling.ai/static/js/sapling-sdk-v1.0.9.min.js';
    script.async = true;
    script.onload = () => {
      // Initialize Sapling after script loads
      if (window.Sapling && editorRef.current) {
        window.Sapling.init({
          key: 'UKBBD94K3GPLDCII4851RINM5LZT6UYD',
          mode: 'dev'
        });
        // Add Sapling check to the editor's DOM element
        const editorElement = editorRef.current.getContainerDomNode();
        if (editorElement) {
          window.Sapling.checkOnce(editorElement);
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={`space-y-4 ${isFullScreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      <div className="flex justify-between items-center">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.id} value={lang.id}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            title="Copy Code (Ctrl+C)"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullScreen}
            title="Toggle Fullscreen (F11)"
          >
            <Layout className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isExecuting}
            title="Reset Code"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button
            onClick={handleRunCode}
            disabled={isExecuting || !value.trim()}
            size="sm"
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="h-4 w-4 mr-1" />
            Run Code
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${isFullScreen ? 'col-span-2' : ''}`}>
          <div className={`border rounded-md overflow-hidden ${isFullScreen ? 'h-[calc(100vh-200px)]' : 'h-[400px]'}`}>
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              theme="vs-dark"
              value={value}
              onChange={onChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: isExecuting,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                quickSuggestions: true,
                snippetSuggestions: "top",
                renderWhitespace: "selection",
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          <CodeOutput 
            output={output}
            error={error}
            isLoading={isLoading}
          />
        </div>

        <div className={`${isFullScreen ? 'col-span-2' : ''}`}>
          <TestCases
            testCases={testCases}
            onTestCasesChange={onTestCasesChange}
            onRunTests={handleRunTests}
            isRunning={isRunningTests}
          />
        </div>
      </div>
    </div>
  );
}