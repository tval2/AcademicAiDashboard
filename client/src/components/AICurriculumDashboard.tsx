import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseCSV } from "@/utils/csvParser";
import HeatmapView from "@/components/HeatmapView";
import CourseView from "@/components/CourseView";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export type CSVRow = {
  [key: string]: string;
};

const AICurriculumDashboard: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [activeTab, setActiveTab] = useState("heatmap");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const data = parseCSV(text);
        setCsvData(data);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          MIT Sloan AI Curriculum Dashboard
        </h1>
        <label className="cursor-pointer">
          <Button variant="outline" className="gap-2">
            <Upload size={16} />
            <span>Upload CSV</span>
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="heatmap">Heatmap View</TabsTrigger>
          <TabsTrigger value="course">Course View</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                AI Curriculum Coverage Heatmap
              </CardTitle>
              <p className="text-sm text-slate-500">
                Overview of course distribution across all areas, categories, and subcategories
              </p>
            </CardHeader>
            <CardContent>
              {csvData.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500">Please upload a CSV file to view the heatmap</p>
                </div>
              ) : (
                <HeatmapView csvData={csvData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="course">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Individual Course Coverage
              </CardTitle>
              <p className="text-sm text-slate-500">
                Analyze coverage areas for a specific course
              </p>
            </CardHeader>
            <CardContent>
              {csvData.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500">Please upload a CSV file to view course data</p>
                </div>
              ) : (
                <CourseView csvData={csvData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AICurriculumDashboard;
