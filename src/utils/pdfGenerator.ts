
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

interface GradeItem {
  id: string;
  subject_id: string;
  exam_type: string;
  marks: number;
  total_marks: number;
  date: string;
}

export const generateResultPDF = async (
  studentName: string,
  studentId: string,
  grades: GradeItem[],
  schoolName: string,
  academicYear: string
) => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add school name in header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolName, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

  // Add academic year
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Academic Year: ${academicYear}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Result Form', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

  // Add student info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student Name: ${studentName}`, 20, 45);
  doc.text(`Student ID: ${studentId}`, 20, 52);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 59);

  // Generate QR code with school name
  const qrCodeDataURL = await QRCode.toDataURL(schoolName);
  doc.addImage(qrCodeDataURL, 'PNG', 140, 40, 40, 40);

  // Prepare grades data for table
  const tableData = grades.map((grade) => [
    grade.subject_id,
    grade.exam_type,
    grade.marks,
    grade.total_marks,
    `${Math.round((grade.marks / grade.total_marks) * 100)}%`,
    getGradeLetter(Math.round((grade.marks / grade.total_marks) * 100)),
  ]);

  // Calculate summary
  const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
  const totalPossibleMarks = grades.reduce((sum, grade) => sum + grade.total_marks, 0);
  const averagePercentage = totalPossibleMarks > 0 
    ? Math.round((totalMarks / totalPossibleMarks) * 100) 
    : 0;

  // Add grades table
  doc.autoTable({
    startY: 90,
    head: [['Subject', 'Exam Type', 'Marks', 'Total', 'Percentage', 'Grade']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  // Add summary
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Total Marks: ${totalMarks} / ${totalPossibleMarks}`, 20, finalY);
  doc.text(`Average: ${averagePercentage}%`, 20, finalY + 7);
  doc.text(`Overall Grade: ${getGradeLetter(averagePercentage)}`, 20, finalY + 14);
  
  // Add remarks
  doc.text('Remarks:', 20, finalY + 28);
  doc.text(getRemarks(averagePercentage), 20, finalY + 35);

  // Add footer with school name
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      schoolName,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
};

// Helper function to determine grade letter
const getGradeLetter = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

// Helper function to generate remarks
const getRemarks = (percentage: number): string => {
  if (percentage >= 90) return 'Outstanding performance. Keep up the excellent work!';
  if (percentage >= 80) return 'Excellent performance. Well done!';
  if (percentage >= 70) return 'Very good performance. Keep improving!';
  if (percentage >= 60) return 'Good performance. Continue working hard!';
  if (percentage >= 50) return 'Satisfactory performance. More effort needed.';
  if (percentage >= 40) return 'Needs improvement. Please seek additional help.';
  return 'Failed. Requires serious attention and remedial classes.';
};
