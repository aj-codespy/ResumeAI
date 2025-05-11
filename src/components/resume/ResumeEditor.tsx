"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCopy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeEditorProps {
  content: string;
  suggestions?: string[];
  title?: string;
  description?: string;
}

export default function ResumeEditor({ 
  content, 
  suggestions,
  title = "Your Resume",
  description = "Review and edit your AI-generated or revamped resume content below." 
}: ResumeEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent).then(() => {
      setCopied(true);
      toast({ title: "Copied!", description: "Resume content copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      toast({ variant: "destructive", title: "Copy failed", description: "Could not copy content." });
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <Card className="mt-8 shadow-lg"> {/* Existing shadow-lg, card hover will be additive/override based on specificity */}
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {suggestions && suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">AI Suggestions</CardTitle>
              <CardDescription>Consider these points to improve your resume further:</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index} 
                      className="animate-subtle-slide-in-fade opacity-0" // Initial opacity 0 for animation
                      style={{ animationDelay: `${index * 75}ms` }} // Staggered animation delay
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
        <div>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={25}
            className="text-sm leading-relaxed p-4 rounded-md shadow-inner bg-secondary/30 focus-within:shadow-md" // Added focus-within shadow
            placeholder="Your resume content will appear here..."
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCopy} disabled={!editedContent} className="w-full md:w-auto">
          {copied ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy Resume Text'}
        </Button>
      </CardFooter>
    </Card>
  );
}