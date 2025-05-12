
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
// Import jspdf-autotable properly
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

// Function to manually add autoTable functionality if it's not available
const ensureAutoTableFunctionality = (doc: jsPDF) => {
  console.log("Checking if autoTable exists:", typeof (doc as any).autoTable === 'function');
  
  if (typeof (doc as any).autoTable !== 'function') {
    console.warn('autoTable function not found, trying to import jspdf-autotable manually');
    
    // Try to dynamically import
    try {
      // A last resort attempt to manually attach the function if it's somehow available in window
      if (window && (window as any).jspdfAutoTable) {
        (window as any).jspdfAutoTable(doc);
        console.log("Applied jspdfAutoTable from window object");
      }
    } catch (error) {
      console.error("Failed to manually import jspdf-autotable:", error);
      throw new Error("PDF generation failed: autoTable function is not available even after manual import attempt");
    }
  }
};

export const generateResultPDF = async (
  studentName: string,
  studentId: string,
  grades: GradeItem[],
  schoolName: string,
  academicYear: string
) => {
  try {
    console.log('Starting PDF generation with schoolName:', schoolName);

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Log available methods to help debug
    console.log("Available methods:", Object.keys(doc));
    
    // Ensure autoTable is available
    ensureAutoTableFunctionality(doc);
    
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

    console.log('Creating table data for PDF');

    // Create table data
    const tableData = grades.map(grade => [
      grade.subject_id,
      grade.exam_type,
      grade.marks.toString(),
      grade.total_marks.toString(),
      `${Math.round((grade.marks / grade.total_marks) * 100)}%`,
      getGradeLetter(Math.round((grade.marks / grade.total_marks) * 100))
    ]);

    // Use a try-catch block specifically for the autoTable call
    try {
      console.log("Attempting to use autoTable");
      // Use type assertion to access autoTable
      (doc as any).autoTable({
        startY: 90,
        head: [['Subject', 'Exam Type', 'Marks', 'Total Marks', 'Percentage', 'Grade']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { top: 90 }
      });
      console.log("autoTable was called successfully");
    } catch (error) {
      console.error("Error calling autoTable:", error);
      throw new Error(`Failed to create table: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Get the final Y position after the table
    let finalY = 90 + tableData.length * 10 + 30; // Estimate if lastAutoTable is not available
    
    try {
      if ((doc as any).lastAutoTable && typeof (doc as any).lastAutoTable.finalY !== 'undefined') {
        finalY = (doc as any).lastAutoTable.finalY + 10;
        console.log("Got finalY position from lastAutoTable:", finalY);
      }
    } catch (error) {
      console.warn("Could not access lastAutoTable.finalY:", error);
    }

    // Add summary after the table
    doc.text(`Total Marks: ${totalMarks} / ${totalPossibleMarks}`, 20, finalY);
    doc.text(`Average: ${averagePercentage}%`, 20, finalY + 10);
    doc.text(`Overall Grade: ${getGradeLetter(averagePercentage)}`, 20, finalY + 20);

    // Add footer with school name
    const pageCount = (doc as any).internal.getNumberOfPages 
      ? (doc as any).internal.getNumberOfPages() 
      : 1;
      
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
