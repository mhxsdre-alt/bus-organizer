import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Bus } from './BusCard';
import { getAllComplaints } from './Complaints';
import { t, getLang } from '../utils/i18n';

const PLATFORM_COUNT = 9;

export async function generatePdfReport(buses: Bus[]) {
    if (buses.length === 0) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const now = new Date();
    const locale = getLang() === 'he' ? 'he-IL' : 'en-GB';
    const dateStr = now.toLocaleDateString(locale);
    const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    // ===== Title =====
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(t('pdf.title'), pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(`${t('pdf.generated')}: ${dateStr} ${timeStr}`, pageWidth / 2, 25, { align: 'center' });
    doc.setTextColor(0);

    // ===== Summary Stats =====
    const arrivedCount = buses.filter(b => b.arrived).length;
    const pendingCount = buses.length - arrivedCount;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('pdf.total')}: ${buses.length}`, 14, 35);
    doc.setTextColor(34, 139, 34);
    doc.text(`${t('pdf.arrived')}: ${arrivedCount}`, 55, 35);
    doc.setTextColor(200, 80, 0);
    doc.text(`${t('pdf.pending')}: ${pendingCount}`, 95, 35);
    doc.setTextColor(0);

    // ===== Bus Table =====
    const tableData = buses.map((bus, i) => [
        (i + 1).toString(),
        bus.lineNumber || '—',
        bus.plateNumber || '—',
        bus.platformNumber || '—',
        bus.destination || '—',
        bus.notes || '',
        bus.arrived ? `✓ ${t('pdf.yes')}` : `✗ ${t('pdf.no')}`,
    ]);

    autoTable(doc, {
        startY: 40,
        head: [[
            '#',
            t('col.line'),
            t('col.plate'),
            t('col.platform'),
            t('col.destination'),
            t('col.notes'),
            t('col.arrived'),
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [37, 150, 190],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: [245, 245, 250],
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            6: { halign: 'center' },
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 6) {
                const val = data.cell.raw as string;
                if (val.startsWith('✓')) {
                    data.cell.styles.textColor = [34, 139, 34];
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [200, 80, 0];
                }
            }
        },
        margin: { left: 14, right: 14 },
    });

    // ===== Parking Lot Map =====
    const tableEndY = (doc as any).lastAutoTable?.finalY ?? 100;
    let mapStartY = tableEndY + 15;

    if (mapStartY + 60 > pageHeight) {
        doc.addPage();
        mapStartY = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('pdf.parkingMap'), pageWidth / 2, mapStartY, { align: 'center' });
    mapStartY += 8;

    // Group buses by platform
    const platforms: Map<number, Bus[]> = new Map();
    for (let i = 1; i <= PLATFORM_COUNT; i++) {
        platforms.set(i, []);
    }
    buses.forEach(bus => {
        const num = parseInt(bus.platformNumber, 10);
        if (num >= 1 && num <= PLATFORM_COUNT) {
            platforms.get(num)!.push(bus);
        }
    });

    const mapLeft = 14;
    const mapWidth = pageWidth - 28;
    const colWidth = mapWidth / PLATFORM_COUNT;
    const slotHeight = 10;
    const headerHeight = 8;
    const maxSlots = Math.max(1, ...Array.from(platforms.values()).map(b => b.length));
    const mapHeight = headerHeight + maxSlots * slotHeight + 4;

    for (let i = 0; i < PLATFORM_COUNT; i++) {
        const x = mapLeft + i * colWidth;
        const platformBuses = platforms.get(i + 1)!;

        doc.setFillColor(37, 150, 190);
        doc.roundedRect(x + 0.5, mapStartY, colWidth - 1, headerHeight, 1, 1, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255);
        doc.text(`P${i + 1}`, x + colWidth / 2, mapStartY + 5.5, { align: 'center' });

        doc.setFillColor(240, 240, 248);
        doc.rect(x + 0.5, mapStartY + headerHeight, colWidth - 1, mapHeight - headerHeight, 'F');

        doc.setTextColor(0);
        if (platformBuses.length === 0) {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(160);
            doc.text(t('pdf.empty'), x + colWidth / 2, mapStartY + headerHeight + 6, { align: 'center' });
            doc.setTextColor(0);
        } else {
            platformBuses.forEach((bus, idx) => {
                const slotY = mapStartY + headerHeight + idx * slotHeight + 1;
                if (bus.arrived) {
                    doc.setFillColor(220, 252, 231);
                    doc.setDrawColor(34, 197, 94);
                } else {
                    doc.setFillColor(255, 255, 255);
                    doc.setDrawColor(200, 200, 210);
                }
                doc.roundedRect(x + 1.5, slotY, colWidth - 3, slotHeight - 1.5, 1, 1, 'FD');
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30);
                doc.text(bus.lineNumber || '?', x + colWidth / 2, slotY + 4, { align: 'center' });
                doc.setFontSize(5.5);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100);
                const dest = (bus.destination || '—').substring(0, 12);
                doc.text(dest, x + colWidth / 2, slotY + 7.5, { align: 'center' });
            });
        }
    }

    doc.setDrawColor(0);
    doc.setTextColor(0);

    // ===== Complaints Section =====
    const allComplaints = await getAllComplaints();
    const todayStr = now.toISOString().slice(0, 10);
    const todayComplaints = allComplaints.filter(c => c.date.slice(0, 10) === todayStr);

    if (todayComplaints.length > 0) {
        doc.addPage();
        let y = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(t('pdf.complaintsTitle'), pageWidth / 2, y, { align: 'center' });
        y += 10;

        for (const complaint of todayComplaints) {
            if (y + 50 > pageHeight) {
                doc.addPage();
                y = 20;
            }

            const cTime = new Date(complaint.date);
            const cTimeStr = cTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

            // Red left border
            doc.setFillColor(239, 68, 68);
            doc.rect(14, y, 2, 30, 'F');

            // Card background
            doc.setFillColor(250, 250, 252);
            doc.setDrawColor(220, 220, 230);
            doc.roundedRect(16, y, pageWidth - 30, 30, 2, 2, 'FD');

            // Type badge
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(239, 68, 68);
            doc.text(`${complaint.complaintType}`, 20, y + 6);

            // Time
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(120);
            doc.text(cTimeStr, pageWidth - 20, y + 6, { align: 'right' });

            // Details line 1: Line / Plate / Driver
            doc.setTextColor(60);
            doc.setFontSize(8);
            const infoLine = [
                complaint.lineNumber ? `${t('col.line')}: ${complaint.lineNumber}` : '',
                complaint.plateNumber ? `${t('col.plate')}: ${complaint.plateNumber}` : '',
                complaint.driverDescription ? `${t('pdf.driver')}: ${complaint.driverDescription}` : '',
            ].filter(Boolean).join('  •  ');
            if (infoLine) doc.text(infoLine, 20, y + 13);

            // Details text
            if (complaint.details) {
                doc.setFontSize(7.5);
                doc.setTextColor(80);
                const lines = doc.splitTextToSize(complaint.details, pageWidth - 40);
                doc.text(lines.slice(0, 3), 20, y + 19);
            }

            let cardHeight = 32;

            // Embedded photo
            if (complaint.photo) {
                try {
                    const photoY = y + cardHeight + 2;
                    if (photoY + 45 > pageHeight) {
                        doc.addPage();
                        y = 20;
                    } else {
                        y = photoY - 32;
                    }
                    doc.addImage(complaint.photo, 'JPEG', 20, y + 32, 60, 40);
                    cardHeight += 44;
                } catch { /* skip if image fails */ }
            }

            y += cardHeight + 5;
        }
    }

    // ===== Save =====
    doc.save(`bus-report-${now.toISOString().slice(0, 10)}.pdf`);
}
