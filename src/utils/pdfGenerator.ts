
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import 'jspdf-autotable';

// Import required types
type GradeItem = {
  subject_id: string;
  exam_type: string;
  marks: number;
  total_marks: number;
};

// Helper function to get grade letter
const getGradeLetter = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

export const generateResultPDF = async (
  studentName: string,
  studentId: string,
  grades: GradeItem[],
  schoolName: string,
  academicYear: string
) => {
  try {
    console.log('Starting PDF generation');

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Check if autoTable is available
    if (typeof doc.autoTable !== 'function') {
      console.error('autoTable function is not available on the jsPDF instance');
      console.log('Available methods:', Object.keys(doc));
      throw new Error('PDF generation failed: autoTable function is not available');
    }

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

    // Prepare table data
    const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
    const totalPossibleMarks = grades.reduce((sum, grade) => sum + grade.total_marks, 0);
    const averagePercentage = totalPossibleMarks > 0
      ? Math.round((totalMarks / totalPossibleMarks) * 100)
      : 0;

    console.log('Adding table to PDF');

    // Create table data
    const tableData = grades.map(grade => [
      grade.subject_id,
      grade.exam_type,
      grade.marks.toString(),
      grade.total_marks.toString(),
      `${Math.round((grade.marks / grade.total_marks) * 100)}%`,
      getGradeLetter(Math.round((grade.marks / grade.total_marks) * 100))
    ]);

    // Use autoTable to create grade table
    doc.autoTable({
      startY: 90,
      head: [['Subject', 'Exam Type', 'Marks', 'Total Marks', 'Percentage', 'Grade']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { top: 90 }
    });

    // Add summary after the table
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Marks: ${totalMarks} / ${totalPossibleMarks}`, 20, finalY);
    doc.text(`Average: ${averagePercentage}%`, 20, finalY + 10);
    doc.text(`Overall Grade: ${getGradeLetter(averagePercentage)}`, 20, finalY + 20);

    // Add footer with school name
    // Use a safer approach to access internal methods
    const pageCount = doc.internal.pages ? doc.internal.pages.length - 1 : 1;
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

    console.log('PDF generation completed successfully');
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
