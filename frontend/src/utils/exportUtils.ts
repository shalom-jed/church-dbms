import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// PDF Export for Reports
export const exportToPDF = (title: string, data: any[], columns: string[]) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.setTextColor(249, 115, 22); // Orange
  doc.text('Assembly of God Church - Ruwanwella', 14, 15);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
  
  // Add table
  autoTable(doc, {
    startY: 40,
    head: [columns],
    body: data,
    theme: 'grid',
    headStyles: {
      fillColor: [249, 115, 22], // Orange
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });
  
  // Save
  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Excel Export
export const exportToExcel = (title: string, data: any[], filename?: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, title);
  
  // Auto-size columns
  const max_width = data.reduce((w, r) => Math.max(w, ...Object.keys(r).map(k => k.length)), 10);
  worksheet['!cols'] = Array(Object.keys(data[0] || {}).length).fill({ wch: max_width });
  
  XLSX.writeFile(
    workbook,
    filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  );
};

// Members Export
export const exportMembersToPDF = (members: any[]) => {
  const data = members.map(m => [
    `${m.firstName} ${m.lastName}`,
    m.email || 'N/A',
    m.phonePrimary || 'N/A',
    m.gender,
    m.membershipStatus,
  ]);
  
  exportToPDF(
    'Members List',
    data,
    ['Name', 'Email', 'Phone', 'Gender', 'Status']
  );
};

export const exportMembersToExcel = (members: any[]) => {
  const data = members.map(m => ({
    'Name': `${m.firstName} ${m.lastName}`,
    'Email': m.email || 'N/A',
    'Phone': m.phonePrimary || 'N/A',
    'Gender': m.gender,
    'Status': m.membershipStatus,
    'Baptized': m.baptismStatus,
    'Join Date': m.joinDate ? new Date(m.joinDate).toLocaleDateString() : 'N/A',
  }));
  
  exportToExcel('Members List', data, 'Members_Report.xlsx');
};

// Finance Export
export const exportFinanceToPDF = (records: any[], type: 'income' | 'expense', summary?: any) => {
  const data = records.map(r => [
    new Date(r.date).toLocaleDateString(),
    r.category.categoryName,
    `LKR ${r.amount.toLocaleString()}`,
    r.paymentMethod,
    r.description || r.notes || '-',
  ]);
  
  // Add summary row if provided
  if (summary) {
    data.push(['', '', '', 'TOTAL:', `LKR ${summary.toLocaleString()}`]);
  }
  
  exportToPDF(
    `${type === 'income' ? 'Income' : 'Expense'} Records`,
    data,
    ['Date', 'Category', 'Amount', 'Method', 'Description']
  );
};

export const exportFinanceToExcel = (records: any[], type: 'income' | 'expense') => {
  const data = records.map(r => ({
    'Date': new Date(r.date).toLocaleDateString(),
    'Category': r.category.categoryName,
    'Amount': r.amount,
    'Payment Method': r.paymentMethod,
    'Description': r.description || r.notes || '-',
  }));
  
  // Add summary row
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  data.push({
    'Date': '',
    'Category': '',
    'Amount': '',
    'Payment Method': 'TOTAL:',
    'Description': total,
  });
  
  exportToExcel(
    `${type === 'income' ? 'Income' : 'Expense'} Records`,
    data,
    `Finance_${type}_Report.xlsx`
  );
};

// Attendance Export
export const exportAttendanceToPDF = (services: any[]) => {
  const data = services.map(s => [
    new Date(s.serviceDate).toLocaleDateString(),
    s.totalAttendance,
    s.membersCount,
    s.visitorsCount,
    s.firstTimersCount,
  ]);
  
  // Add summary
  const totals = services.reduce(
    (acc, s) => ({
      total: acc.total + s.totalAttendance,
      members: acc.members + s.membersCount,
      visitors: acc.visitors + s.visitorsCount,
      firstTimers: acc.firstTimers + s.firstTimersCount,
    }),
    { total: 0, members: 0, visitors: 0, firstTimers: 0 }
  );
  
  data.push(['TOTAL:', totals.total, totals.members, totals.visitors, totals.firstTimers]);
  
  exportToPDF(
    'Sunday Service Attendance',
    data,
    ['Date', 'Total', 'Members', 'Visitors', 'First Timers']
  );
};

export const exportAttendanceToExcel = (services: any[]) => {
  const data = services.map(s => ({
    'Date': new Date(s.serviceDate).toLocaleDateString(),
    'Total Attendance': s.totalAttendance,
    'Members': s.membersCount,
    'Visitors': s.visitorsCount,
    'First Timers': s.firstTimersCount,
  }));
  
  exportToExcel('Sunday Service Attendance', data, 'Attendance_Report.xlsx');
};