
import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    };
    internal: {
      getNumberOfPages: () => number;
      pageSize: {
        getWidth: () => number;
        getHeight: () => number;
        width: number;
        height: number;
      };
      pages: any[];
    };
  }
}
