
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
import { FileSpreadsheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { useReportData } from '@/hooks/useReportData';
import { useToast } from '@/hooks/use-toast';

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
  const { gradeDistribution, subjectPerformance, loading } = useReportData();
  const { toast } = useToast();
  
  // Function to export grades report as CSV
  const handleExportReport = () => {
    try {
      // Create CSV data for grade distribution
      let csvContent = "Grade Distribution\n";
      csvContent += "Grade,Count,Percentage\n";
      
      gradeDistribution.forEach(item => {
        csvContent += `${item.grade},${item.count},${item.percentage}\n`;
      });
      
      csvContent += "\n\nSubject Performance\n";
      csvContent += "Subject,Average Grade,Pass Rate\n";
      
      subjectPerformance.forEach(item => {
        csvContent += `${item.subject},${item.avgGrade},${item.passRate}\n`;
      });
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `grades-report-${examType}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report Exported",
        description: "Grades report has been downloaded as CSV"
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error exporting the report"
      });
    }
  };
  
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
        
        <Button variant="outline" onClick={handleExportReport} disabled={loading}>
          <FileSpreadsheet size={16} className="mr-2" />
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
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Loading chart data...</p>
              </div>
            ) : (
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
            )}
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
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Loading data...</p>
              </div>
            ) : (
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
            )}
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
              <p className="text-3xl font-bold">
                {loading ? "..." : `${calculateOverallAverage(subjectPerformance)}%`}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-muted-foreground mb-1">Pass Rate</p>
              <p className="text-3xl font-bold">
                {loading ? "..." : `${calculateAveragePassRate(subjectPerformance)}%`}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-muted-foreground mb-1">Top Grade</p>
              <p className="text-3xl font-bold">
                {loading ? "..." : `${calculateTopGradePercentage(gradeDistribution)}%`}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-muted-foreground mb-1">Failure Rate</p>
              <p className="text-3xl font-bold">
                {loading ? "..." : `${100 - calculateAveragePassRate(subjectPerformance)}%`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to calculate overall average from subject performances
const calculateOverallAverage = (subjects: any[]) => {
  if (!subjects || subjects.length === 0) return 0;
  const total = subjects.reduce((sum, subject) => sum + subject.avgGrade, 0);
  return Math.round(total / subjects.length);
};

// Helper function to calculate average pass rate
const calculateAveragePassRate = (subjects: any[]) => {
  if (!subjects || subjects.length === 0) return 0;
  const total = subjects.reduce((sum, subject) => sum + subject.passRate, 0);
  return Math.round(total / subjects.length);
};

// Helper function to calculate top grade percentage (A+ percentage)
const calculateTopGradePercentage = (distribution: any[]) => {
  if (!distribution || distribution.length === 0) return 0;
  const aPlus = distribution.find(item => item.grade === 'A+');
  return aPlus ? Math.round(aPlus.percentage) : 0;
};
