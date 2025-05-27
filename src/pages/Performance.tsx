import React, { useState, useMemo, useRef, useEffect } from "react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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
  TrendingUp,
  Users,
  Table as TableIcon,
  Activity,
  Calendar
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
import { performanceData as initialPerformanceData, updatePerformanceData } from "@/data/performanceData";

// รายการสาขาและทีมงาน
const branches = [
  "ขอนแก่น",
  "ขอนแก่นรุ่งเรือง",
  "นครราชสีมา",
  "นครสวรรค์",
  "พัทยา",
  "ระยอง",
  "สระบุรี",
  "อุดรธานี",
  "อุดรธานีรุ่งเรือง",
  "อุบลราชธานี",
];

const teams = [
  "เทวิน",
  "เปเล่",
  "เร",
  "เอ",
  "แดง",
  "โป้ง",
  "กุ้ง",
  "ชัย",
  "ธาดา",
  "นกแก้ว",
  "นาย",
  "นุช",
  "นิ่ม",
  "บ๋อม",
  "บอย",
  "บาส",
  "ประพัน",
  "ผญบ",
  "อ๊อฟ",
  "ออย",
  "อาร์ท",
  "อิฐ",
  "อุ๊",
];

// รายการกลุ่มงานสำหรับตัวกรอง
const groups = [
  { value: "all", label: "ทั้งหมด" },
  { value: "6090", label: "กลุ่มงาน 6090" },
  { value: "NPL", label: "กลุ่มงาน NPL" },
];

const Performance: React.FC = () => {
  const [performanceData, setPerformanceData] = useState(initialPerformanceData);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("today");
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [detailView, setDetailView] = useState<"all" | "6090" | "npl">("all");
  const [date, setDate] = useState<Date>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ฟังก์ชันอิมพอร์ตไฟล์ Excel
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);

      const newData: any[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // ข้ามหัวตาราง (แถวแรก)
          const rawGroup = row.getCell(2).value;
          const normalizedGroup = String(rawGroup).trim().replace(/\s+/g, '');
          const groupValue = normalizedGroup === "6090" || normalizedGroup === "กลุ่มงาน6090" ? "กลุ่มงาน6090" : "กลุ่มงานNPL";

          console.log("Raw group value from Excel:", rawGroup, "Normalized group:", normalizedGroup, "Transformed groupValue:", groupValue);

          const rowData: any = {
            กลุ่มงาน: groupValue,
            ทีมลพท: row.getCell(3).value,
            "กลุ่มงาน6090รับงาน(จำนวน)": row.getCell(4).value || 0,
            "ยอด(princ)": row.getCell(5).value ? `${(row.getCell(5).value / 1000000).toFixed(2)} ล้าน` : "0 ล้าน",
            "กลุ่มงาน6090คงเหลือ(จำนวน)": row.getCell(6).value || 0,
            "6090ต้องเก็บงานกลุ่ม(Toral CURED)": row.getCell(7).value || 0,
            "6090ต้องเก็บงานกลุ่ม(DR)": row.getCell(8).value || 0,
            "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)": row.getCell(9).value || 0,
            "6090ต้องเก็บงานกลุ่ม(REPO)": row.getCell(10).value || 0,
            "กลุ่มงานNPLรับงาน(จำนวน)": row.getCell(11).value || 0,
            "กลุ่มงานNPLยอด(princ)": row.getCell(12).value ? `${(row.getCell(12).value / 1000000).toFixed(2)} ล้าน` : "0 ล้าน",
            "กลุ่มงานNPLคงเหลือ(จำนวน)": row.getCell(13).value || 0,
            "NPLต้องเก็บงานกลุ่ม(DR)": row.getCell(14).value || 0,
            "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)": row.getCell(15).value || 0,
            "NPLต้องเก็บงานกลุ่ม(REPO)": row.getCell(16).value || 0,
            "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)": row.getCell(17).value || 0,
            "เกรดเดือน(6090)": row.getCell(18).value || "N/A",
            "Scoreเดือน(6090)": row.getCell(19).value || 0,
            "เกรด3เดือน(6090)": row.getCell(20).value || "N/A",
            "Score3เดือน(6090)": row.getCell(21).value || 0,
            "ผลงาน(6090)(%Toral CURED)": row.getCell(22).value || 0,
            "ผลงาน(6090)(%DR)": row.getCell(23).value || 0,
            "ผลงาน(6090)(%ตบเด้ง)": row.getCell(24).value || 0,
            "ผลงาน(6090)(%REPO)": row.getCell(25).value || 0,
            "เกรดเดือน(NPL)": row.getCell(26).value || "N/A",
            "Scoreเดือน(NPL)": row.getCell(27).value || 0,
            "เกรด3เดือน(NPL)": row.getCell(28).value || "N/A",
            "Score3เดือน(NPL)": row.getCell(29).value || 0,
            "ผลงาน(NPL)(%Toral CURED)": row.getCell(30).value || 0,
            "ผลงาน(NPL)(%DR)": row.getCell(31).value || 0,
            "ผลงาน(NPL)(%ตบเด้ง)": row.getCell(32).value || 0,
            "ผลงาน(NPL)(%REPO)": row.getCell(33).value || 0,
          };
          newData.push(rowData);
        }
      });

      console.log("ข้อมูลที่อ่านจากไฟล์ Excel:", newData);

      // อัปเดตข้อมูลใน performanceData และ state
      setPerformanceData(newData);
      updatePerformanceData(newData);

      // รีเซ็ตตัวกรองเพื่อให้แสดงผลข้อมูลทั้งหมด
      setSelectedBranch("all");
      setSelectedTeam("all");
      setSelectedGroup("all");
      setSelectedPeriod("today");

      toast({
        title: "อิมพอร์ตไฟล์ Excel สำเร็จ",
      });

      // Log performanceData หลังการอัพเดต (ใช้ newData)
      console.log("performanceData หลังการอัพเดต:", newData);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอิมพอร์ตไฟล์ Excel:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอิมพอร์ตไฟล์ Excel ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  // ฟังก์ชันดาวน์โหลด Excel
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Performance Data');

    // กำหนดหัวตาราง
    worksheet.columns = [
      { header: 'ประเภท', key: 'ประเภท' },
      { header: 'กลุ่มงาน', key: 'กลุ่มงาน' },
      { header: 'ทีมลพท', key: 'ทีมลพท' },
      { header: 'กลุ่มงาน6090รับงาน(จำนวน)', key: 'กลุ่มงาน6090รับงาน(จำนวน)' },
      { header: 'ยอด(princ)', key: 'ยอด(princ)' },
      { header: 'กลุ่มงาน6090คงเหลือ(จำนวน)', key: 'กลุ่มงาน6090คงเหลือ(จำนวน)' },
      { header: '6090ต้องเก็บงานกลุ่ม(Toral CURED)', key: '6090ต้องเก็บงานกลุ่ม(Toral CURED)' },
      { header: '6090ต้องเก็บงานกลุ่ม(DR)', key: '6090ต้องเก็บงานกลุ่ม(DR)' },
      { header: '6090ต้องเก็บงานกลุ่ม(ตบเด้ง)', key: '6090ต้องเก็บงานกลุ่ม(ตบเด้ง)' },
      { header: '6090ต้องเก็บงานกลุ่ม(REPO)', key: '6090ต้องเก็บงานกลุ่ม(REPO)' },
      { header: 'กลุ่มงานNPLรับงาน(จำนวน)', key: 'กลุ่มงานNPLรับงาน(จำนวน)' },
      { header: 'กลุ่มงานNPLยอด(princ)', key: 'กลุ่มงานNPLยอด(princ)' },
      { header: 'กลุ่มงานNPLคงเหลือ(จำนวน)', key: 'กลุ่มงานNPLคงเหลือ(จำนวน)' },
      { header: 'NPLต้องเก็บงานกลุ่ม(DR)', key: 'NPLต้องเก็บงานกลุ่ม(DR)' },
      { header: 'NPLต้องเก็บงานกลุ่ม(ตบเด้ง)', key: 'NPLต้องเก็บงานกลุ่ม(ตบเด้ง)' },
      { header: 'NPLต้องเก็บงานกลุ่ม(REPO)', key: 'NPLต้องเก็บงานกลุ่ม(REPO)' },
      { header: '6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)', key: '6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)' },
      { header: 'เกรดเดือน(6090)', key: 'เกรดเดือน(6090)' },
      { header: 'Scoreเดือน(6090)', key: 'Scoreเดือน(6090)' },
      { header: 'เกรด3เดือน(6090)', key: 'เกรด3เดือน(6090)' },
      { header: 'Score3เดือน(6090)', key: 'Score3เดือน(6090)' },
      { header: 'ผลงาน(6090)(%Toral CURED)', key: 'ผลงาน(6090)(%Toral CURED)' },
      { header: 'ผลงาน(6090)(%DR)', key: 'ผลงาน(6090)(%DR)' },
      { header: 'ผลงาน(6090)(%ตบเด้ง)', key: 'ผลงาน(6090)(%ตบเด้ง)' },
      { header: 'ผลงาน(6090)(%REPO)', key: 'ผลงาน(6090)(%REPO)' },
      { header: 'เกรดเดือน(NPL)', key: 'เกรดเดือน(NPL)' },
      { header: 'Scoreเดือน(NPL)', key: 'Scoreเดือน(NPL)' },
      { header: 'เกรด3เดือน(NPL)', key: 'เกรด3เดือน(NPL)' },
      { header: 'Score3เดือน(NPL)', key: 'Score3เดือน(NPL)' },
      { header: 'ผลงาน(NPL)(%Toral CURED)', key: 'ผลงาน(NPL)(%Toral CURED)' },
      { header: 'ผลงาน(NPL)(%DR)', key: 'ผลงาน(NPL)(%DR)' },
      { header: 'ผลงาน(NPL)(%ตบเด้ง)', key: 'ผลงาน(NPL)(%ตบเด้ง)' },
      { header: 'ผลงาน(NPL)(%REPO)', key: 'ผลงาน(NPL)(%REPO)' },
    ];

    // เพิ่มข้อมูลลงใน worksheet
    performanceData.forEach(item => {
      worksheet.addRow({
        ประเภท: "สาขา",
        กลุ่มงาน: item.กลุ่มงาน,
        ทีมลพท: item.ทีมลพท,
        "กลุ่มงาน6090รับงาน(จำนวน)": item["กลุ่มงาน6090รับงาน(จำนวน)"],
        "ยอด(princ)": item["ยอด(princ)"],
        "กลุ่มงาน6090คงเหลือ(จำนวน)": item["กลุ่มงาน6090คงเหลือ(จำนวน)"],
        "6090ต้องเก็บงานกลุ่ม(Toral CURED)": item["6090ต้องเก็บงานกลุ่ม(Toral CURED)"],
        "6090ต้องเก็บงานกลุ่ม(DR)": item["6090ต้องเก็บงานกลุ่ม(DR)"],
        "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)": item["6090ต้องเก็บงานกลุ่ม(ตบเด้ง)"],
        "6090ต้องเก็บงานกลุ่ม(REPO)": item["6090ต้องเก็บงานกลุ่ม(REPO)"],
        "กลุ่มงานNPLรับงาน(จำนวน)": item["กลุ่มงานNPLรับงาน(จำนวน)"],
        "กลุ่มงานNPLยอด(princ)": item["กลุ่มงานNPLยอด(princ)"],
        "กลุ่มงานNPLคงเหลือ(จำนวน)": item["กลุ่มงานNPLคงเหลือ(จำนวน)"],
        "NPLต้องเก็บงานกลุ่ม(DR)": item["NPLต้องเก็บงานกลุ่ม(DR)"],
        "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)": item["NPLต้องเก็บงานกลุ่ม(ตบเด้ง)"],
        "NPLต้องเก็บงานกลุ่ม(REPO)": item["NPLต้องเก็บงานกลุ่ม(REPO)"],
        "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)": item["6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)"],
        "เกรดเดือน(6090)": item["เกรดเดือน(6090)"],
        "Scoreเดือน(6090)": item["Scoreเดือน(6090)"],
        "เกรด3เดือน(6090)": item["เกรด3เดือน(6090)"],
        "Score3เดือน(6090)": item["Score3เดือน(6090)"],
        "ผลงาน(6090)(%Toral CURED)": item["ผลงาน(6090)(%Toral CURED)"],
        "ผลงาน(6090)(%DR)": item["ผลงาน(6090)(%DR)"],
        "ผลงาน(6090)(%ตบเด้ง)": item["ผลงาน(6090)(%ตบเด้ง)"],
        "ผลงาน(6090)(%REPO)": item["ผลงาน(6090)(%REPO)"],
        "เกรดเดือน(NPL)": item["เกรดเดือน(NPL)"],
        "Scoreเดือน(NPL)": item["Scoreเดือน(NPL)"],
        "เกรด3เดือน(NPL)": item["เกรด3เดือน(NPL)"],
        "Score3เดือน(NPL)": item["Score3เดือน(NPL)"],
        "ผลงาน(NPL)(%Toral CURED)": item["ผลงาน(NPL)(%Toral CURED)"],
        "ผลงาน(NPL)(%DR)": item["ผลงาน(NPL)(%DR)"],
        "ผลงาน(NPL)(%ตบเด้ง)": item["ผลงาน(NPL)(%ตบเด้ง)"],
        "ผลงาน(NPL)(%REPO)": item["ผลงาน(NPL)(%REPO)"],
      });
    });

    // สร้างไฟล์ Excel และดาวน์โหลด
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Performance_Data_${format(date, "yyyy-MM-dd")}.xlsx`);
    toast({
      title: "ดาวน์โหลดไฟล์ Excel สำเร็จ",
    });
  };

  // คำนวณข้อมูลรวม
  const totalStats = useMemo(() => {
    return performanceData.reduce((acc, team) => {
      acc.totalAssigned6090 += team["กลุ่มงาน6090รับงาน(จำนวน)"] || 0;
      acc.totalRemaining6090 += team["กลุ่มงาน6090คงเหลือ(จำนวน)"] || 0;
      acc.totalCompleted6090 += (team["กลุ่มงาน6090รับงาน(จำนวน)"] || 0) - (team["กลุ่มงาน6090คงเหลือ(จำนวน)"] || 0);
      acc.totalCured += team["6090ต้องเก็บงานกลุ่ม(Toral CURED)"] || 0;
      acc.totalDR += team["6090ต้องเก็บงานกลุ่ม(DR)"] || 0;
      acc.totalTapDeng += team["6090ต้องเก็บงานกลุ่ม(ตบเด้ง)"] || 0;
      acc.totalRepo += team["6090ต้องเก็บงานกลุ่ม(REPO)"] || 0;
      return acc;
    }, {
      totalAssigned6090: 0,
      totalRemaining6090: 0,
      totalCompleted6090: 0,
      totalCured: 0,
      totalDR: 0,
      totalTapDeng: 0,
      totalRepo: 0,
    });
  }, [performanceData]);

  // กรองข้อมูลตามตัวกรอง
  const filteredPerformanceData = useMemo(() => {
    const filtered = performanceData.filter(item => {
      // Log เพื่อตรวจสอบค่า กลุ่มงาน
      console.log("item.กลุ่มงาน:", item.กลุ่มงาน, "selectedGroup:", selectedGroup);

      // กรองตามกลุ่มงาน (มาก่อนเพื่อป้องกันการกรองซ้ำซ้อน)
      if (selectedGroup !== "all") {
        const groupValue = item.กลุ่มงาน?.trim(); // ลบช่องว่างหน้า-หลัง
        console.log("groupValue after trim:", groupValue); // Log เพื่อตรวจสอบค่า groupValue
        if (selectedGroup === "6090" && groupValue !== "กลุ่มงาน6090") {
          console.log("Filtered out (6090):", item.ทีมลพท);
          return false;
        }
        if (selectedGroup === "NPL" && groupValue !== "กลุ่มงานNPL") {
          console.log("Filtered out (NPL):", item.ทีมลพท);
          return false;
        }
      }

      // กรองตามสาขา
      if (selectedBranch !== "all" && !branches.includes(item.ทีมลพท)) {
        console.log("Filtered out (branch):", item.ทีมลพท);
        return false;
      }
      if (selectedBranch !== "all" && item.ทีมลพท !== selectedBranch) {
        console.log("Filtered out (branch match):", item.ทีมลพท);
        return false;
      }

      // กรองตามทีมงาน
      if (selectedTeam !== "all" && item.ทีมลพท !== selectedTeam) {
        console.log("Filtered out (team):", item.ทีมลพท);
        return false;
      }

      // Log รายการที่ผ่านการกรอง
      console.log("Item passed filters:", item.ทีมลพท, "กลุ่มงาน:", item.กลุ่มงาน);
      return true;
    });

    // Log รายการทั้งหมดใน filteredPerformanceData
    console.log("filteredPerformanceData:", filtered);
    filtered.forEach(item => {
      console.log("Filtered item - ทีมลพท:", item.ทีมลพท, "กลุ่มงาน:", item.กลุ่มงาน);
    });

    return filtered;
  }, [selectedBranch, selectedTeam, selectedGroup, performanceData]);

  // Log filteredPerformanceData เพื่อตรวจสอบ
  useEffect(() => {
    console.log("filteredPerformanceData:", filteredPerformanceData);
  }, [filteredPerformanceData]);

  // คำนวณข้อมูลสำหรับ Summary Cards
  const summaryStats = useMemo(() => {
    const filteredData = filteredPerformanceData; // ใช้ filteredPerformanceData แทน performanceData

    const gradeMonth = filteredData.length > 0 ? filteredData[0]["เกรดเดือน(6090)"] : "N/A";
    const scoreMonth = filteredData.length > 0 ? filteredData[0]["Scoreเดือน(6090)"] : 0;
    const gradeThreeMonths = filteredData.length > 0 ? filteredData[0]["เกรด3เดือน(6090)"] : "N/A";
    const scoreThreeMonths = filteredData.length > 0 ? filteredData[0]["Score3เดือน(6090)"] : 0;

    return {
      gradeMonth,
      scoreMonth,
      gradeThreeMonths,
      scoreThreeMonths,
    };
  }, [selectedBranch, selectedTeam, selectedGroup, filteredPerformanceData]);

  // คำนวณข้อมูลสำหรับ Progress Bar
  const progressStats = useMemo(() => {
    const totals = filteredPerformanceData.reduce((acc, item) => {
      acc.cured += item["ผลงาน(6090)(%Toral CURED)"] || 0;
      acc.dr += item["ผลงาน(6090)(%DR)"] || 0;
      acc.tapDeng += item["ผลงาน(6090)(%ตบเด้ง)"] || 0;
      acc.repo += item["ผลงาน(6090)(%REPO)"] || 0;
      return acc;
    }, { cured: 0, dr: 0, tapDeng: 0, repo: 0 });

    const count = filteredPerformanceData.length || 1;
    return {
      curedPercent: (totals.cured / count) * 100,
      drPercent: (totals.dr / count) * 100,
      tapDengPercent: (totals.tapDeng / count) * 100,
      repoPercent: (totals.repo / count) * 100,
    };
  }, [filteredPerformanceData]);

  // คำนวณข้อมูลสำหรับเป้าหมายที่ยังขาด
  const difStats = useMemo(() => {
    const totals = filteredPerformanceData.reduce((acc, item) => {
      acc.cured += item["6090ต้องเก็บงานกลุ่ม(Toral CURED)"] || 0;
      acc.dr += item["6090ต้องเก็บงานกลุ่ม(DR)"] || 0;
      acc.tapDeng += item["6090ต้องเก็บงานกลุ่ม(ตบเด้ง)"] || 0;
      acc.repo += item["6090ต้องเก็บงานกลุ่ม(REPO)"] || 0;
      return acc;
    }, { cured: 0, dr: 0, tapDeng: 0, repo: 0 });

    return {
      difCured: totals.cured,
      difDR: totals.dr,
      difTapDeng: totals.tapDeng,
      difRepo: totals.repo,
    };
  }, [filteredPerformanceData]);

  // รายการทีมงานสำหรับตัวกรอง (ใช้ teams ที่กำหนดไว้)
  const teamOptions = teams;

  const handleShare = () => {
    toast({
      title: "แชร์รายงานผลงานสำเร็จ"
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} ล้าน`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString('th-TH', { minimumFractionDigits: 2 });
  };

  // เงื่อนไขสำหรับการ disable ตัวกรอง
  const isBranchDisabled = selectedTeam !== "all";
  const isTeamDisabled = selectedBranch !== "all";

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
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleDownload}
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Select 
          value={selectedBranch} 
          onValueChange={setSelectedBranch}
          disabled={isBranchDisabled}
        >
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <span className="truncate">
              {selectedBranch === "all" ? "สาขา: ทั้งหมด" : `สาขา: ${selectedBranch}`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">สาขา: ทั้งหมด</SelectItem>
            {branches.map(branch => (
              <SelectItem key={branch} value={branch}>สาขา: {branch}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedTeam} 
          onValueChange={setSelectedTeam}
          disabled={isTeamDisabled}
        >
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

        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-[140px]">
            <span className="truncate">
              {selectedGroup === "all" ? "กลุ่มงาน: ทั้งหมด" : 
               selectedGroup === "6090" ? "กลุ่มงาน: 6090" : "กลุ่มงาน: NPL"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {groups.map(group => (
              <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[140px]">
            <span className="truncate">
              {selectedPeriod === "today" ? "วันนี้" : 
               selectedPeriod === "week" ? "สัปดาห์นี้" : 
               selectedPeriod === "month" ? "เดือนนี้" : "ปีนี้"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">วันนี้</SelectItem>
            <SelectItem value="week">สัปดาห์นี้</SelectItem>
            <SelectItem value="month">เดือนนี้</SelectItem>
            <SelectItem value="year">ปีนี้</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#162A6B] transition"
        >
          อิมพอร์ต Excel
        </Button>
        <Button
          onClick={handleDownload}
          className="px-4 py-2 bg-[#F97316] text-white rounded-md hover:bg-[#E55B13] transition"
        >
          ดาวน์โหลด Excel
        </Button>
        <input
          type="file"
          accept=".xlsx"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className={`border-l-4 ${summaryStats.gradeMonth === 'A' ? 'border-l-green-500' : 
                                        summaryStats.gradeMonth === 'B' ? 'border-l-blue-500' : 
                                        summaryStats.gradeMonth === 'C' ? 'border-l-yellow-500' : 
                                        summaryStats.gradeMonth === 'D' ? 'border-l-orange-500' : 
                                        'border-l-red-500'} card-shadow`}>
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">เกรด/เดือน (A,B,C,D,E)</p>
            <p className="text-xl font-bold">{summaryStats.gradeMonth}</p>
            <p className="text-xs text-gray-400">เป้าหมาย: A</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 card-shadow">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">Score/เดือน</p>
            <p className="text-xl font-bold">{formatNumber(summaryStats.scoreMonth)}</p>
            <div className="flex items-center gap-1 mt-1">
              <Activity className="h-3 w-3 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${summaryStats.gradeThreeMonths === 'A' ? 'border-l-green-500' : 
                                        summaryStats.gradeThreeMonths === 'B' ? 'border-l-blue-500' : 
                                        summaryStats.gradeThreeMonths === 'C' ? 'border-l-yellow-500' : 
                                        summaryStats.gradeThreeMonths === 'D' ? 'border-l-orange-500' : 
                                        'border-l-red-500'} card-shadow`}>
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">เกรด/3เดือน (A,B,C,D,E)</p>
            <p className="text-xl font-bold">{summaryStats.gradeThreeMonths}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 card-shadow">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">Score/3เดือน</p>
            <p className="text-xl font-bold">{formatNumber(summaryStats.scoreThreeMonths)}</p>
            <div className="flex items-center">
              <Award className="h-3 w-3 text-purple-500 mr-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Views */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
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
        
        <TabsContent value="summary">
          {filteredPerformanceData.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="p-3">
                <p className="text-center text-gray-500">ไม่มีข้อมูลที่ตรงกับตัวกรอง กรุณาลองเปลี่ยนตัวกรองหรืออัพโหลดข้อมูลใหม่</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="card-shadow mb-3">
                <CardContent className="p-3">
                  <h3 className="font-medium mb-2 text-sm">ผลงาน</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CURED</span>
                        <span>{progressStats.curedPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressStats.curedPercent} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>DR</span>
                        <span>{progressStats.drPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressStats.drPercent} className="h-2 bg-secondary [&>div]:bg-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>ตบเด้ง</span>
                        <span>{progressStats.tapDengPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressStats.tapDengPercent} className="h-2 bg-secondary [&>div]:bg-purple-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>REPO</span>
                        <span>{progressStats.repoPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressStats.repoPercent} className="h-2 bg-secondary [&>div]:bg-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardContent className="p-3">
                  <h3 className="font-medium mb-2 text-sm">เป้าหมายที่ยังขาด</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-md p-2">
                      <p className="text-xs text-gray-500">dif(Total CURED)</p>
                      <p className="text-lg font-bold">{formatNumber(difStats.difCured)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-2">
                      <p className="text-xs text-gray-500">dif(DR)</p>
                      <p className="text-lg font-bold">{formatNumber(difStats.difDR)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-2">
                      <p className="text-xs text-gray-500">dif(ตบเด้ง)</p>
                      <p className="text-lg font-bold">{formatNumber(difStats.difTapDeng)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-2">
                      <p className="text-xs text-gray-500">dif(REPO)</p>
                      <p className="text-lg font-bold">{formatNumber(difStats.difRepo)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="byTeam">
          {filteredPerformanceData.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="p-3">
                <p className="text-center text-gray-500">ไม่มีข้อมูลที่ตรงกับตัวกรอง กรุณาลองเปลี่ยนตัวกรองหรืออัพโหลดข้อมูลใหม่</p>
              </CardContent>
            </Card>
          ) : (
            filteredPerformanceData.map((team, index) => (
              <Card key={index} className="card-shadow mb-3">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm">{team.ทีมลพท}</h3>
                    <Badge variant={team["เกรดเดือน(6090)"] === "A" ? "success" : "secondary"}>
                      {team["เกรดเดือน(6090)"]}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>CURED</span>
                        <span>{(team["ผลงาน(6090)(%Toral CURED)"] * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={team["ผลงาน(6090)(%Toral CURED)"] * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>DR</span>
                        <span>{(team["ผลงาน(6090)(%DR)"] * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={team["ผลงาน(6090)(%DR)"] * 100} className="h-2 bg-secondary [&>div]:bg-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>ตบเด้ง</span>
                        <span>{(team["ผลงาน(6090)(%ตบเด้ง)"] * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={team["ผลงาน(6090)(%ตบเด้ง)"] * 100} className="h-2 bg-secondary [&>div]:bg-purple-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>REPO</span>
                        <span>{(team["ผลงาน(6090)(%REPO)"] * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={team["ผลงาน(6090)(%REPO)"] * 100} className="h-2 bg-secondary [&>div]:bg-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="detail">
          <Card className="card-shadow">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-sm">ตารางข้อมูล</h3>
                <Select value={detailView} onValueChange={setDetailView}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="6090">กลุ่มงาน 6090</SelectItem>
                    <SelectItem value="npl">กลุ่มงาน NPL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filteredPerformanceData.length === 0 ? (
                <p className="text-center text-gray-500">ไม่มีข้อมูลที่ตรงกับตัวกรอง กรุณาลองเปลี่ยนตัวกรองหรืออัพโหลดข้อมูลใหม่</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ทีม</TableHead>
                      <TableHead>กลุ่มงาน</TableHead>
                      {detailView !== "npl" && <TableHead>รับงาน (6090)</TableHead>}
                      {detailView !== "npl" && <TableHead>คงเหลือ (6090)</TableHead>}
                      {detailView !== "npl" && <TableHead>% CURED (6090)</TableHead>}
                      {detailView !== "6090" && <TableHead>รับงาน (NPL)</TableHead>}
                      {detailView !== "6090" && <TableHead>คงเหลือ (NPL)</TableHead>}
                      {detailView !== "6090" && <TableHead>% CURED (NPL)</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPerformanceData.map((team, index) => (
                      <TableRow key={index}>
                        <TableCell>{team.ทีมลพท}</TableCell>
                        <TableCell>{team.กลุ่มงาน}</TableCell>
                        {detailView !== "npl" && <TableCell>{team["กลุ่มงาน6090รับงาน(จำนวน)"]}</TableCell>}
                        {detailView !== "npl" && <TableCell>{team["กลุ่มงาน6090คงเหลือ(จำนวน)"]}</TableCell>}
                        {detailView !== "npl" && <TableCell>{(team["ผลงาน(6090)(%Toral CURED)"] * 100).toFixed(1)}%</TableCell>}
                        {detailView !== "6090" && <TableCell>{team["กลุ่มงานNPLรับงาน(จำนวน)"]}</TableCell>}
                        {detailView !== "6090" && <TableCell>{team["กลุ่มงานNPLคงเหลือ(จำนวน)"]}</TableCell>}
                        {detailView !== "6090" && <TableCell>{(team["ผลงาน(NPL)(%Toral CURED)"] * 100).toFixed(1)}%</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;