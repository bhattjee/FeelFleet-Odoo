import PDFDocument from 'pdfkit';
import { Response } from 'express';

export class PDFService {
    static generateExpenseReport(res: Response, data: any, title: string) {
        const doc = new PDFDocument();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('FleetFlow Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(title, { align: 'center' });
        doc.moveDown();

        // Body
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                doc.fontSize(10).text(`${index + 1}. ${JSON.stringify(item)}`);
                doc.moveDown(0.5);
            });
        } else {
            doc.fontSize(12).text(JSON.stringify(data, null, 2));
        }

        // Footer
        doc.moveDown();
        doc.fontSize(8).text(`Generated on ${new Date().toLocaleString()}`, { align: 'right' });

        doc.end();
    }
}
