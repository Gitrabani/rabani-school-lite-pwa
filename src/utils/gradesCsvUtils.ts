
import { format } from 'date-fns';

/**
 * Converts grade data to CSV format
 */
export const convertGradesToCSV = (studentGrades: any[], selectedSubject: string, selectedExamType: string) => {
  // Create CSV header
  let csvContent = `Student Name,Student ID,Subject,Exam Type,Marks,Total Marks,Date\n`;
  
  // Add data rows
  studentGrades.forEach(student => {
    const grade = student.grade;
    const marks = grade ? grade.marks : "";
    const totalMarks = grade ? grade.total_marks : "";
    const date = grade ? format(new Date(grade.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    
    csvContent += `"${student.name}",${student.id},${selectedSubject},${selectedExamType},${marks},${totalMarks},${date}\n`;
  });
  
  return csvContent;
};

/**
 * Downloads the CSV data as a file
 */
export const downloadCSV = (csvContent: string, fileName: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Validates CSV data structure for grade imports
 * Returns true if valid, false otherwise
 */
export const validateGradeCSV = (csvData: any[]): boolean => {
  if (!csvData || !csvData.length) return false;
  
  // Check for required headers
  const requiredFields = ['Student ID', 'Marks'];
  const headers = Object.keys(csvData[0]);
  
  const missingFields = requiredFields.filter(field => !headers.includes(field));
  return missingFields.length === 0;
};

/**
 * Parse CSV file content
 */
export const parseCSVContent = (content: string): any[] => {
  const lines = content.split('\n');
  const result = [];
  const headers = lines[0].split(',').map(header => header.trim());
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const obj: any = {};
    const currentLine = lines[i].split(',');
    
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j]?.trim() || '';
    }
    
    result.push(obj);
  }
  
  return result;
};
