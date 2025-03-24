import React from "react";
import { AREA_ORDER, AREA_MAPPING, SUBCAT, DEPTHS } from "@/utils/hierarchyData";

interface MergedTableProps {
  data: any;
  renderCell: (area: string, category: string, subcategory: string, depth: string) => React.ReactNode;
}

const MergedTable: React.FC<MergedTableProps> = ({ data, renderCell }) => {
  // Calculate rowspans for the merged cells
  const getAreaRowCount = (area: string): number => {
    let count = 0;
    AREA_MAPPING[area].forEach((category) => {
      count += SUBCAT[category].length;
    });
    return count;
  };

  const getCategoryRowCount = (category: string): number => {
    return SUBCAT[category].length;
  };

  // Generate all rows first to make sure the table structure is properly formed
  const tableRows: React.ReactNode[] = [];
  
  AREA_ORDER.forEach((area) => {
    let isFirstAreaRow = true;
    const areaRowCount = getAreaRowCount(area);

    AREA_MAPPING[area].forEach((category) => {
      let isFirstCategoryRow = true;
      const categoryRowCount = getCategoryRowCount(category);

      SUBCAT[category].forEach((subcategory) => {
        const cells: React.ReactNode[] = [];
        
        // Add area cell with vertical text for the first row of each area
        if (isFirstAreaRow) {
          cells.push(
            <td 
              key={`area-${area}`}
              rowSpan={areaRowCount} 
              className="border border-slate-200 px-2 py-2 align-middle bg-slate-50"
            >
              <div className="writing-mode-vertical-lr transform rotate-180 text-sm font-medium text-slate-700 h-full flex items-center justify-center">
                {area}
              </div>
            </td>
          );
        }
        
        // Add category cell for the first row of each category
        if (isFirstCategoryRow) {
          cells.push(
            <td 
              key={`category-${category}`}
              rowSpan={categoryRowCount} 
              className="border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-slate-50/50"
            >
              {category}
            </td>
          );
        }
        
        // Add subcategory cell
        cells.push(
          <td 
            key={`subcategory-${subcategory}`} 
            className="border border-slate-200 px-3 py-2 text-sm text-slate-700"
          >
            {subcategory}
          </td>
        );
        
        // Add depth cells
        DEPTHS.forEach((depth) => {
          cells.push(
            <td 
              key={`${subcategory}-${depth}`} 
              className="border border-slate-200 px-2 py-2 text-center min-w-[80px]"
            >
              {renderCell(area, category, subcategory, depth)}
            </td>
          );
        });
        
        // Add the complete row
        tableRows.push(
          <tr key={`${area}-${category}-${subcategory}`}>
            {cells}
          </tr>
        );
        
        if (isFirstAreaRow) isFirstAreaRow = false;
        if (isFirstCategoryRow) isFirstCategoryRow = false;
      });
    });
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2 bg-slate-100 text-left text-xs font-semibold text-slate-700 border border-slate-200 w-24">Area</th>
            <th className="px-3 py-2 bg-slate-100 text-left text-xs font-semibold text-slate-700 border border-slate-200 w-56">Category</th>
            <th className="px-3 py-2 bg-slate-100 text-left text-xs font-semibold text-slate-700 border border-slate-200 w-72">Subcategory</th>
            {DEPTHS.map((depth) => (
              <th key={depth} className="px-3 py-2 bg-slate-100 text-center text-xs font-semibold text-slate-700 border border-slate-200 w-36">
                {depth.split(" ")[0]}<br />{depth.split(" ").slice(1).join(" ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    </div>
  );
};

export default MergedTable;
