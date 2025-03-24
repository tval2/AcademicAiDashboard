import React, { useMemo, useState } from "react";
import { CSVRow } from "./AICurriculumDashboard";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AREA_ORDER,
  AREA_MAPPING,
  SUBCAT,
  DEPTHS,
} from "@/utils/hierarchyData";
import MergedTable from "./MergedTable";

interface CourseViewProps {
  csvData: CSVRow[];
}

type CourseData = {
  name: string;
  tags: string[];
  coverage: {
    [area: string]: {
      [category: string]: {
        [subcategory: string]: {
          [depth: string]: string | null;
        };
      };
    };
  };
};

const CourseView: React.FC<CourseViewProps> = ({ csvData }) => {
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Extract all unique courses
  const allCourses = useMemo(() => {
    const courseSet = new Set<string>();
    csvData.forEach((row) => {
      const course = row["Number - Name"]?.trim();
      if (course) {
        courseSet.add(course);
      }
    });
    return Array.from(courseSet).sort();
  }, [csvData]);

  // Get course data when selected
  const courseData = useMemo(() => {
    if (!selectedCourse) return null;

    const data: CourseData = {
      name: selectedCourse,
      tags: [],
      coverage: {},
    };

    // Initialize coverage structure
    AREA_ORDER.forEach((area) => {
      data.coverage[area] = {};
      AREA_MAPPING[area].forEach((category) => {
        data.coverage[area][category] = {};
        SUBCAT[category].forEach((subcategory) => {
          data.coverage[area][category][subcategory] = {
            [DEPTHS[0]]: null,
            [DEPTHS[1]]: null,
            [DEPTHS[2]]: null,
          };
        });
      });
    });

    // Find all data for this course
    csvData.forEach((row) => {
      if (row["Number - Name"]?.trim() === selectedCourse) {
        // Extract tags
        const tagString = row["Tags"]?.trim() || "";
        if (tagString) {
          // Handle tags in format: ["tag1", "tag2", "tag3"]
          const cleanTagString = tagString.replace(/^\[|\]$/g, "").trim();
          const tags = cleanTagString
            .split(",")
            .map((tag) => tag.trim().replace(/^["']|["']$/g, ""))
            .filter((tag) => tag);

          tags.forEach((tag) => {
            if (!data.tags.includes(tag)) {
              data.tags.push(tag);
            }
          });
        }

        // Extract coverage
        const area = row["Area"]?.trim();
        const category = row["Category"]?.trim();
        const subcategory = row["Subcategory"]?.trim();
        const depth = row["Depth of Coverage"]?.trim();
        const justification =
          row["Justification"]?.trim() || "No justification provided";

        if (
          area &&
          category &&
          subcategory &&
          depth &&
          AREA_ORDER.includes(area) &&
          AREA_MAPPING[area].includes(category) &&
          SUBCAT[category].includes(subcategory) &&
          DEPTHS.includes(depth)
        ) {
          data.coverage[area][category][subcategory][depth] = justification;
        }
      }
    });

    return data;
  }, [selectedCourse, csvData]);

  // Generate table cell content
  const renderCell = (
    area: string,
    category: string,
    subcategory: string,
    depth: string,
  ) => {
    if (!courseData) return <span className="text-red-500">❌</span>;

    const justification =
      courseData.coverage[area][category][subcategory][depth];

    if (!justification) {
      return <span className="text-red-500">❌</span>;
    }

    // Use title attribute for tooltip
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="w-full h-full flex items-center justify-center cursor-pointer">
              <span className="text-green-500">✅</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-md text-xs">
            <div className="font-medium mb-1">Justification:</div>
            <p>{justification}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Select a course:
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedCourse || "Select a course..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search courses..." />
              <CommandEmpty>No course found.</CommandEmpty>
              <CommandGroup>
                <CommandList className="max-h-[300px]">
                  {allCourses.map((course) => (
                    <CommandItem
                      key={course}
                      value={course}
                      onSelect={() => {
                        setSelectedCourse(course);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCourse === course
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {course}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {courseData && (
        <>
          <div className="mb-6">
            <h3 className="text-md font-medium text-slate-800 mb-2">
              {courseData.name}
            </h3>
            <div className="mb-3">
              <p className="text-sm font-medium text-slate-700 mb-1">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {courseData.tags.length === 0 ? (
                  <span className="text-sm text-slate-500">No tags</span>
                ) : (
                  courseData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="w-full overflow-auto">
            <MergedTable
              data={courseData.coverage}
              renderCell={(area, category, subcategory, depth) =>
                renderCell(area, category, subcategory, depth)
              }
            />

            <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-600">
              <p className="font-semibold mb-2">Legend:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4">
                <div className="flex items-center">
                  <span className="inline-block text-green-500 mr-2">✅</span>
                  <span>
                    Course covers this area (hover to see justification)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block text-red-500 mr-2">❌</span>
                  <span>Course does not cover this area</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseView;
