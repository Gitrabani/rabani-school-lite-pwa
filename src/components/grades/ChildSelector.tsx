
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import DownloadReportCardButton from './DownloadReportCardButton';

interface ChildSelectorProps {
  children: Array<{ id: string; name: string }>;
  selectedChild: string;
  onSelectChild: (childId: string) => void;
  loading: boolean;
  reportReady: boolean;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({
  children,
  selectedChild,
  onSelectChild,
  loading,
  reportReady
}) => {
  if (loading && children.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
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
    <Card>
      <CardHeader>
        <CardTitle>Select Child</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <Select 
            value={selectedChild} 
            onValueChange={onSelectChild}
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
          
          {selectedChild && (
            <div className="flex justify-end">
              <DownloadReportCardButton 
                studentId={selectedChild} 
                enabled={reportReady} 
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildSelector;
