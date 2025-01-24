import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from './ChatInterface';

const ChatLayout: React.FC = () => {
  const chatInterfaceRef = React.useRef<any>(null);

  return (
    <div className="h-screen p-4 bg-background">
      <div className="h-full rounded-lg border">
        <ChatInterface ref={chatInterfaceRef} />
      </div>
    </div>
  );
};

export default ChatLayout;
