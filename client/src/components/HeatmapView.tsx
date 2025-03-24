import React, { useMemo } from "react";
import { CSVRow } from "./AICurriculumDashboard";
import {
  AREA_ORDER,
  AREA_MAPPING,
  SUBCAT,
  DEPTHS,
} from "@/utils/hierarchyData";
import MergedTable from "./MergedTable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapViewProps {
  csvData: CSVRow[];
}

type HeatmapData = {
  [area: string]: {
    [category: string]: {
      [subcategory: string]: {
        [depth: string]: string[];
      };
    };
  };
};

const HeatmapView: React.FC<HeatmapViewProps> = ({ csvData }) => {
  // Build heatmap data structure
  const heatmapData = useMemo(() => {
    const data: HeatmapData = {};

    // Initialize structure
    AREA_ORDER.forEach((area) => {
      data[area] = {};
      AREA_MAPPING[area].forEach((category) => {
        data[area][category] = {};
        SUBCAT[category].forEach((subcategory) => {
          data[area][category][subcategory] = {
            [DEPTHS[0]]: [],
            [DEPTHS[1]]: [],
            [DEPTHS[2]]: [],
          };
        });
      });
    });

    // Fill with data
    csvData.forEach((row) => {
      const area = row["Area"]?.trim();
      const category = row["Category"]?.trim();
      const subcategory = row["Subcategory"]?.trim();
      const depth = row["Depth of Coverage"]?.trim();
      const course = row["Number - Name"]?.trim();

      if (
        area &&
        category &&
        subcategory &&
        depth &&
        course &&
        AREA_ORDER.includes(area) &&
        AREA_MAPPING[area].includes(category) &&
        SUBCAT[category].includes(subcategory) &&
        DEPTHS.includes(depth)
      ) {
        data[area][category][subcategory][depth].push(course);
      }
    });

    return data;
  }, [csvData]);

  // Generate table cell content
  const renderCell = (
    area: string,
    category: string,
    subcategory: string,
    depth: string,
  ) => {
    const courses = heatmapData[area][category][subcategory][depth];
    const count = courses.length;
    if (count === 0) {
      return (
        <span className="text-red-500 flex h-full items-center justify-center">
          ❌
        </span>
      );
    }
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger className="w-full h-full">
            <div
              className={`${count >= 3 ? "bg-slate-200" : ""} w-full h-full flex items-center justify-center cursor-pointer`}
              style={{ height: "40px" }}
            >
              <span className="text-green-500">✅</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-md text-xs z-50">
            <div className="font-medium mb-1">Courses ({count}):</div>
            <ul className="list-disc pl-4 space-y-0.5">
              {courses.map((course, index) => (
                <li key={index}>{course}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="w-full">
      <MergedTable
        data={heatmapData}
        renderCell={(area, category, subcategory, depth) =>
          renderCell(area, category, subcategory, depth)
        }
      />

      <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-600">
        <p className="font-semibold mb-2">Legend:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-4">
          <div className="flex items-center">
            <span className="inline-block text-green-500 mr-2">✅</span>
            <span>1 or more courses (hover to see list)</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block text-red-500 mr-2">❌</span>
            <span>No courses</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-slate-200 mr-2"></span>
            <span>3 or more courses (potential overlap)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapView;
