import { CSVRow } from "@/components/AICurriculumDashboard";

export function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.split(/\r\n|\n/);
  if (lines.length === 0) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  
  const result: CSVRow[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;
    
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    result.push(row);
  }
  
  return result;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentValue = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i < line.length - 1 && line[i + 1] === '"') {
        // Handle escaped quotes (two double quotes)
        currentValue += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(currentValue);
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  
  // Add the last field
  result.push(currentValue);
  
  return result;
}
