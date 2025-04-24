
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Download } from 'lucide-react';

const departmentData = [
  { name: "Faculty", students: 0, teachers: 18, staff: 7 },
  { name: "Administration", students: 0, teachers: 0, staff: 12 },
  { name: "Science", students: 145, teachers: 8, staff: 3 },
  { name: "Arts", students: 120, teachers: 7, staff: 2 },
  { name: "Mathematics", students: 160, teachers: 6, staff: 1 },
  { name: "Languages", students: 130, teachers: 9, staff: 2 },
  { name: "Physical Education", students: 200, teachers: 4, staff: 5 },
];

const chartConfig = {
  students: {
    label: "Students",
    theme: {
      light: "hsl(var(--chart-1))",
      dark: "hsl(var(--chart-1))",
    },
  },
  teachers: {
    label: "Teachers",
    theme: {
      light: "hsl(var(--chart-2))",
      dark: "hsl(var(--chart-2))",
    },
  },
  staff: {
    label: "Staff",
    theme: {
      light: "hsl(var(--chart-3))",
      dark: "hsl(var(--chart-3))",
    },
  },
};

export const DepartmentReports: React.FC = () => {
  const [reportPeriod, setReportPeriod] = useState("current-year");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-64">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-year">Current Academic Year</SelectItem>
              <SelectItem value="last-year">Previous Academic Year</SelectItem>
              <SelectItem value="last-5-years">Last 5 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>
              Distribution of students, teachers, and staff across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-[4/3]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="students" name="Students" fill="var(--color-students)" />
                  <Bar dataKey="teachers" name="Teachers" fill="var(--color-teachers)" />
                  <Bar dataKey="staff" name="Staff" fill="var(--color-staff)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Department Summary</CardTitle>
            <CardDescription>
              Key metrics by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentData.map((dept) => (
                <div key={dept.name} className="border-b pb-2 last:border-0">
                  <h4 className="font-medium">{dept.name}</h4>
                  <div className="grid grid-cols-3 mt-1 text-sm">
                    <div>
                      <p className="text-muted-foreground">Students</p>
                      <p className="font-medium">{dept.students}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Teachers</p>
                      <p className="font-medium">{dept.teachers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Staff</p>
                      <p className="font-medium">{dept.staff}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
