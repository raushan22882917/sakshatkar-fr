import React from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import articles from '@/data/articles.json';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articles.articles.find(a => a.id === Number(id));

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Articles
      </Button>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        
        <div className="flex gap-2 mb-6">
          {article.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <span>By {article.author}</span>
          <span className="mx-2">•</span>
          <span>{format(new Date(article.publishDate), 'MMMM d, yyyy')}</span>
          <span className="mx-2">•</span>
          <span>{article.readTime}</span>
        </div>

        <Separator className="my-8" />

        <div className="space-y-4">
          {article.content.split('...')[0].split('. ').map((paragraph, index) => (
            <p key={index}>{paragraph}.</p>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="text-sm text-muted-foreground text-center">
          Article curated and organized by Sakshatkar
        </div>
      </article>
    </div>
  );
}
