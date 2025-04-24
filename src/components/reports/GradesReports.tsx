
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const gradeDistribution = [
  { grade: "A+", count: 45, percentage: 15 },
  { grade: "A", count: 65, percentage: 22 },
  { grade: "B+", count: 80, percentage: 27 },
  { grade: "B", count: 55, percentage: 18 },
  { grade: "C+", count: 25, percentage: 8 },
  { grade: "C", count: 20, percentage: 7 },
  { grade: "D", count: 8, percentage: 2.5 },
  { grade: "F", count: 2, percentage: 0.5 },
];

const subjectPerformance = [
  { subject: "Mathematics", avgGrade: 85, passRate: 98 },
  { subject: "Science", avgGrade: 82, passRate: 97 },
  { subject: "English", avgGrade: 79, passRate: 99 },
  { subject: "History", avgGrade: 76, passRate: 96 },
  { subject: "Geography", avgGrade: 81, passRate: 98 },
  { subject: "Art", avgGrade: 88, passRate: 100 },
  { subject: "Physical Education", avgGrade: 90, passRate: 100 },
];

const chartConfig = {
  percentage: {
    label: "Percentage",
    theme: {
      light: "hsl(var(--chart-1))",
      dark: "hsl(var(--chart-1))",
    },
  },
};

export const GradesReports: React.FC = () => {
  const [examType, setExamType] = useState("midterm");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-64">
          <Select value={examType} onValueChange={setExamType}>
            <SelectTrigger>
              <SelectValue placeholder="Select exam type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="midterm">Midterm Exams</SelectItem>
              <SelectItem value="final">Final Exams</SelectItem>
              <SelectItem value="assessment">Continuous Assessment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Percentage of students in each grade category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-[4/3]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="percentage" name="Percentage" fill="var(--color-percentage)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>
              Average grades by subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Avg. Grade</TableHead>
                  <TableHead className="text-right">Pass Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjectPerformance.map((subject) => (
                  <TableRow key={subject.subject}>
                    <TableCell>{subject.subject}</TableCell>
                    <TableCell className="text-right">{subject.avgGrade}/100</TableCell>
                    <TableCell className="text-right">{subject.passRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key academic performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-muted-foreground mb-1">Overall Average</p>
              <p className="text-3xl font-bold">82%</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-muted-foreground mb-1">Pass Rate</p>
              <p className="text-3xl font-bold">97.5%</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-muted-foreground mb-1">Top Grade</p>
              <p className="text-3xl font-bold">15%</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-muted-foreground mb-1">Failure Rate</p>
              <p className="text-3xl font-bold">2.5%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
