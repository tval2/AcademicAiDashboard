import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { type CSVRow } from "./AICurriculumDashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface DataTableViewProps {
  csvData: CSVRow[];
}

const DataTableView: React.FC<DataTableViewProps> = ({ csvData }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Get all column headers from the data
  const columns = csvData.length > 0 ? Object.keys(csvData[0]) : [];

  // Filter data based on search term
  const filteredData = csvData.filter((row) => {
    if (!searchTerm) return true;

    // Check if any field contains the search term
    return Object.values(row).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Search data..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Data Table */}
      {csvData.length > 0 ? (
        <div className="border border-slate-200 rounded-md">
          <ScrollArea className="h-[500px]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={
                        rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          className="px-6 py-4 whitespace-nowrap text-sm text-slate-700"
                        >
                          {row[column] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-slate-500">
            No data available. Please upload a CSV file.
          </p>
        </div>
      )}

      <div className="text-sm text-slate-500 text-right">
        Showing {filteredData.length} of {csvData.length} rows
      </div>
    </div>
  );
};

export default DataTableView;
