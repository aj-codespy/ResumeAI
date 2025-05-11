"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { RevampResumeFormData } from "@/lib/schemas";
import { RevampResumeFormSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ResumeRevampFormProps {
  onSubmit: (data: RevampResumeFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function ResumeRevampForm({ onSubmit, isSubmitting }: ResumeRevampFormProps) {
  const form = useForm<RevampResumeFormData>({
    resolver: zodResolver(RevampResumeFormSchema),
    defaultValues: {
      resumeText: "",
      targetJobDescription: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Revamp Your Resume</CardTitle>
            <CardDescription>Paste your current resume and optionally a target job description to get AI-powered enhancements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="resumeText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Current Resume Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your full resume content here..."
                      rows={15}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetJobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Job Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the target job description here for tailored suggestions..."
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? "Revamping..." : "Revamp Resume"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
