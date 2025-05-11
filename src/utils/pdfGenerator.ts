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

    // Header for the table
    let startY = 90;
    doc.setFontSize(10);
    doc.text('Subject', 20, startY);
    doc.text('Exam Type', 60, startY);
    doc.text('Marks', 100, startY);
    doc.text('Total Marks', 120, startY);
    doc.text('Percentage', 140, startY);
    doc.text('Grade', 160, startY);
    doc.line(20, startY + 2, 190, startY + 2); // Add line below the header

    // Add rows for grades
    grades.forEach((grade, index) => {
      startY += 10;
      doc.text(grade.subject_id, 20, startY);
      doc.text(grade.exam_type, 60, startY);
      doc.text(grade.marks.toString(), 100, startY);
      doc.text(grade.total_marks.toString(), 120, startY);
      doc.text(`${Math.round((grade.marks / grade.total_marks) * 100)}%`, 140, startY);
      doc.text(getGradeLetter(Math.round((grade.marks / grade.total_marks) * 100)), 160, startY);
    });

    // Add summary
    startY += 20;
    doc.text(`Total Marks: ${totalMarks} / ${totalPossibleMarks}`, 20, startY);
    doc.text(`Average: ${averagePercentage}%`, 20, startY + 10);
    doc.text(`Overall Grade: ${getGradeLetter(averagePercentage)}`, 20, startY + 20);

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

    console.log('PDF generation completed successfully');
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
