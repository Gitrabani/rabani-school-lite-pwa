import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import StudentGradesBySubject from './StudentGradesBySubject';
import ResultFormDownloadButton from './ResultFormDownloadButton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StudentGradesByExam from './StudentGradesByExam';

interface ChildInfo {
  id: string;
  name: string;
}

const ParentGradeView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [childGrades, setChildGrades] = useState<any[]>([]);
  const [gradesBySubject, setGradesBySubject] = useState<Record<string, any[]>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});

  // Fetch parent's children
  useEffect(() => {
    const fetchChildren = async () => {
      if (!user?.id) return;
      
      try {
        // This is a simplified example. In a real app, you would have a proper
        // parent-child relationship in your database schema
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'student')
          .filter('parent_id', 'eq', user.id);
          
        if (error) throw error;
        
        const childrenData = data?.map(child => ({
          id: child.id,
          name: child.full_name || 'Unknown Student'
        })) || [];
        
        setChildren(childrenData);
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0].id);
        }
      } catch (error: any) {
        console.error('Error fetching children:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load children data"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchChildren();
  }, [user, toast]);

  // Fetch selected child's grades
  useEffect(() => {
    const fetchChildGrades = async () => {
      if (!selectedChild) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', selectedChild);
        
        if (error) throw error;
        
        setChildGrades(data || []);
        
        // Process grades by subject
        const bySubject = (data || []).reduce<Record<string, any[]>>((acc, grade) => {
          if (!acc[grade.subject_id]) {
            acc[grade.subject_id] = [];
          }
          acc[grade.subject_id].push(grade);
          return acc;
        }, {});
        
        setGradesBySubject(bySubject);
        
        // Set subjects
        const subjectsMap: Record<string, string> = {};
        (data || []).forEach(grade => {
          subjectsMap[grade.subject_id] = grade.subject_id;
        });
        
        setSubjects(subjectsMap);
      } catch (error: any) {
        console.error('Error fetching child grades:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load grades data"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchChildGrades();
  }, [selectedChild, toast]);

  const selectedChildName = children.find(c => c.id === selectedChild)?.name || '';

  if (loading && children.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">No children associated with this account</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Child</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Select 
              value={selectedChild} 
              onValueChange={setSelectedChild}
              disabled={loading || children.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedChild && (
        <Tabs defaultValue="bySubject">
          <TabsList className="mb-4">
            <TabsTrigger value="bySubject">By Subject</TabsTrigger>
            <TabsTrigger value="byExam">By Exam Type</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bySubject">
            <StudentGradesBySubject 
              gradesBySubject={gradesBySubject} 
              loading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="byExam">
            <StudentGradesByExam 
              ownGrades={childGrades} 
              loading={loading}
              subjects={subjects}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ParentGradeView;
