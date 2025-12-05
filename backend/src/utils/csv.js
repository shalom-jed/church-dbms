const buildCsv = (columns, rows) => {
  const header = columns.map((c) => c.header).join(',');
  const escapeVal = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val).replace(/"/g, '""');
    if (s.search(/[",\n]/g) >= 0) {
      return `"${s}` + '"';
    }
    return s;
  };
  const lines = rows.map((row) =>
    columns.map((c) => escapeVal(row[c.key])).join(',')
  );
  return [header, ...lines].join('\n');
};
const sendCsv = (res, filename, columns, rows) => {
  const csv = buildCsv(columns, rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}` + '"');
  res.send(csv);
};
module.exports = { buildCsv, sendCsv };