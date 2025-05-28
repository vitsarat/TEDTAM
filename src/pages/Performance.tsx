import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Share2, 
  Download, 
  Filter, 
  ChevronDown,
  Award,
  Users,
  Table as TableIcon,
  Calendar,
  RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import ExcelJS from 'exceljs';

interface PerformanceData {
  "ประเภทงาน": string;
  "รายการ": string;
  "กลุ่มงาน6090รับงาน(จำนวน)": number;
  "กลุ่มงาน6090คงเหลือ(จำนวน)": number;
  "6090ต้องเก็บงานกลุ่ม(Toral CURED)": number;
  "6090ต้องเก็บงานกลุ่ม(DR)": number;
  "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)": number;
  "6090ต้องเก็บงานกลุ่ม(REPO)": number;
  "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)": number;
  "เกรดเดือน(6090)": string;
  "Scoreเดือน(6090)": number;
  "เกรด3เดือน(6090)": string;
  "Score3เดือน(6090)": number;
  "ผลงาน(6090)(%Toral CURED)": number;
  "ผลงาน(6090)(%DR)": number;
  "ผลงาน(6090)(%ตบเด้ง)": number;
  "ผลงาน(6090)(%REPO)": number;
  "กลุ่มงานNPLรับงาน(จำนวน)": number;
  "กลุ่มงานNPLคงเหลือ(จำนวน)": number;
  "NPLต้องเก็บงานกลุ่ม(DR)": number;
  "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)": number;
  "NPLต้องเก็บงานกลุ่ม(REPO)": number;
  "เกรดเดือน(NPL)": string;
  "Scoreเดือน(NPL)": number;
  "เกรด3เดือน(NPL)": string;
  "Score3เดือน(NPL)": number;
  "ผลงาน(NPL)(%Toral CURED)": number;
  "ผลงาน(NPL)(%DR)": number;
  "ผลงาน(NPL)(%ตบเด้ง)": number;
  "ผลงาน(NPL)(%REPO)": number;
}

interface UploadHistory {
  fileName: string;
  uploadDateTime: string;
  itemCount: number;
}

const Performance: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedWorkGroup, setSelectedWorkGroup] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [date, setDate] = useState<Date>(new Date());
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // โหลดข้อมูลและประวัติจาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    const savedData = localStorage.getItem('performanceData');
    const savedHistory = localStorage.getItem('uploadHistory');
    if (savedData) {
      setPerformanceData(JSON.parse(savedData));
    }
    if (savedHistory) {
      setUploadHistory(JSON.parse(savedHistory));
    }
  }, []);

  // ตัวเลือกสำหรับตัวกรองสาขา
  const branchOptions = [
    "ขอนแก่น", "ขอนแก่นรุ่งเรือง", "นครราชสีมา", "นครสวรรค์", "พัทยา",
    "ระยอง", "สระบุรี", "อุดรธานี", "อุดรธานีรุ่งเรือง", "อุบลราชธานี"
  ];

  // ตัวเลือกสำหรับตัวกรองทีมงาน
  const teamOptions = [
    "ทีมเทวิน", "ทีมเปเล่", "ทีมเร", "ทีมเอ", "ทีมแดง", "ทีมโป้ง", "ทีมกุ้ง", "ทีมชัย", "ทีมธาดา", "ทีมนกแก้ว",
    "ทีมนาย", "ทีมนุช", "ทีมนิ่ม", "ทีมบ๋อม", "ทีมบอย", "ทีมบาส", "ทีมประพัน", "ทีมผญบ", "ทีมอ๊อฟ", "ทีมออย",
    "ทีมอาร์ท", "ทีมอิฐ", "ทีมอุ๊"
  ];

  // ฟังก์ชันจัดการการอัปโหลดไฟล์ Excel
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);

    const data: PerformanceData[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // ข้ามหัวตาราง
        const rowData: any = {
          "ประเภทงาน": row.getCell(1).value?.toString() || "",
          "รายการ": row.getCell(2).value?.toString() || "",
          "กลุ่มงาน6090รับงาน(จำนวน)": Number(row.getCell(3).value) || 0,
          "กลุ่มงาน6090คงเหลือ(จำนวน)": Number(row.getCell(4).value) || 0,
          "6090ต้องเก็บงานกลุ่ม(Toral CURED)": Number(row.getCell(5).value) || 0,
          "6090ต้องเก็บงานกลุ่ม(DR)": Number(row.getCell(6).value) || 0,
          "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)": Number(row.getCell(7).value) || 0,
          "6090ต้องเก็บงานกลุ่ม(REPO)": Number(row.getCell(8).value) || 0,
          "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)": Number(row.getCell(9).value) || 0,
          "เกรดเดือน(6090)": row.getCell(10).value?.toString() || "N/A",
          "Scoreเดือน(6090)": Number(row.getCell(11).value) || 0,
          "เกรด3เดือน(6090)": row.getCell(12).value?.toString() || "N/A",
          "Score3เดือน(6090)": Number(row.getCell(13).value) || 0,
          "ผลงาน(6090)(%Toral CURED)": Number(row.getCell(14).value) || 0,
          "ผลงาน(6090)(%DR)": Number(row.getCell(15).value) || 0,
          "ผลงาน(6090)(%ตบเด้ง)": Number(row.getCell(16).value) || 0,
          "ผลงาน(6090)(%REPO)": Number(row.getCell(17).value) || 0,
          "กลุ่มงานNPLรับงาน(จำนวน)": Number(row.getCell(18).value) || 0,
          "กลุ่มงานNPLคงเหลือ(จำนวน)": Number(row.getCell(19).value) || 0,
          "NPLต้องเก็บงานกลุ่ม(DR)": Number(row.getCell(20).value) || 0,
          "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)": Number(row.getCell(21).value) || 0,
          "NPLต้องเก็บงานกลุ่ม(REPO)": Number(row.getCell(22).value) || 0,
          "เกรดเดือน(NPL)": row.getCell(23).value?.toString() || "N/A",
          "Scoreเดือน(NPL)": Number(row.getCell(24).value) || 0,
          "เกรด3เดือน(NPL)": row.getCell(25).value?.toString() || "N/A",
          "Score3เดือน(NPL)": Number(row.getCell(26).value) || 0,
          "ผลงาน(NPL)(%Toral CURED)": Number(row.getCell(27).value) || 0,
          "ผลงาน(NPL)(%DR)": Number(row.getCell(28).value) || 0,
          "ผลงาน(NPL)(%ตบเด้ง)": Number(row.getCell(29).value) || 0,
          "ผลงาน(NPL)(%REPO)": Number(row.getCell(30).value) || 0,
        };
        data.push(rowData);
      }
    });

    // อัปเดตข้อมูล (แทนที่ข้อมูลเก่าด้วยข้อมูลล่าสุด)
    setPerformanceData(data);

    // บันทึกข้อมูลลง localStorage
    localStorage.setItem('performanceData', JSON.stringify(data));

    // บันทึกประวัติการอัปโหลด
    const uploadDateTime = format(new Date(), "dd MMM yyyy HH:mm", { locale: th });
    const newHistoryEntry = { fileName: file.name, uploadDateTime, itemCount: data.length };
    const updatedHistory = [...uploadHistory, newHistoryEntry];
    setUploadHistory(updatedHistory);
    localStorage.setItem('uploadHistory', JSON.stringify(updatedHistory));

    toast({ title: "อัปโหลดไฟล์สำเร็จ" });
  };

  // ฟังก์ชันดาวน์โหลดไฟล์ Excel
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Performance Data');

    // กำหนดหัวตาราง
    worksheet.columns = [
      { header: "ประเภทงาน", key: "ประเภทงาน", width: 15 },
      { header: "รายการ", key: "รายการ", width: 20 },
      { header: "กลุ่มงาน6090รับงาน(จำนวน)", key: "กลุ่มงาน6090รับงาน(จำนวน)", width: 20 },
      { header: "กลุ่มงาน6090คงเหลือ(จำนวน)", key: "กลุ่มงาน6090คงเหลือ(จำนวน)", width: 20 },
      { header: "6090ต้องเก็บงานกลุ่ม(Toral CURED)", key: "6090ต้องเก็บงานกลุ่ม(Toral CURED)", width: 25 },
      { header: "6090ต้องเก็บงานกลุ่ม(DR)", key: "6090ต้องเก็บงานกลุ่ม(DR)", width: 20 },
      { header: "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)", key: "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)", width: 20 },
      { header: "6090ต้องเก็บงานกลุ่ม(REPO)", key: "6090ต้องเก็บงานกลุ่ม(REPO)", width: 20 },
      { header: "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)", key: "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)", width: 20 },
      { header: "เกรดเดือน(6090)", key: "เกรดเดือน(6090)", width: 15 },
      { header: "Scoreเดือน(6090)", key: "Scoreเดือน(6090)", width: 15 },
      { header: "เกรด3เดือน(6090)", key: "เกรด3เดือน(6090)", width: 15 },
      { header: "Score3เดือน(6090)", key: "Score3เดือน(6090)", width: 15 },
      { header: "ผลงาน(6090)(%Toral CURED)", key: "ผลงาน(6090)(%Toral CURED)", width: 20 },
      { header: "ผลงาน(6090)(%DR)", key: "ผลงาน(6090)(%DR)", width: 15 },
      { header: "ผลงาน(6090)(%ตบเด้ง)", key: "ผลงาน(6090)(%ตบเด้ง)", width: 15 },
      { header: "ผลงาน(6090)(%REPO)", key: "ผลงาน(6090)(%REPO)", width: 15 },
      { header: "กลุ่มงานNPLรับงาน(จำนวน)", key: "กลุ่มงานNPLรับงาน(จำนวน)", width: 20 },
      { header: "กลุ่มงานNPLคงเหลือ(จำนวน)", key: "กลุ่มงานNPLคงเหลือ(จำนวน)", width: 20 },
      { header: "NPLต้องเก็บงานกลุ่ม(DR)", key: "NPLต้องเก็บงานกลุ่ม(DR)", width: 20 },
      { header: "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)", key: "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)", width: 20 },
      { header: "NPLต้องเก็บงานกลุ่ม(REPO)", key: "NPLต้องเก็บงานกลุ่ม(REPO)", width: 20 },
      { header: "เกรดเดือน(NPL)", key: "เกรดเดือน(NPL)", width: 15 },
      { header: "Scoreเดือน(NPL)", key: "Scoreเดือน(NPL)", width: 15 },
      { header: "เกรด3เดือน(NPL)", key: "เกรด3เดือน(NPL)", width: 15 },
      { header: "Score3เดือน(NPL)", key: "Score3เดือน(NPL)", width: 15 },
      { header: "ผลงาน(NPL)(%Toral CURED)", key: "ผลงาน(NPL)(%Toral CURED)", width: 20 },
      { header: "ผลงาน(NPL)(%DR)", key: "ผลงาน(NPL)(%DR)", width: 15 },
      { header: "ผลงาน(NPL)(%ตบเด้ง)", key: "ผลงาน(NPL)(%ตบเด้ง)", width: 15 },
      { header: "ผลงาน(NPL)(%REPO)", key: "ผลงาน(NPL)(%REPO)", width: 15 },
    ];

    // เพิ่มข้อมูลจาก performanceData
    performanceData.forEach(item => worksheet.addRow(item));

    // ดาวน์โหลดไฟล์ Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'performance_data.xlsx';
    link.click();
    URL.revokeObjectURL(link.href);
    toast({ title: "ดาวน์โหลดไฟล์สำเร็จ" });
  };

  // ตัวกรองข้อมูล
  const filteredPerformanceData = performanceData.filter(item => {
    if (selectedBranch !== "all" && item["ประเภทงาน"] === "สาขา" && item["รายการ"] !== selectedBranch) {
      return false;
    }
    if (selectedTeam !== "all" && item["ประเภทงาน"] === "ทีมงาน" && item["รายการ"] !== selectedTeam) {
      return false;
    }
    if (selectedWorkGroup !== "all") {
      if (selectedWorkGroup === "6090" && !item["กลุ่มงาน6090รับงาน(จำนวน)"]) return false;
      if (selectedWorkGroup === "NPL" && !item["กลุ่มงานNPLรับงาน(จำนวน)"]) return false;
    }
    return true;
  });

  // คำนวณข้อมูลสำหรับ Summary Cards
  const summaryStats = filteredPerformanceData.reduce((acc, item) => {
    if (item["ประเภทงาน"] === "สาขา" && (selectedBranch === "all" || item["รายการ"] === selectedBranch)) {
      acc.gradeMonth = item["เกรดเดือน(6090)"];
      acc.scoreMonth = item["Scoreเดือน(6090)"];
      acc.grade3Months = item["เกรด3เดือน(6090)"];
      acc.score3Months = item["Score3เดือน(6090)"];
    }
    return acc;
  }, {
    gradeMonth: "N/A",
    scoreMonth: 0,
    grade3Months: "N/A",
    score3Months: 0,
  });

  // คำนวณข้อมูลสำหรับความคืบหน้า
  const progressStats = filteredPerformanceData.reduce((acc, item) => {
    if (item["ประเภทงาน"] === "สาขา" && (selectedBranch === "all" || item["รายการ"] === selectedBranch)) {
      acc.curedPercent = item["ผลงาน(6090)(%Toral CURED)"] * 100;
      acc.drPercent = item["ผลงาน(6090)(%DR)"] * 100;
      acc.tapDengPercent = item["ผลงาน(6090)(%ตบเด้ง)"] * 100;
      acc.repoPercent = item["ผลงาน(6090)(%REPO)"] * 100;
    }
    return acc;
  }, {
    curedPercent: 0,
    drPercent: 0,
    tapDengPercent: 0,
    repoPercent: 0,
  });

  // คำนวณเป้าหมายที่ยังขาด
  const targetStats = filteredPerformanceData.reduce((acc, item) => {
    if (item["ประเภทงาน"] === "สาขา" && (selectedBranch === "all" || item["รายการ"] === selectedBranch)) {
      acc.diffCured += item["6090ต้องเก็บงานกลุ่ม(Toral CURED)"];
      acc.diffDR += item["6090ต้องเก็บงานกลุ่ม(DR)"];
      acc.diffTapDeng += item["6090ต้องเก็บงานกลุ่ม(ตบเด้ง)"];
      acc.diffRepo += item["6090ต้องเก็บงานกลุ่ม(REPO)"];
    }
    return acc;
  }, {
    diffCured: 0,
    diffDR: 0,
    diffTapDeng: 0,
    diffRepo: 0,
  });

  // ฟังก์ชันสำหรับการจัดรูปแบบตัวเลข
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} ล้าน`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString('th-TH');
  };

  // ฟังก์ชันสำหรับการแชร์
  const handleShare = () => {
    toast({ title: "แชร์รายงานผลงานสำเร็จ" });
  };

  // ฟังก์ชันล้างตัวกรอง
  const handleResetFilters = () => {
    setSelectedBranch("all");
    setSelectedTeam("all");
    setSelectedWorkGroup("all");
    toast({ title: "รีเซ็ตตัวกรองสำเร็จ" });
  };

  return (
    <div className="p-4 pb-20">
      {/* Header with Date Picker */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-tedtam-blue">ผลงาน</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="link" className="p-0 h-auto text-gray-600 text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                {format(date, "dd MMMM yyyy", { locale: th })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={selectedTeam !== "all"}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <span className="truncate">
              {selectedBranch === "all" ? "สาขา: ทั้งหมด" : `สาขา: ${selectedBranch}`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">สาขา: ทั้งหมด</SelectItem>
            {branchOptions.map(branch => (
              <SelectItem key={branch} value={branch}>สาขา: {branch}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={selectedBranch !== "all"}>
          <SelectTrigger className="w-[140px]">
            <span className="truncate">
              {selectedTeam === "all" ? "ทีมงาน: ทั้งหมด" : `ทีมงาน: ${selectedTeam}`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทีมงาน: ทั้งหมด</SelectItem>
            {teamOptions.map(team => (
              <SelectItem key={team} value={team}>ทีมงาน: {team}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedWorkGroup} onValueChange={setSelectedWorkGroup}>
          <SelectTrigger className="w-[140px]">
            <span className="truncate">
              {selectedWorkGroup === "all" ? "ทั้งหมด" : selectedWorkGroup}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="6090">6090</SelectItem>
            <SelectItem value="NPL">NPL</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="px-4 py-2 text-gray-600 rounded-md"
          onClick={handleResetFilters}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          ล้างตัวกรอง
        </Button>
      </div>

      {/* Upload/Download Excel Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#162A6B] transition"
        >
          Upload Excel
        </Button>
        <Button
          onClick={handleDownload}
          className="px-4 py-2 bg-[#F97316] text-white rounded-md hover:bg-[#E55B13] transition"
        >
          Download Excel
        </Button>
        <input
          type="file"
          accept=".xlsx"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="summary" className="flex-1">
            <BarChart className="h-4 w-4 mr-1" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="byTeam" className="flex-1">
            <Users className="h-4 w-4 mr-1" />
            แยกตามทีม
          </TabsTrigger>
          <TabsTrigger value="detail" className="flex-1">
            <TableIcon className="h-4 w-4 mr-1" />
            ตารางข้อมูล
          </TabsTrigger>
        </TabsList>

        {/* แท็บ "ภาพรวม" */}
        <TabsContent value="summary">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="border-l-4 border-l-tedtam-blue card-shadow">
              <CardContent className="p-3">
                <p className="text-sm text-gray-500">เกรด/เดือน (A,B,C,D,E)</p>
                <p className="text-xl font-bold">{summaryStats.gradeMonth}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500 card-shadow">
              <CardContent className="p-3">
                <p className="text-sm text-gray-500">Score/เดือน</p>
                <p className="text-xl font-bold">{summaryStats.scoreMonth.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-tedtam-orange card-shadow">
              <CardContent className="p-3">
                <p className="text-sm text-gray-500">เกรด/3เดือน (A,B,C,D,E)</p>
                <p className="text-xl font-bold">{summaryStats.grade3Months}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500 card-shadow">
              <CardContent className="p-3">
                <p className="text-sm text-gray-500">Score/3เดือน</p>
                <p className="text-xl font-bold">{summaryStats.score3Months.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* ความคืบหน้า */}
          <Card className="card-shadow mb-3">
            <CardContent className="p-3">
              <h3 className="font-medium mb-2 text-sm">ความคืบหน้า</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CURED</span>
                    <span>{progressStats.curedPercent.toFixed(2)}%</span>
                  </div>
                  <Progress value={progressStats.curedPercent} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>DR</span>
                    <span>{progressStats.drPercent.toFixed(2)}%</span>
                  </div>
                  <Progress value={progressStats.drPercent} className="h-2 bg-secondary [&>div]:bg-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>REPO</span>
                    <span>{progressStats.repoPercent.toFixed(2)}%</span>
                  </div>
                  <Progress value={progressStats.repoPercent} className="h-2 bg-secondary [&>div]:bg-red-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ตบเด้ง</span>
                    <span>{progressStats.tapDengPercent.toFixed(2)}%</span>
                  </div>
                  <Progress value={progressStats.tapDengPercent} className="h-2 bg-secondary [&>div]:bg-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* เป้าหมายที่ยังขาด */}
          <Card className="card-shadow">
            <CardContent className="p-3">
              <h3 className="font-medium text-sm mb-2">เป้าหมายที่ยังขาด</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-md p-2">
                  <p className="text-xs text-gray-500">dif(Total CURED)</p>
                  <p className="text-lg font-bold">{formatNumber(targetStats.diffCured)}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-2">
                  <p className="text-xs text-gray-500">dif(DR)</p>
                  <p className="text-lg font-bold">{formatNumber(targetStats.diffDR)}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-2">
                  <p className="text-xs text-gray-500">dif(ตบเด้ง)</p>
                  <p className="text-lg font-bold">{formatNumber(targetStats.diffTapDeng)}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-2">
                  <p className="text-xs text-gray-500">dif(REPO)</p>
                  <p className="text-lg font-bold">{formatNumber(targetStats.diffRepo)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* แท็บ "แยกตามทีม" */}
        <TabsContent value="byTeam">
          <div className="space-y-4">
            {filteredPerformanceData
              .filter(item => item["ประเภทงาน"] === "ทีมงาน")
              .map((item, index) => {
                const completed6090 = item["กลุ่มงาน6090รับงาน(จำนวน)"] - item["กลุ่มงาน6090คงเหลือ(จำนวน)"];
                const total6090 = item["กลุ่มงาน6090รับงาน(จำนวน)"];
                const percent6090 = total6090 > 0 ? Math.round((completed6090 / total6090) * 100) : 0;

                return (
                  <Card key={index} className="card-shadow">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Badge className={`${index % 2 === 0 ? 'bg-tedtam-blue' : 'bg-tedtam-orange'} mr-2`}>
                            {item["รายการ"].charAt(0)}
                          </Badge>
                          <h3 className="font-medium text-sm">ทีม {item["รายการ"]}</h3>
                        </div>
                      </div>
                      {selectedWorkGroup !== "NPL" && (
                        <>
                          <div className="space-y-2 mb-3">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>ความคืบหน้า (6090) ({completed6090}/{total6090})</span>
                                <span>{percent6090}%</span>
                              </div>
                              <Progress value={percent6090} className="h-2" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-500">CURED (6090)</p>
                              <p className="font-medium">{(item["ผลงาน(6090)(%Toral CURED)"] * 100).toFixed(2)}%</p>
                              <Progress value={item["ผลงาน(6090)(%Toral CURED)"] * 100} className="h-1 mt-1" />
                            </div>
                            <div className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-500">DR (6090)</p>
                              <p className="font-medium">{(item["ผลงาน(6090)(%DR)"] * 100).toFixed(2)}%</p>
                              <Progress value={item["ผลงาน(6090)(%DR)"] * 100} className="h-1 mt-1 [&>div]:bg-blue-500" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-500">REPO (6090)</p>
                              <p className="font-medium">{(item["ผลงาน(6090)(%REPO)"] * 100).toFixed(2)}%</p>
                              <Progress value={item["ผลงาน(6090)(%REPO)"] * 100} className="h-1 mt-1 [&>div]:bg-red-500" />
                            </div>
                            <div className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-500">ตบเด้ง (6090)</p>
                              <p className="font-medium">{(item["ผลงาน(6090)(%ตบเด้ง)"] * 100).toFixed(2)}%</p>
                              <Progress value={item["ผลงาน(6090)(%ตบเด้ง)"] * 100} className="h-1 mt-1 [&>div]:bg-purple-500" />
                            </div>
                          </div>
                        </>
                      )}
                      {selectedWorkGroup !== "6090" && (
                        <>
                          <div className="space-y-2 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">ข้อมูล NPL</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-500">CURED (NPL)</p>
                              <p className="font-medium">{(item["ผลงาน(NPL)(%Toral CURED)"] * 100).toFixed(2)}%</p>
                              <Progress value={item["ผลงาน(NPL)(%Toral CURED)"] * 100} className="h-1 mt-1" />
                            </div>
                            <div className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-500">DR (NPL)</p>
                              <p className="font-medium">{(item["ผลงาน(NPL)(%DR)"] * 100).toFixed(2)}%</p>
                              <Progress value={item["ผลงาน(NPL)(%DR)"] * 100} className="h-1 mt-1 [&>div]:bg-blue-500" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-500">REPO (NPL)</p>
                              <p className="font-medium">{(item["ผลงาน(NPL)(%REPO)"] * 100).toFixed(2)}%</p>
                              <Progress value={item["ผลงาน(NPL)(%REPO)"] * 100} className="h-1 mt-1 [&>div]:bg-red-500" />
                            </div>
                            <div className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-500">ตบเด้ง (NPL)</p>
                              <p className="font-medium">{(item["ผลงาน(NPL)(%ตบเด้ง)"] * 100).toFixed(2)}%</p>
                              <Progress value={item["ผลงาน(NPL)(%ตบเด้ง)"] * 100} className="h-1 mt-1 [&>div]:bg-purple-500" />
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        {/* แท็บ "ตารางข้อมูล" */}
        <TabsContent value="detail">
          <Card className="card-shadow">
            <CardContent className="p-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ทีม</TableHead>
                      <TableHead>สาขา</TableHead>
                      <TableHead className="text-right">รับงาน (6090)</TableHead>
                      <TableHead className="text-right">คงเหลือ (6090)</TableHead>
                      <TableHead className="text-right">จบแล้ว (6090)</TableHead>
                      <TableHead className="text-right">% (6090)</TableHead>
                      <TableHead className="text-right">%CURED (6090)</TableHead>
                      <TableHead className="text-right">%DR (6090)</TableHead>
                      <TableHead className="text-right">%ตบเด้ง (6090)</TableHead>
                      <TableHead className="text-right">%REPO (6090)</TableHead>
                      <TableHead className="text-right">เกรดเดือน(NPL)</TableHead>
                      <TableHead className="text-right">Scoreเดือน(NPL)</TableHead>
                      <TableHead className="text-right">เกรด3เดือน(NPL)</TableHead>
                      <TableHead className="text-right">Score3เดือน(NPL)</TableHead>
                      <TableHead className="text-right">%CURED (NPL)</TableHead>
                      <TableHead className="text-right">%DR (NPL)</TableHead>
                      <TableHead className="text-right">%ตบเด้ง (NPL)</TableHead>
                      <TableHead className="text-right">%REPO (NPL)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPerformanceData.map((item, index) => {
                      const assigned = item["กลุ่มงาน6090รับงาน(จำนวน)"];
                      const remaining = item["กลุ่มงาน6090คงเหลือ(จำนวน)"];
                      const completed = assigned - remaining;
                      const percentage = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item["ประเภทงาน"] === "ทีมงาน" ? item["รายการ"] : "-"}</TableCell>
                          <TableCell>{item["ประเภทงาน"] === "สาขา" ? item["รายการ"] : "-"}</TableCell>
                          <TableCell className="text-right">{assigned}</TableCell>
                          <TableCell className="text-right">{remaining}</TableCell>
                          <TableCell className="text-right">{completed}</TableCell>
                          <TableCell className="text-right text-green-500 font-medium">{percentage}%</TableCell>
                          <TableCell className="text-right">{(item["ผลงาน(6090)(%Toral CURED)"] * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-right">{(item["ผลงาน(6090)(%DR)"] * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-right">{(item["ผลงาน(6090)(%ตบเด้ง)"] * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-right">{(item["ผลงาน(6090)(%REPO)"] * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-right">{item["เกรดเดือน(NPL)"]}</TableCell>
                          <TableCell className="text-right">{item["Scoreเดือน(NPL)"].toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item["เกรด3เดือน(NPL)"]}</TableCell>
                          <TableCell className="text-right">{item["Score3เดือน(NPL)"].toFixed(2)}</TableCell>
                          <TableCell className="text-right">{(item["ผลงาน(NPL)(%Toral CURED)"] * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-right">{(item["ผลงาน(NPL)(%DR)"] * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-right">{(item["ผลงาน(NPL)(%ตบเด้ง)"] * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-right">{(item["ผลงาน(NPL)(%REPO)"] * 100).toFixed(2)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ตารางประวัติการอัปโหลด */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-tedtam-blue mb-3">ประวัติการอัปโหลด</h2>
        <Card className="card-shadow">
          <CardContent className="p-3">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อไฟล์</TableHead>
                    <TableHead>วันที่/เวลา</TableHead>
                    <TableHead>จำนวนรายการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadHistory.length > 0 ? (
                    uploadHistory.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.fileName}</TableCell>
                        <TableCell>{item.uploadDateTime}</TableCell>
                        <TableCell>{item.itemCount} รายการ</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        ยังไม่มีประวัติการอัปโหลด
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;