const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function importCSV(table, file) {
  if (!fs.existsSync(file)) {
    console.warn(`File not found: ${file}`);
    return;
  }
  const csv = fs.readFileSync(file, 'utf8');
  const records = parse(csv, { columns: true, skip_empty_lines: true });
  for (const record of records) {
    // Remove empty string keys (csv-parse sometimes adds them)
    Object.keys(record).forEach(key => {
      if (key === '' || record[key] === undefined) delete record[key];
    });
    const { error } = await supabase.from(table).insert([record]);
    if (error) console.error(`Error inserting into ${table}:`, error, record);
  }
  console.log(`Imported ${records.length} records into ${table}`);
}

(async () => {
  await importCSV('users', 'users.csv');
  await importCSV('icps', 'icps.csv');
  await importCSV('saved_reports', 'saved_reports.csv');
})(); 