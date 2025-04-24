
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from '../components/shared/PageHeader';
import { DepartmentReports } from '../components/reports/DepartmentReports';
import { AttendanceReports } from '../components/reports/AttendanceReports';
import { GradesReports } from '../components/reports/GradesReports';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("departments");
  
  return (
    <div>
      <PageHeader 
        title="Reports & Analytics" 
        description="Generate analytics and reports for all departments" 
      />
      
      <Tabs defaultValue="departments" value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="w-full border-b">
          <TabsTrigger value="departments">Department Reports</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Reports</TabsTrigger>
          <TabsTrigger value="grades">Academic Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="departments" className="mt-4">
          <DepartmentReports />
        </TabsContent>
        
        <TabsContent value="attendance" className="mt-4">
          <AttendanceReports />
        </TabsContent>
        
        <TabsContent value="grades" className="mt-4">
          <GradesReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
