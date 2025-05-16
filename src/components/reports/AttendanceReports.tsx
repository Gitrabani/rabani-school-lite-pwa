
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { useReportData } from '@/hooks/useReportData';
import { useToast } from '@/hooks/use-toast';

const attendanceData = [
  { month: "Jan", present: 92, absent: 8, late: 5 },
  { month: "Feb", present: 88, absent: 12, late: 7 },
  { month: "Mar", present: 90, absent: 10, late: 4 },
  { month: "Apr", present: 85, absent: 15, late: 9 },
  { month: "May", present: 93, absent: 7, late: 3 },
  { month: "Jun", present: 91, absent: 9, late: 6 },
  { month: "Jul", present: 94, absent: 6, late: 2 },
  { month: "Aug", present: 89, absent: 11, late: 5 },
  { month: "Sep", present: 92, absent: 8, late: 4 },
  { month: "Oct", present: 90, absent: 10, late: 7 },
  { month: "Nov", present: 87, absent: 13, late: 8 },
  { month: "Dec", present: 86, absent: 14, late: 10 },
];

const chartConfig = {
  present: {
    label: "Present",
    theme: {
      light: "hsl(var(--chart-1))",
      dark: "hsl(var(--chart-1))",
    },
  },
  absent: {
    label: "Absent",
    theme: {
      light: "hsl(var(--chart-4))",
      dark: "hsl(var(--chart-4))",
    },
  },
  late: {
    label: "Late",
    theme: {
      light: "hsl(var(--chart-3))",
      dark: "hsl(var(--chart-3))",
    },
  },
};

export const AttendanceReports: React.FC = () => {
  const [reportClass, setReportClass] = useState("all");
  const { attendanceData, loading } = useReportData();
  const { toast } = useToast();

  const classOptions = [
    { value: "all", label: "All Classes" },
    { value: "class-10", label: "Class 10" },
    { value: "class-9", label: "Class 9" },
    { value: "class-8", label: "Class 8" },
  ];
  
  // Function to export attendance report as CSV
  const handleExportReport = () => {
    try {
      // Create CSV data for attendance trends
      let csvContent = "Attendance Report\n\n";
      csvContent += "Monthly Attendance Trends\n";
      csvContent += "Month,Present (%),Absent (%),Late (%)\n";
      
      attendanceData.forEach(item => {
        csvContent += `${item.month},${item.present},${item.absent},${item.late}\n`;
      });
      
      // Add summary statistics
      csvContent += "\n\nAttendance Summary\n";
      
      // Calculate averages
      const avgPresent = attendanceData.reduce((sum, item) => sum + item.present, 0) / attendanceData.length;
      const avgAbsent = attendanceData.reduce((sum, item) => sum + item.absent, 0) / attendanceData.length;
      const avgLate = attendanceData.reduce((sum, item) => sum + item.late, 0) / attendanceData.length;
      
      csvContent += `Average Present Rate,${avgPresent.toFixed(1)}%\n`;
      csvContent += `Average Absence Rate,${avgAbsent.toFixed(1)}%\n`;
      csvContent += `Average Late Rate,${avgLate.toFixed(1)}%\n`;
      
      // Add class filter information
      csvContent += `\nClass Filter: ${classOptions.find(option => option.value === reportClass)?.label || reportClass}\n`;
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance-report-${reportClass}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report Exported",
        description: "Attendance report has been downloaded as CSV"
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
          <Select value={reportClass} onValueChange={setReportClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={handleExportReport} disabled={loading}>
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Yearly Attendance Trends</CardTitle>
            <CardDescription>
              Monthly attendance statistics for the current academic year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-[3/1]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="present" name="Present" stroke="var(--color-present)" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="absent" name="Absent" stroke="var(--color-absent)" strokeWidth={2} />
                  <Line type="monotone" dataKey="late" name="Late" stroke="var(--color-late)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Attendance</CardTitle>
            <CardDescription>School-wide attendance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-green-600">90.3%</div>
            <p className="text-center text-sm text-muted-foreground mt-2">Present</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Absence Rate</CardTitle>
            <CardDescription>School-wide absence percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-red-500">9.7%</div>
            <p className="text-center text-sm text-muted-foreground mt-2">Absent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Late Arrivals</CardTitle>
            <CardDescription>School-wide tardiness percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-amber-500">5.8%</div>
            <p className="text-center text-sm text-muted-foreground mt-2">Late</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
