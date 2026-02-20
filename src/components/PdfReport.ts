import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Bus } from './BusCard';

const PLATFORM_COUNT = 9;

export function generatePdfReport(buses: Bus[]) {
    if (buses.length === 0) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    // ===== Title =====
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Bus Organizer Report', pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(`Generated: ${dateStr} ${timeStr}`, pageWidth / 2, 25, { align: 'center' });
    doc.setTextColor(0);

    // ===== Summary Stats =====
    const arrivedCount = buses.filter(b => b.arrived).length;
    const pendingCount = buses.length - arrivedCount;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${buses.length}`, 14, 35);
    doc.setTextColor(34, 139, 34);
    doc.text(`Arrived: ${arrivedCount}`, 55, 35);
    doc.setTextColor(200, 80, 0);
    doc.text(`Pending: ${pendingCount}`, 95, 35);
    doc.setTextColor(0);

    // ===== Bus Table =====
    const tableData = buses.map((bus, i) => [
        (i + 1).toString(),
        bus.lineNumber || '—',
        bus.plateNumber || '—',
        bus.platformNumber || '—',
        bus.destination || '—',
        bus.notes || '',
        bus.arrived ? '✓ Yes' : '✗ No',
    ]);

    autoTable(doc, {
        startY: 40,
        head: [['#', 'Line', 'Plate', 'Platform', 'Destination', 'Notes', 'Arrived']],
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

    // Check if we need a new page
    const pageHeight = doc.internal.pageSize.getHeight();
    if (mapStartY + 60 > pageHeight) {
        doc.addPage();
        mapStartY = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Parking Lot Map', pageWidth / 2, mapStartY, { align: 'center' });
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

    // Draw platform columns
    for (let i = 0; i < PLATFORM_COUNT; i++) {
        const x = mapLeft + i * colWidth;
        const platformBuses = platforms.get(i + 1)!;

        // Header
        doc.setFillColor(37, 150, 190);
        doc.roundedRect(x + 0.5, mapStartY, colWidth - 1, headerHeight, 1, 1, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255);
        doc.text(`P${i + 1}`, x + colWidth / 2, mapStartY + 5.5, { align: 'center' });

        // Column background
        doc.setFillColor(240, 240, 248);
        doc.rect(x + 0.5, mapStartY + headerHeight, colWidth - 1, mapHeight - headerHeight, 'F');

        // Bus slots
        doc.setTextColor(0);
        if (platformBuses.length === 0) {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(160);
            doc.text('Empty', x + colWidth / 2, mapStartY + headerHeight + 6, { align: 'center' });
            doc.setTextColor(0);
        } else {
            platformBuses.forEach((bus, idx) => {
                const slotY = mapStartY + headerHeight + idx * slotHeight + 1;

                // Slot box
                if (bus.arrived) {
                    doc.setFillColor(220, 252, 231);
                    doc.setDrawColor(34, 197, 94);
                } else {
                    doc.setFillColor(255, 255, 255);
                    doc.setDrawColor(200, 200, 210);
                }
                doc.roundedRect(x + 1.5, slotY, colWidth - 3, slotHeight - 1.5, 1, 1, 'FD');

                // Line number
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30);
                doc.text(bus.lineNumber || '?', x + colWidth / 2, slotY + 4, { align: 'center' });

                // Destination
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

    // ===== Save =====
    doc.save(`bus-report-${now.toISOString().slice(0, 10)}.pdf`);
}
