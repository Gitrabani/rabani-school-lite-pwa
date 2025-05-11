
import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
    internal: {
      events: any;
      scaleFactor: number;
      pageSize: {
        width: number;
        height: number;
        getWidth: () => number;
        getHeight: () => number;
      };
      pages: any[];
      getNumberOfPages: () => number;
      getFont: () => any;
      getFontSize: () => number;
      getEncryptor?: (objectId: number) => (data: string) => string;
    };
  }
}
