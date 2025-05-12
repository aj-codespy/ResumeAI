
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import type { GenerateResumeFormData, EducationEntry, WorkExperienceEntry, InterviewAnswer } from "@/lib/schemas";
import { GenerateResumeFormSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Linkedin } from "lucide-react"; // Added Linkedin Icon
import { Separator } from "@/components/ui/separator";

interface ResumeGeneratorFormProps {
  onSubmit: (data: GenerateResumeFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Partial<GenerateResumeFormData>; // For pre-filling if coming back from interview
}

const defaultEducationEntry: EducationEntry = { institution: "", degree: "", graduationDate: "" };
const defaultWorkExperienceEntry: WorkExperienceEntry = { company: "", role: "", dates: "", responsibilities: "" };

export default function ResumeGeneratorForm({ onSubmit, isSubmitting, initialData }: ResumeGeneratorFormProps) {
  const form = useForm<GenerateResumeFormData>({
    resolver: zodResolver(GenerateResumeFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      contactInfo: initialData?.contactInfo || "",
      targetJobTitle: initialData?.targetJobTitle || "",
      yearsOfExperience: initialData?.yearsOfExperience || 0,
      careerLevel: initialData?.careerLevel || "Mid-Level",
      education: initialData?.education || [defaultEducationEntry],
      workExperience: initialData?.workExperience || [defaultWorkExperienceEntry],
      skills: initialData?.skills || "",
      projects: initialData?.projects || "",
      certifications: initialData?.certifications || "",
      jobDescription: initialData?.jobDescription || "",
      emphasisSkills: initialData?.emphasisSkills || "",
      linkedinProfileUrl: initialData?.linkedinProfileUrl || "",
      interviewAnswers: initialData?.interviewAnswers || [], // Pass through interview answers
    },
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { fields: workExperienceFields, append: appendWorkExperience, remove: removeWorkExperience } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });

  const handleSubmitWithInterviewData = (data: GenerateResumeFormData) => {
    const dataToSubmit = {
      ...data,
      interviewAnswers: form.getValues("interviewAnswers") // Ensure latest interview answers are included
    };
    onSubmit(dataToSubmit);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWithInterviewData)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Let's start with your basic details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetJobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Information</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Email, Phone, Main LinkedIn URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="linkedinProfileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Linkedin className="h-4 w-4 mr-2 text-blue-600" /> LinkedIn Profile URL (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://linkedin.com/in/yourprofile" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} value={field.value === undefined ? '' : field.value} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="careerLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select career level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Student/Intern">Student/Intern</SelectItem>
                        <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Detail your educational background.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {educationFields.map((item, index) => (
              <div key={item.id} className="p-4 border rounded-md space-y-3 relative transition-all duration-300 ease-in-out hover:shadow-md hover:border-foreground/20">
                <FormField
                  control={form.control}
                  name={`education.${index}.institution`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution</FormLabel>
                      <FormControl><Input placeholder="University Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`education.${index}.degree`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
                      <FormControl><Input placeholder="e.g., B.S. in Computer Science" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`education.${index}.graduationDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Date</FormLabel>
                      <FormControl><Input placeholder="e.g., May 2020" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {educationFields.length > 1 && (
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeEducation(index)} className="absolute top-2 right-2">
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendEducation(defaultEducationEntry)}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Education
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>Showcase your professional journey. Describe responsibilities and highlight achievements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workExperienceFields.map((item, index) => (
              <div key={item.id} className="p-4 border rounded-md space-y-3 relative transition-all duration-300 ease-in-out hover:shadow-md hover:border-foreground/20">
                <FormField
                  control={form.control}
                  name={`workExperience.${index}.company`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl><Input placeholder="Company Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`workExperience.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl><Input placeholder="Your Job Title" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`workExperience.${index}.dates`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dates</FormLabel>
                      <FormControl><Input placeholder="e.g., Jan 2021 - Present" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`workExperience.${index}.responsibilities`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsibilities & Achievements</FormLabel>
                      <FormControl><Textarea rows={4} placeholder="Describe your key tasks and accomplishments. Use bullet points, quantify results (e.g., Increased X by Y%)." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {workExperienceFields.length > 1 && (
                   <Button type="button" variant="destructive" size="sm" onClick={() => removeWorkExperience(index)} className="absolute top-2 right-2">
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendWorkExperience(defaultWorkExperienceEntry)}>
               <PlusCircle className="h-4 w-4 mr-2" /> Add Work Experience
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skills & More</CardTitle>
            <CardDescription>List your skills and any other relevant information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Comma-separated skills, e.g., JavaScript, React, Node.js, Project Management, Agile" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="emphasisSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills to Emphasize (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Comma-separated skills you want AI to highlight" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projects (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe key projects, comma-separated or one per line. e.g., Developed X which achieved Y." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifications (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Comma-separated certifications, e.g., PMP, AWS Certified Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Job Description (Highly Recommended for Tailoring)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste the full job description here to tailor your resume effectively." {...field} rows={6}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-y-4">
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? "Processing..." : "Proceed to AI Interview & Generate"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Clicking "Proceed" will first take you through a short AI-powered interview to gather more details for a highly personalized resume.
            </p>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
