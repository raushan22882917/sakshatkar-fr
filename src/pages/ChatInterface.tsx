import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Send, Loader2, Download, RefreshCw, Copy, Trash2, Edit, MessageSquare } from "lucide-react";

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: string;
  chatId?: number;
  understood?: boolean;
}

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: string, rating: number) => void;
}

interface TutorSidebarProps {
  onDownload: () => void;
  onRestart: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(5);

  const handleSubmit = () => {
    onSubmit(feedback, rating);
    setFeedback('');
    setRating(5);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about the response..."
            />
          </div>
          <div className="grid gap-2">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  variant={rating === value ? "default" : "outline"}
                  onClick={() => setRating(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TutorSidebar: React.FC<TutorSidebarProps> = ({
  onDownload,
  onRestart,
  onCopy,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
          <img
            src="/ai-teacher.jpg"
            alt="AI Teacher"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-lg font-semibold">AI Teacher</h3>
        <p className="text-sm text-gray-600 text-center mt-1">
          Here to guide you through coding basics
        </p>
      </div>
      
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Chat
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onRestart}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Restart Chat
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onCopy}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Chat
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Chat
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onEdit}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Chat
        </Button>
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <MessageSquare className="h-4 w-4 mr-2" />
          <span>Learning Progress</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
      </div>
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/start/');
      setUserId(response.data.user_id);
      
      const historyResponse = await axios.get(`http://localhost:8000/api/chat/history/?user_id=${response.data.user_id}`);
      const formattedHistory = historyResponse.data.history.map((msg: any, index: number) => ({
        id: index,
        content: msg.query,
        isUser: true,
        timestamp: msg.timestamp,
        chatId: msg.chat_id,
      })).concat(historyResponse.data.history.map((msg: any, index: number) => ({
        id: index + historyResponse.data.history.length,
        content: msg.response,
        isUser: false,
        timestamp: msg.timestamp,
        chatId: msg.chat_id,
      })));
      
      setMessages(formattedHistory);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !userId) return;

    const userMessage: Message = {
      id: messages.length,
      content: input,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat/', {
        user_id: userId,
        query: input
      });

      const botMessage: Message = {
        id: messages.length + 1,
        content: response.data.response,
        isUser: false,
        timestamp: new Date().toISOString(),
        chatId: response.data.chat_id
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentChatId(response.data.chat_id);
      setLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };

  const handleUnderstanding = async (understood: boolean) => {
    if (!currentChatId || !userId) return;

    try {
      const response = await axios.post('http://localhost:8000/api/chat/next-step/', {
        user_id: userId,
        chat_id: currentChatId,
        understood
      });

      if (understood) {
        if (response.data.questions) {
          const botMessage: Message = {
            id: messages.length + 1,
            content: `Great! Here are some practice questions:\n${response.data.questions}`,
            isUser: false,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, botMessage]);
        }
        setShowFeedback(true);
      } else {
        const retryResponse = await axios.post('http://localhost:8000/api/chat/retry/', {
          user_id: userId,
          chat_id: currentChatId
        });

        const botMessage: Message = {
          id: messages.length + 1,
          content: retryResponse.data.response,
          isUser: false,
          timestamp: new Date().toISOString(),
          chatId: retryResponse.data.chat_id
        };
        setMessages(prev => [...prev, botMessage]);
        setCurrentChatId(retryResponse.data.chat_id);
      }
    } catch (error) {
      console.error('Error handling understanding:', error);
    }
  };

  const handleFeedback = async (feedbackText: string, rating: number) => {
    if (!currentChatId || !userId) return;

    try {
      await axios.post('http://localhost:8000/api/chat/feedback/', {
        user_id: userId,
        chat_id: currentChatId,
        feedback_text: feedbackText,
        rating
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleDownloadChat = () => {
    const chatContent = messages
      .map((msg) => `${msg.isUser ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${currentChatId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestartChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    initializeChat();
  };

  const handleCopyChat = () => {
    const chatContent = messages
      .map((msg) => `${msg.isUser ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n');
    navigator.clipboard.writeText(chatContent);
  };

  const handleDeleteChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleEditChat = () => {
    // Implement edit functionality
    console.log('Edit chat functionality to be implemented');
  };

  return (
    <div className="flex h-screen bg-white">
      <TutorSidebar
        onDownload={handleDownloadChat}
        onRestart={handleRestartChat}
        onCopy={handleCopyChat}
        onDelete={handleDeleteChat}
        onEdit={handleEditChat}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <Card className="h-[80vh] flex flex-col">
            <div className="bg-primary p-4 rounded-t-lg">
              <h2 className="text-2xl font-bold text-white">AI Tutor Chat</h2>
            </div>
            
            <div className="flex-grow overflow-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-lg ${
                      message.isUser
                        ? 'bg-primary text-white'
                        : 'bg-secondary'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {!message.isUser && message.chatId && (
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnderstanding(true)}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Understood
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnderstanding(false)}
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          Need simpler explanation
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="ml-2">Send</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <FeedbackDialog
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedback}
      />
    </div>
  );
};

export default ChatInterface;
