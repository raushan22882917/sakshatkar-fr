export interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  title: string;
  description: string;
}
