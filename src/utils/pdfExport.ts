import { jsPDF } from 'jspdf';
import { CivicReport } from '../types/civic.js';

export function generateComplaintPDF(report: CivicReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 22;

  // Header Banner
  doc.setFillColor(15, 118, 110); // Emerald/Teal brand color
  doc.rect(margin, cursorY - 6, contentWidth, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CIVICEYE - FORMAL CITIZEN GRIEVANCE PETITION', margin + 6, cursorY + 5);

  cursorY += 22;

  // Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, cursorY, contentWidth, 32, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Report ID:', margin + 4, cursorY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(report.reportId, margin + 28, cursorY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Date & Time:', margin + 100, cursorY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(report.createdAt).toLocaleString('en-IN'), margin + 125, cursorY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Issue Category:', margin + 4, cursorY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(report.issueCategory.replace('_', ' ').toUpperCase(), margin + 32, cursorY + 15);

  doc.setFont('helvetica', 'bold');
  doc.text('Language:', margin + 100, cursorY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(report.language, margin + 125, cursorY + 15);

  doc.setFont('helvetica', 'bold');
  doc.text('Location:', margin + 4, cursorY + 23);
  doc.setFont('helvetica', 'normal');
  const locStr = `${report.location.addressOrLandmark || ''}, ${report.location.cityOrArea || ''}`.trim();
  doc.text(locStr.length > 55 ? locStr.substring(0, 52) + '...' : locStr, margin + 24, cursorY + 23);

  doc.setFont('helvetica', 'bold');
  doc.text('Target Dept:', margin + 100, cursorY + 23);
  doc.setFont('helvetica', 'normal');
  const deptStr = report.suggestedDepartment || 'Municipal Corporation';
  doc.text(deptStr.length > 32 ? deptStr.substring(0, 30) + '...' : deptStr, margin + 125, cursorY + 23);

  cursorY += 40;

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Subject: ${report.issueTitle}`, margin, cursorY);
  cursorY += 8;

  // Visual Observations Section
  if (report.observations && report.observations.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text('VERIFIED VISUAL EVIDENCE & OBSERVATIONS (AI-ASSISTED):', margin, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    report.observations.forEach((obs) => {
      const splitObs = doc.splitTextToSize(`• ${obs}`, contentWidth - 4);
      doc.text(splitObs, margin + 2, cursorY);
      cursorY += splitObs.length * 5;
    });
    cursorY += 4;
  }

  // Formal Complaint Text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('FORMAL COMPLAINT PETITION:', margin, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);

  const cleanComplaint = report.complaintText.replace(/\r\n/g, '\n');
  const complaintLines = doc.splitTextToSize(cleanComplaint, contentWidth);

  for (let i = 0; i < complaintLines.length; i++) {
    if (cursorY > 265) {
      doc.addPage();
      cursorY = 25;
    }
    doc.text(complaintLines[i], margin, cursorY);
    cursorY += 5;
  }

  cursorY += 10;
  if (cursorY > 255) {
    doc.addPage();
    cursorY = 25;
  }

  // Footer Disclaimer & Verification Notice
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);
  cursorY += 6;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'CivicEye AI Public Issue Reporter | Empowering citizens to document public infrastructure hazards.',
    margin,
    cursorY
  );
  cursorY += 4;
  doc.text(
    'Notice: This document is prepared for citizen submission to authorized civic bodies (e.g., GHMC, CPGRAMS, Swachhata).',
    margin,
    cursorY
  );

  // Save the PDF
  const safeFilename = `CivicEye_Complaint_${report.issueCategory}_${report.reportId.slice(0, 8)}.pdf`;
  doc.save(safeFilename);
}
