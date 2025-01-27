import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MentorSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function MentorSearch({ searchQuery, onSearchChange }: MentorSearchProps) {
  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Search by name, expertise, or skills..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
  );
}