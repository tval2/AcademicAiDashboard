import React, { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { type CSVRow } from "./AICurriculumDashboard";

// Colors for each circle/region
const VENN_COLORS = {
  course1: "#9b87f5",
  course2: "#0EA5E9",
  course3: "#F97316",
  overlap12: "#8B5CF6",
  overlap13: "#D946EF",
  overlap23: "#33C3F0",
  overlapAll: "#8E9196",
};

interface VennDiagramViewProps {
  csvData: CSVRow[];
}

// We'll store coverage info in an object with both depth + justification.
type CoverageInfo = {
  depth: string;
  justification: string;
};

// coverageMap[courseName][subcategory] = { depth, justification }
type CoverageMap = Record<string, Record<string, CoverageInfo>>;

/**
 * Main Venn diagram component.
 */
const VennDiagramView: React.FC<VennDiagramViewProps> = ({ csvData }) => {
  // The three chosen courses (the 3rd can be "none"/empty)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([
    "",
    "",
    "",
  ]);

  // State for the current search text in the dropdown
  const [searchTerm, setSearchTerm] = useState("");

  // 1) Gather all course names
  const allCourses = useMemo(() => {
    const unique = new Set<string>();
    csvData.forEach((row) => {
      const name = row["Number - Name"]?.trim();
      if (name) unique.add(name);
    });
    return Array.from(unique).sort();
  }, [csvData]);

  // 2) Build coverage map: courseName -> subcat -> { depth, justification }
  const courseCoverageMap: CoverageMap = useMemo(() => {
    const coverage: CoverageMap = {};
    csvData.forEach((row) => {
      const courseName = row["Number - Name"]?.trim();
      const subcat = row["Subcategory"]?.trim();
      const depth = row["Depth of Coverage"]?.trim() || "";
      const justification = row["Justification"]?.trim() || "No justification";

      // Only store coverage if depth is not empty or "0"
      if (courseName && subcat && depth && depth !== "0") {
        if (!coverage[courseName]) {
          coverage[courseName] = {};
        }
        coverage[courseName][subcat] = { depth, justification };
      }
    });
    return coverage;
  }, [csvData]);

  // 3) For each selected course, gather its coverage
  const courseSubcats = useMemo(() => {
    return {
      course1: selectedCourses[0]
        ? courseCoverageMap[selectedCourses[0]] || {}
        : {},
      course2: selectedCourses[1]
        ? courseCoverageMap[selectedCourses[1]] || {}
        : {},
      course3: selectedCourses[2]
        ? courseCoverageMap[selectedCourses[2]] || {}
        : {},
    };
  }, [selectedCourses, courseCoverageMap]);

  // 4) Build the “vennSections” object:
  // vennSections.regionName[subcat] = {
  //   course1?: CoverageInfo,
  //   course2?: CoverageInfo,
  //   course3?: CoverageInfo
  // }
  const vennSections = useMemo(() => {
    const c1 = courseSubcats.course1;
    const c2 = courseSubcats.course2;
    const c3 = courseSubcats.course3;

    // subcat lists
    const keys1 = Object.keys(c1);
    const keys2 = Object.keys(c2);
    const keys3 = Object.keys(c3);

    const intersect = (a: string[], b: string[]) =>
      a.filter((x) => b.includes(x));
    const intersectAll = (a: string[], b: string[], c: string[]) =>
      a.filter((x) => b.includes(x) && c.includes(x));

    // 2-course overlaps
    const overlap12Keys = intersect(keys1, keys2);
    const overlap13Keys = intersect(keys1, keys3);
    const overlap23Keys = intersect(keys2, keys3);
    // 3-course overlap
    const overlapAllKeys = intersectAll(keys1, keys2, keys3);

    // unique sets
    const unique1 = keys1.filter(
      (x) => !keys2.includes(x) && !keys3.includes(x),
    );
    const unique2 = keys2.filter(
      (x) => !keys1.includes(x) && !keys3.includes(x),
    );
    const unique3 = keys3.filter(
      (x) => !keys1.includes(x) && !keys2.includes(x),
    );

    // 2-overlaps only (removing triple overlap)
    const overlap12Only = overlap12Keys.filter(
      (x) => !overlapAllKeys.includes(x),
    );
    const overlap13Only = overlap13Keys.filter(
      (x) => !overlapAllKeys.includes(x),
    );
    const overlap23Only = overlap23Keys.filter(
      (x) => !overlapAllKeys.includes(x),
    );

    // Helper to build region object
    function buildMap(
      subcats: string[],
      which: Array<"course1" | "course2" | "course3">,
    ) {
      const result: Record<
        string,
        {
          course1?: CoverageInfo;
          course2?: CoverageInfo;
          course3?: CoverageInfo;
        }
      > = {};
      subcats.forEach((subcat) => {
        result[subcat] = {};
        which.forEach((w) => {
          // e.g. if w="course1", then result[subcat].course1 = c1[subcat]
          if (w === "course1") result[subcat].course1 = c1[subcat];
          if (w === "course2") result[subcat].course2 = c2[subcat];
          if (w === "course3") result[subcat].course3 = c3[subcat];
        });
      });
      return result;
    }

    return {
      course1: buildMap(unique1, ["course1"]),
      course2: buildMap(unique2, ["course2"]),
      course3: buildMap(unique3, ["course3"]),
      overlap12: buildMap(overlap12Only, ["course1", "course2"]),
      overlap13: buildMap(overlap13Only, ["course1", "course3"]),
      overlap23: buildMap(overlap23Only, ["course2", "course3"]),
      overlapAll: buildMap(overlapAllKeys, ["course1", "course2", "course3"]),
    };
  }, [courseSubcats]);

  // Handle selecting a course
  const handleCourseChange = (value: string, index: number) => {
    const newSelected = [...selectedCourses];
    // if user picks "none" in 3rd -> store ""
    newSelected[index] = value === "none" ? "" : value;
    setSelectedCourses(newSelected);
  };

  // Filter out courses that are already selected in another dropdown
  const getAvailableCourses = (index: number) => {
    const usedElsewhere = selectedCourses.filter((_, i) => i !== index);
    return allCourses.filter((c) => !usedElsewhere.includes(c));
  };

  // We show 2-circle diagram if at least 2 non-empty, 3-circle if all three are chosen
  const hasAtLeastTwo = selectedCourses[0] && selectedCourses[1];
  const hasThree = selectedCourses.every((c) => c !== "");

  return (
    <div className="space-y-6">
      {/* ----------------------  SELECTION ROW  ---------------------- */}
      <div className="flex flex-col md:flex-row gap-4">
        {["Course 1", "Course 2", "Course 3"].map((label, i) => {
          const borderColor =
            i === 0
              ? VENN_COLORS.course1
              : i === 1
                ? VENN_COLORS.course2
                : VENN_COLORS.course3;

          // If the 3rd is empty, we store "", but the UI must show "none"
          const selectVal =
            i === 2 && selectedCourses[i] === "" ? "none" : selectedCourses[i];

          return (
            <div
              key={i}
              className="flex-1"
              style={{ borderBottom: `3px solid ${borderColor}` }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {i === 2 && "(Optional)"}
              </label>
              <Select
                value={selectVal}
                onValueChange={(v) => handleCourseChange(v, i)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={i < 2 ? `Select ${label}` : "No Course"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-3 py-2 border-b">
                    <Search className="mr-2 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full focus:outline-none placeholder:text-gray-400 text-sm"
                      placeholder="Search courses..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-48">
                    {/* For the 3rd slot, allow 'none' */}
                    {i === 2 && <SelectItem value="none">No Course</SelectItem>}

                    {getAvailableCourses(i)
                      .filter((course) =>
                        course.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>

      {/* ----------------------  VENN DIAGRAM  ---------------------- */}
      {hasAtLeastTwo ? (
        <>
          <div className="relative mx-auto" style={{ width: 500, height: 400 }}>
            {hasThree ? (
              <ThreeCircleVenn vennSections={vennSections} />
            ) : (
              <TwoCircleVenn vennSections={vennSections} />
            )}
          </div>

          {/* ----------------------  TABLE BELOW  ---------------------- */}
          <RegionsTable
            vennSections={vennSections}
            selectedCourses={selectedCourses}
          />
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-slate-500">
            Please select at least two courses to view the Venn diagram.
          </p>
        </div>
      )}
    </div>
  );
};

export default VennDiagramView;

/** 2-circle layout with carefully chosen center points for the circles. */
const TwoCircleVenn = ({
  vennSections,
}: {
  vennSections: ReturnType<typeof buildVennSectionsType>;
}) => {
  // We'll define circle 1's top/left, circle 2's top/left, and radius=100
  // Then compute the center points for each region.
  // circle 1 is at top=100, left=80 => center is (180, 200)
  // circle 2 is at top=100, left=220 => center is (320, 200)
  // Overlap center is midpoint => (250, 200)

  const radius = 100;

  // Circle 1
  const circle1Top = 100;
  const circle1Left = 80;
  const c1CenterX = circle1Left + radius;
  const c1CenterY = circle1Top + radius;

  // Circle 2
  const circle2Top = 100;
  const circle2Left = 220;
  const c2CenterX = circle2Left + radius;
  const c2CenterY = circle2Top + radius;

  // Overlap center is midpoint of c1Center and c2Center
  const overlap12X = (c1CenterX + c2CenterX) / 2;
  const overlap12Y = (c1CenterY + c2CenterY) / 2;

  // Count how many subcats in each region
  const c1Count = Object.keys(vennSections.course1).length;
  const c2Count = Object.keys(vennSections.course2).length;
  const o12Count = Object.keys(vennSections.overlap12).length;

  return (
    <div className="relative w-full h-full">
      {/* Circle 1 */}
      <div
        style={{
          position: "absolute",
          width: radius * 2,
          height: radius * 2,
          top: circle1Top,
          left: circle1Left,
          backgroundColor: VENN_COLORS.course1,
          borderRadius: "50%",
          opacity: 0.6,
        }}
      />
      {/* Circle 2 */}
      <div
        style={{
          position: "absolute",
          width: radius * 2,
          height: radius * 2,
          top: circle2Top,
          left: circle2Left,
          backgroundColor: VENN_COLORS.course2,
          borderRadius: "50%",
          opacity: 0.6,
        }}
      />

      {/* Place badges at each region's center if count > 0 */}
      {c1Count > 0 && (
        <CountBadge
          count={c1Count}
          style={{
            top: c1CenterY - 12, // minus half badge size
            left: c1CenterX - 12,
          }}
        />
      )}
      {c2Count > 0 && (
        <CountBadge
          count={c2Count}
          style={{
            top: c2CenterY - 12,
            left: c2CenterX - 12,
          }}
        />
      )}
      {o12Count > 0 && (
        <CountBadge
          count={o12Count}
          style={{
            top: overlap12Y - 12,
            left: overlap12X - 12,
          }}
        />
      )}
    </div>
  );
};

/** 3-circle layout with approximate geometry so all 3 circles overlap somewhat. */
const ThreeCircleVenn = ({
  vennSections,
}: {
  vennSections: ReturnType<typeof buildVennSectionsType>;
}) => {
  // Circle 1 at (top=120, left=80)
  // Circle 2 at (top=120, left=220)
  // Circle 3 at (top=0,   left=150)
  // Each radius=100 => centers:
  // c1 center = (180, 220)
  // c2 center = (320, 220)
  // c3 center = (250, 100)
  // Overlaps:
  // 1&2 => midpoint => (250, 220)
  // 1&3 => midpoint => ( (180+250)/2=215, (220+100)/2=160 )
  // 2&3 => midpoint => ( (320+250)/2=285, (220+100)/2=160 )
  // all3 => centroid => ( (180+320+250)/3=250, (220+220+100)/3=180 )

  const radius = 100;

  // circle 1
  const c1Top = 120,
    c1Left = 80;
  const c1Center = { x: c1Left + radius, y: c1Top + radius }; // (180,220)

  // circle 2
  const c2Top = 120,
    c2Left = 220;
  const c2Center = { x: c2Left + radius, y: c2Top + radius }; // (320,220)

  // circle 3
  const c3Top = 0,
    c3Left = 150;
  const c3Center = { x: c3Left + radius, y: c3Top + radius }; // (250,100)

  // Overlap centers
  const overlap12 = {
    x: (c1Center.x + c2Center.x) / 2,
    y: (c1Center.y + c2Center.y) / 2,
  };
  const overlap13 = {
    x: (c1Center.x + c3Center.x) / 2,
    y: (c1Center.y + c3Center.y) / 2,
  };
  const overlap23 = {
    x: (c2Center.x + c3Center.x) / 2,
    y: (c2Center.y + c3Center.y) / 2,
  };
  const overlapAll = {
    x: (c1Center.x + c2Center.x + c3Center.x) / 3,
    y: (c1Center.y + c2Center.y + c3Center.y) / 3,
  };

  // Count subcats in each region
  const c1Count = Object.keys(vennSections.course1).length;
  const c2Count = Object.keys(vennSections.course2).length;
  const c3Count = Object.keys(vennSections.course3).length;
  const o12Count = Object.keys(vennSections.overlap12).length;
  const o13Count = Object.keys(vennSections.overlap13).length;
  const o23Count = Object.keys(vennSections.overlap23).length;
  const allCount = Object.keys(vennSections.overlapAll).length;

  return (
    <div className="relative w-full h-full">
      {/* Circle 1 */}
      <div
        style={{
          position: "absolute",
          width: radius * 2,
          height: radius * 2,
          top: c1Top,
          left: c1Left,
          backgroundColor: VENN_COLORS.course1,
          borderRadius: "50%",
          opacity: 0.6,
        }}
      />
      {/* Circle 2 */}
      <div
        style={{
          position: "absolute",
          width: radius * 2,
          height: radius * 2,
          top: c2Top,
          left: c2Left,
          backgroundColor: VENN_COLORS.course2,
          borderRadius: "50%",
          opacity: 0.6,
        }}
      />
      {/* Circle 3 */}
      <div
        style={{
          position: "absolute",
          width: radius * 2,
          height: radius * 2,
          top: c3Top,
          left: c3Left,
          backgroundColor: VENN_COLORS.course3,
          borderRadius: "50%",
          opacity: 0.6,
        }}
      />

      {/* Place badges if counts > 0 */}
      {c1Count > 0 && (
        <CountBadge
          count={c1Count}
          style={{
            top: c1Center.y - 12,
            left: c1Center.x - 12,
          }}
        />
      )}
      {c2Count > 0 && (
        <CountBadge
          count={c2Count}
          style={{
            top: c2Center.y - 12,
            left: c2Center.x - 12,
          }}
        />
      )}
      {c3Count > 0 && (
        <CountBadge
          count={c3Count}
          style={{
            top: c3Center.y - 12,
            left: c3Center.x - 12,
          }}
        />
      )}
      {o12Count > 0 && (
        <CountBadge
          count={o12Count}
          style={{
            top: overlap12.y - 12,
            left: overlap12.x - 12,
          }}
        />
      )}
      {o13Count > 0 && (
        <CountBadge
          count={o13Count}
          style={{
            top: overlap13.y - 12,
            left: overlap13.x - 12,
          }}
        />
      )}
      {o23Count > 0 && (
        <CountBadge
          count={o23Count}
          style={{
            top: overlap23.y - 12,
            left: overlap23.x - 12,
          }}
        />
      )}
      {allCount > 0 && (
        <CountBadge
          count={allCount}
          style={{
            top: overlapAll.y - 12,
            left: overlapAll.x - 12,
          }}
        />
      )}
    </div>
  );
};

/**
 * A small white circle badge with the subcategory count.
 * style={{ top:..., left:... }} is used to place it exactly.
 */
const CountBadge: React.FC<{ count: number; style?: React.CSSProperties }> = ({
  count,
  style,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem",
        fontWeight: "bold",
        ...style,
      }}
    >
      {count}
    </div>
  );
};

/**
 * A table listing all 7 "regions" (course1, course2, course3, overlap12, overlap13, overlap23, overlapAll)
 * Each region is color-coded in a header row. We do NOT show "Course" column anymore,
 * but we do show "Number - Name", "Subcategory", "Level of Depth", and "Justification".
 */
const RegionsTable: React.FC<{
  vennSections: ReturnType<typeof buildVennSectionsType>;
  selectedCourses: string[];
}> = ({ vennSections, selectedCourses }) => {
  // If you want the region headings to say "Unique to Course 1," etc., you can keep it.
  // Or change the text as you like.
  const regionConfigs = [
    { key: "course1", label: "Unique to Course 1", color: VENN_COLORS.course1 },
    { key: "course2", label: "Unique to Course 2", color: VENN_COLORS.course2 },
    { key: "course3", label: "Unique to Course 3", color: VENN_COLORS.course3 },
    {
      key: "overlap12",
      label: "Overlap (Course 1 & 2)",
      color: VENN_COLORS.overlap12,
    },
    {
      key: "overlap13",
      label: "Overlap (Course 1 & 3)",
      color: VENN_COLORS.overlap13,
    },
    {
      key: "overlap23",
      label: "Overlap (Course 2 & 3)",
      color: VENN_COLORS.overlap23,
    },
    {
      key: "overlapAll",
      label: "All Three (1 & 2 & 3)",
      color: VENN_COLORS.overlapAll,
    },
  ] as const;

  // Map "course1" -> the actual "Number - Name"
  const courseNameMap = {
    course1: selectedCourses[0] || "",
    course2: selectedCourses[1] || "",
    course3: selectedCourses[2] || "",
  };

  return (
    <div className="mt-8 space-y-6">
      {regionConfigs.map(({ key, label, color }) => {
        const regionData = vennSections[key];
        const subcats = Object.keys(regionData);
        if (subcats.length === 0) {
          return null; // skip empty region
        }
        return (
          <div key={key} className="border rounded-md overflow-hidden">
            {/* Region heading */}
            <div
              className="px-4 py-2 text-white font-semibold"
              style={{ backgroundColor: color }}
            >
              {label} ({subcats.length} subcategory
              {subcats.length > 1 ? "ies" : ""})
            </div>
            {/* Table:  "Number - Name" | "Subcategory" | "Level of Depth" | "Justification" */}
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2">Number - Name</th>
                  <th className="px-4 py-2">Subcategory</th>
                  <th className="px-4 py-2">Level of Depth</th>
                  <th className="px-4 py-2">Justification</th>
                </tr>
              </thead>
              <tbody>
                {subcats.map((sc) => {
                  const coverageObj = regionData[sc];
                  // coverageObj might have coverageObj.course1, coverageObj.course2, coverageObj.course3
                  // We'll create one row for each course that has coverage
                  // coverageObj.course1 is { depth, justification }, etc.
                  const rows: Array<{
                    numName: string;
                    subcat: string;
                    depth: string;
                    justification: string;
                  }> = [];

                  (["course1", "course2", "course3"] as const).forEach(
                    (cKey) => {
                      const info = coverageObj[cKey];
                      if (info) {
                        rows.push({
                          numName: courseNameMap[cKey],
                          subcat: sc,
                          depth: info.depth,
                          justification: info.justification,
                        });
                      }
                    },
                  );

                  return rows.map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2">{row.numName}</td>
                      <td className="px-4 py-2">{row.subcat}</td>
                      <td className="px-4 py-2">{row.depth}</td>
                      <td className="px-4 py-2">{row.justification}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

/**
 * For reference only.
 * "vennSections" is an object with keys: course1, course2, course3, overlap12, overlap13, overlap23, overlapAll.
 * Each key is an object: subcat => { course1?: CoverageInfo, course2?:..., course3?:... }.
 */
function buildVennSectionsType() {
  return {
    course1: {} as Record<
      string, // subcat
      { course1: CoverageInfo }
    >,
    course2: {} as Record<string, { course2: CoverageInfo }>,
    course3: {} as Record<string, { course3: CoverageInfo }>,
    overlap12: {} as Record<
      string,
      { course1: CoverageInfo; course2: CoverageInfo }
    >,
    overlap13: {} as Record<
      string,
      { course1: CoverageInfo; course3: CoverageInfo }
    >,
    overlap23: {} as Record<
      string,
      { course2: CoverageInfo; course3: CoverageInfo }
    >,
    overlapAll: {} as Record<
      string,
      { course1: CoverageInfo; course2: CoverageInfo; course3: CoverageInfo }
    >,
  };
}
