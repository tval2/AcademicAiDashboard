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

  return (
    <table className="min-w-full border-collapse">
      <thead>
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
        {AREA_ORDER.map((area) => {
          let isFirstAreaRow = true;
          const areaRowCount = getAreaRowCount(area);

          return AREA_MAPPING[area].map((category) => {
            let isFirstCategoryRow = true;
            const categoryRowCount = getCategoryRowCount(category);

            return SUBCAT[category].map((subcategory, subIndex) => {
              const row = (
                <tr key={`${area}-${category}-${subcategory}`}>
                  {isFirstAreaRow && (
                    <td 
                      rowSpan={areaRowCount} 
                      className="border border-slate-200 px-3 py-2 align-middle"
                    >
                      <div className="writing-mode-vertical-lr transform rotate-180 text-sm font-medium text-slate-700 h-full flex items-center justify-center">
                        {area}
                      </div>
                    </td>
                  )}
                  
                  {isFirstCategoryRow && (
                    <td 
                      rowSpan={categoryRowCount} 
                      className="border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      {category}
                    </td>
                  )}
                  
                  <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    {subcategory}
                  </td>
                  
                  {DEPTHS.map((depth) => (
                    <td key={depth} className="border border-slate-200 px-3 py-2 text-center">
                      {renderCell(area, category, subcategory, depth)}
                    </td>
                  ))}
                </tr>
              );

              if (isFirstAreaRow) isFirstAreaRow = false;
              if (isFirstCategoryRow) isFirstCategoryRow = false;
              
              return row;
            });
          });
        })}
      </tbody>
    </table>
  );
};

export default MergedTable;
