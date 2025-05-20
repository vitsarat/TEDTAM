
import React, { useState, useMemo, useEffect } from "react";
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
import { customerService } from "@/services/customerService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Customer } from "@/types/customer";

// Define a type for the performance data
interface PerformanceTeam {
  "กลุ่มงาน6090": string;
  "ทีมลพท": string;
  "กลุ่มงาน6090รับงาน(จำนวน)": number;
  "ยอด(princ)": string;
  "กลุ่มงาน6090คงเหลือ(จำนวน)": number;
  "6090ต้องเก็บงานกลุ่ม(Toral CURED)": number;
  "6090ต้องเก็บงานกลุ่ม(DR)": number;
  "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)": number;
  "6090ต้องเก็บงานกลุ่ม(REPO)": number;
  "กลุ่มงานNPL": string;
  "กลุ่มงานNPLรับงาน(จำนวน)": number;
  "กลุ่มงานNPLยอด(princ)": string;
  "กลุ่มงานNPLคงเหลือ(จำนวน)": number;
  "NPLต้องเก็บงานกลุ่ม(DR)": number;
  "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)": number;
  "NPLต้องเก็บงานกลุ่ม(REPO)": number;
  "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)": number;
}

const performanceData = [
  {
    "กลุ่มงาน6090": "กลุ่มงาน6090",
    "ทีมลพท": "นกแก้ว",
    "กลุ่มงาน6090รับงาน(จำนวน)": 83,
    "ยอด(princ)": "19.88 ล้าน",
    "กลุ่มงาน6090คงเหลือ(จำนวน)": 34,
    "6090ต้องเก็บงานกลุ่ม(Toral CURED)": 5385527.39,
    "6090ต้องเก็บงานกลุ่ม(DR)": 795073.2,
    "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)": -997232.58,
    "6090ต้องเก็บงานกลุ่ม(REPO)": -1694968.84,
    "กลุ่มงานNPL": "กลุ่มงานNPL",
    "กลุ่มงานNPLรับงาน(จำนวน)": 10,
    "กลุ่มงานNPLยอด(princ)": "1.64 ล้าน",
    "กลุ่มงานNPLคงเหลือ(จำนวน)": 5,
    "NPLต้องเก็บงานกลุ่ม(DR)": 245006.83,
    "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)": -29433.39,
    "NPLต้องเก็บงานกลุ่ม(REPO)": -254849.42,
    "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)": 339
  },
  {
    "กลุ่มงาน6090": "กลุ่มงาน6090",
    "ทีมลพท": "ออย",
    "กลุ่มงาน6090รับงาน(จำนวน)": 62,
    "ยอด(princ)": "13.24 ล้าน",
    "กลุ่มงาน6090คงเหลือ(จำนวน)": 27,
    "6090ต้องเก็บงานกลุ่ม(Toral CURED)": 5157272.72,
    "6090ต้องเก็บงานกลุ่ม(DR)": 179383.77,
    "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)": 885740.8,
    "6090ต้องเก็บงานกลุ่ม(REPO)": 1075228.85,
    "กลุ่มงานNPL": "กลุ่มงานNPL",
    "กลุ่มงานNPLรับงาน(จำนวน)": 2,
    "กลุ่มงานNPLยอด(princ)": "0.23 ล้าน",
    "กลุ่มงานNPLคงเหลือ(จำนวน)": 2,
    "NPLต้องเก็บงานกลุ่ม(DR)": 34760.1,
    "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)": 62754.8,
    "NPLต้องเก็บงานกลุ่ม(REPO)": 30327.6,
    "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)": 378
  },
  {
    "กลุ่มงาน6090": "กลุ่มงาน6090",
    "ทีมลพท": "กุ้ง",
    "กลุ่มงาน6090รับงาน(จำนวน)": 60,
    "ยอด(princ)": "15.15 ล้าน",
    "กลุ่มงาน6090คงเหลือ(จำนวน)": 19,
    "6090ต้องเก็บงานกลุ่ม(Toral CURED)": 3525218.19,
    "6090ต้องเก็บงานกลุ่ม(DR)": 605804.74,
    "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)": 765157.67,
    "6090ต้องเก็บงานกลุ่ม(REPO)": -365305.78,
    "กลุ่มงานNPL": "กลุ่มงานNPL",
    "กลุ่มงานNPLรับงาน(จำนวน)": 7,
    "กลุ่มงานNPLยอด(princ)": "1.70 ล้าน",
    "กลุ่มงานNPLคงเหลือ(จำนวน)": 4,
    "NPLต้องเก็บงานกลุ่ม(DR)": 252882.96,
    "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)": -98976.99,
    "NPLต้องเก็บงานกลุ่ม(REPO)": -20402.7,
    "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)": 273
  },
  {
    "กลุ่มงาน6090": "กลุ่มงาน6090",
    "ทีมลพท": "บาส",
    "กลุ่มงาน6090รับงาน(จำนวน)": 54,
    "ยอด(princ)": "14.87 ล้าน",
    "กลุ่มงาน6090คงเหลือ(จำนวน)": 25,
    "6090ต้องเก็บงานกลุ่ม(Toral CURED)": 5487459.64,
    "6090ต้องเก็บงานกลุ่ม(DR)": 594967.65,
    "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)": 644951.43,
    "6090ต้องเก็บงานกลุ่ม(REPO)": -522326.02,
    "กลุ่มงานNPL": "กลุ่มงานNPL",
    "กลุ่มงานNPLรับงาน(จำนวน)": 15,
    "กลุ่มงานNPLยอด(princ)": "4.50 ล้าน",
    "กลุ่มงานNPLคงเหลือ(จำนวน)": 13,
    "NPLต้องเก็บงานกลุ่ม(DR)": 670517.24,
    "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)": 734692.99,
    "NPLต้องเก็บงานกลุ่ม(REPO)": 585015.04,
    "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)": 199
  },
  {
    "กลุ่มงาน6090": "กลุ่มงาน6090",
    "ทีมลพท": "โป้ง",
    "กลุ่มงาน6090รับงาน(จำนวน)": 25,
    "ยอด(princ)": "6.45 ล้าน",
    "กลุ่มงาน6090คงเหลือ(จำนวน)": 13,
    "6090ต้องเก็บงานกลุ่ม(Toral CURED)": 1802289.16,
    "6090ต้องเก็บงานกลุ่ม(DR)": 257981.1,
    "6090ต้องเก็บงานกลุ่ม(ตบเด้ง)": 445017.41,
    "6090ต้องเก็บงานกลุ่ม(REPO)": 45143.24,
    "กลุ่มงานNPL": "กลุ่มงานNPL",
    "กลุ่มงานNPLรับงาน(จำนวน)": 15,
    "กลุ่มงานNPLยอด(princ)": "4.50 ล้าน",
    "กลุ่มงานNPLคงเหลือ(จำนวน)": 13,
    "NPLต้องเก็บงานกลุ่ม(DR)": 670517.24,
    "NPLต้องเก็บงานกลุ่ม(ตบเด้ง)": 734692.99,
    "NPLต้องเก็บงานกลุ่ม(REPO)": 585015.04,
    "6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)": 168
  }
];

const Performance: React.FC = () => {
  const [selectedWorkGroup, setSelectedWorkGroup] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("today");
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [detailView, setDetailView] = useState<"6090" | "npl" | "all">("all");
  const [date, setDate] = useState<Date>(new Date());
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // โหลดข้อมูลลูกค้า
  useEffect(() => {
    const loadedCustomers = customerService.getCustomers();
    setCustomers(loadedCustomers);
  }, []);
  
  // คำนวณข้อมูลจาก customer data
  const customerStats = useMemo(() => {
    const stats = {
      totalCustomers6090: 0,
      totalCustomersNPL: 0,
      completedTasks6090: 0,
      completedTasksNPL: 0,
      cured: 0,
      dr: 0,
      repo: 0,
      tapDeng: 0
    };
    
    customers.forEach(customer => {
      if (customer.workGroup === "6090") {
        stats.totalCustomers6090++;
        if (customer.status === "จบ") stats.completedTasks6090++;
      } else if (customer.workGroup === "NPL") {
        stats.totalCustomersNPL++;
        if (customer.status === "จบ") stats.completedTasksNPL++;
      }
      
      // คำนวณตามประเภท resus
      if (customer.resus === "CURED") stats.cured += customer.principle;
      else if (customer.resus === "DR") stats.dr += customer.principle;
      else if (customer.resus === "REPO") stats.repo += customer.principle;
      else if (customer.resus === "ตบเด้ง") stats.tapDeng += customer.principle;
    });
    
    return stats;
  }, [customers]);
  
  // Calculate total performance based on the data
  const totalStats = useMemo(() => {
    return performanceData.reduce((acc, team) => {
      // Sum up 6090 data
      acc.totalAssigned6090 += team["กลุ่มงาน6090รับงาน(จำนวน)"];
      acc.totalRemaining6090 += team["กลุ่มงาน6090คงเหลือ(จำนวน)"];
      acc.totalCompleted6090 += (team["กลุ่มงาน6090รับงาน(จำนวน)"] - team["กลุ่มงาน6090คงเหลือ(จำนวน)"]);
      
      // Sum up NPL data
      acc.totalAssignedNPL += team["กลุ่มงานNPLรับงาน(จำนวน)"];
      acc.totalRemainingNPL += team["กลุ่มงานNPLคงเหลือ(จำนวน)"];
      acc.totalCompletedNPL += (team["กลุ่มงานNPLรับงาน(จำนวน)"] - team["กลุ่มงานNPLคงเหลือ(จำนวน)"]);
      
      // Total Cured, DR, Repo values
      acc.totalCured += team["6090ต้องเก็บงานกลุ่ม(Toral CURED)"];
      acc.totalDR += (team["6090ต้องเก็บงานกลุ่ม(DR)"] + team["NPLต้องเก็บงานกลุ่ม(DR)"]);
      acc.totalRepo += (team["6090ต้องเก็บงานกลุ่ม(REPO)"] + team["NPLต้องเก็บงานกลุ่ม(REPO)"]);
      acc.totalTapDeng += (team["6090ต้องเก็บงานกลุ่ม(ตบเด้ง)"] + team["NPLต้องเก็บงานกลุ่ม(ตบเด้ง)"]);
      acc.totalReports += team["6090ต้องเก็บงานกลุ่ม(คีย์รายงาน)"];
      
      return acc;
    }, {
      totalAssigned6090: 0,
      totalRemaining6090: 0,
      totalCompleted6090: 0,
      totalAssignedNPL: 0,
      totalRemainingNPL: 0,
      totalCompletedNPL: 0,
      totalCured: 0,
      totalDR: 0,
      totalRepo: 0,
      totalTapDeng: 0,
      totalReports: 0
    });
  }, [performanceData]);
  
  // คำนวณข้อมูลจาก customer เพื่อแสดงผล
  const realStats = useMemo(() => {
    // คำนวณสถิติจำนวนลูกค้าและผลงาน
    const total = customerStats.totalCustomers6090 + customerStats.totalCustomersNPL;
    const completed = customerStats.completedTasks6090 + customerStats.completedTasksNPL;
    
    // คำนวณอัตราส่วนของแต่ละประเภท
    const totalResusAmount = customerStats.cured + customerStats.dr + customerStats.repo + customerStats.tapDeng;
    const curedPercent = totalResusAmount > 0 ? Math.round((customerStats.cured / totalResusAmount) * 100) : 0;
    const drPercent = totalResusAmount > 0 ? Math.round((customerStats.dr / totalResusAmount) * 100) : 0;
    const repoPercent = totalResusAmount > 0 ? Math.round((customerStats.repo / totalResusAmount) * 100) : 0;
    const tapDengPercent = totalResusAmount > 0 ? Math.round((customerStats.tapDeng / totalResusAmount) * 100) : 0;
    
    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalAmount: totalResusAmount,
      commission: totalResusAmount * 0.03, // คิดค่าคอมมิชชัน 3%
      curedPercent,
      drPercent,
      repoPercent,
      tapDengPercent
    };
  }, [customerStats]);
  
  const filteredPerformanceData = useMemo(() => {
    return performanceData.filter(item => {
      if (selectedWorkGroup !== "all" && 
          (selectedWorkGroup === "6090" && item["กลุ่มงาน6090"] !== "กลุ่มงาน6090" || 
           selectedWorkGroup === "NPL" && item["กลุ่มงานNPL"] !== "กลุ่มงานNPL")) {
        return false;
      }
      
      if (selectedTeam !== "all" && item["ทีมลพท"] !== selectedTeam) {
        return false;
      }
      
      return true;
    });
  }, [selectedWorkGroup, selectedTeam, performanceData]);
  
  // Create chart data
  const chartData = useMemo(() => {
    return filteredPerformanceData.map(team => ({
      name: team["ทีมลพท"],
      assigned: team["กลุ่มงาน6090รับงาน(จำนวน)"] + team["กลุ่มงานNPLรับงาน(จำนวน)"],
      completed: (team["กลุ่มงาน6090รับงาน(จำนวน)"] - team["กลุ่มงาน6090คงเหลือ(จำนวน)"]) + 
                (team["กลุ่มงานNPLรับงาน(จำนวน)"] - team["กลุ่มงานNPLคงเหลือ(จำนวน)"]),
      cured: Math.round(team["6090ต้องเก็บงานกลุ่ม(Toral CURED)"] / 100000) / 10,
      dr: Math.round((team["6090ต้องเก็บงานกลุ่ม(DR)"] + team["NPLต้องเก็บงานกลุ่ม(DR)"]) / 100000) / 10,
      tapDeng: Math.round((team["6090ต้องเก็บงานกลุ่ม(ตบเด้ง)"] + team["NPLต้องเก็บงานกลุ่ม(ตบเด้ง)"]) / 100000) / 10,
      repo: Math.round((team["6090ต้องเก็บงานกลุ่ม(REPO)"] + team["NPLต้องเก็บงานกลุ่ม(REPO)"]) / 100000) / 10
    }));
  }, [filteredPerformanceData]);
  
  // Get unique teams for dropdown
  const teamOptions = useMemo(() => {
    const teams = new Set(performanceData.map(item => item["ทีมลพท"]));
    return Array.from(teams);
  }, [performanceData]);

  const handleShare = () => {
    toast({
      title: "แชร์รายงานผลงานสำเร็จ"
    });
  };

  const handleExport = () => {
    toast({
      title: "ดาวน์โหลดรายงานเป็น Excel สำเร็จ"
    });
  };
  
  // Format number to display in Thai format
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} ล้าน`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString('th-TH');
  };
  
  const renderTeamProgress = (team: PerformanceTeam) => {
    const completed = (team["กลุ่มงาน6090รับงาน(จำนวน)"] - team["กลุ่มงาน6090คงเหลือ(จำนวน)"]) + 
                      (team["กลุ่มงานNPLรับงาน(จำนวน)"] - team["กลุ่มงานNPLคงเหลือ(จำนวน)"]);
    const total = team["กลุ่มงาน6090รับงาน(จำนวน)"] + team["กลุ่มงานNPLรับงาน(จำนวน)"];
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>ความคืบหน้า ({completed}/{total})</span>
          <span>{percent}%</span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>
    );
  };

  // เพิ่มฟังก์ชันสำหรับการแสดงผลข้อมูลแยกตามประเภท
  const getFilteredStats = (viewType: "6090" | "npl" | "all") => {
    if (viewType === "all") {
      return {
        assigned: realStats.total,
        completed: realStats.completed,
        remaining: realStats.total - realStats.completed,
        percent: realStats.completionRate
      };
    } else if (viewType === "6090") {
      return {
        assigned: customerStats.totalCustomers6090,
        completed: customerStats.completedTasks6090,
        remaining: customerStats.totalCustomers6090 - customerStats.completedTasks6090,
        percent: customerStats.totalCustomers6090 > 0 ? 
          Math.round((customerStats.completedTasks6090 / customerStats.totalCustomers6090) * 100) : 0
      };
    } else {
      return {
        assigned: customerStats.totalCustomersNPL,
        completed: customerStats.completedTasksNPL,
        remaining: customerStats.totalCustomersNPL - customerStats.completedTasksNPL,
        percent: customerStats.totalCustomersNPL > 0 ? 
          Math.round((customerStats.completedTasksNPL / customerStats.totalCustomersNPL) * 100) : 0
      };
    }
  };
  
  // สร้างข้อมูลสำหรับแต่ละทีม (ใช้ข้อมูลจาก customer)
  const teamPerformance = useMemo(() => {
    // จัดกลุ่มข้อมูลลูกค้าตามทีม
    const teamData: Record<string, {
      total6090: number,
      totalNPL: number,
      completed6090: number,
      completedNPL: number,
      cured: number,
      dr: number,
      repo: number,
      tapDeng: number
    }> = {};
    
    customers.forEach(customer => {
      if (!teamData[customer.team]) {
        teamData[customer.team] = {
          total6090: 0,
          totalNPL: 0,
          completed6090: 0,
          completedNPL: 0,
          cured: 0,
          dr: 0,
          repo: 0,
          tapDeng: 0
        };
      }
      
      if (customer.workGroup === "6090") {
        teamData[customer.team].total6090++;
        if (customer.status === "จบ") teamData[customer.team].completed6090++;
      } else if (customer.workGroup === "NPL") {
        teamData[customer.team].totalNPL++;
        if (customer.status === "จบ") teamData[customer.team].completedNPL++;
      }
      
      // คำนวณยอดตาม resus
      if (customer.resus === "CURED") teamData[customer.team].cured += customer.principle;
      else if (customer.resus === "DR") teamData[customer.team].dr += customer.principle;
      else if (customer.resus === "REPO") teamData[customer.team].repo += customer.principle;
      else if (customer.resus === "ตบเด้ง") teamData[customer.team].tapDeng += customer.principle;
    });
    
    return Object.entries(teamData).map(([team, data]) => ({
      team,
      total: data.total6090 + data.totalNPL,
      totalCompleted: data.completed6090 + data.completedNPL,
      percentComplete: (data.total6090 + data.totalNPL) > 0 ? 
        Math.round(((data.completed6090 + data.completedNPL) / (data.total6090 + data.totalNPL)) * 100) : 0,
      cured: data.cured,
      dr: data.dr,
      repo: data.repo,
      tapDeng: data.tapDeng
    }));
  }, [customers]);
  
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
            onClick={handleExport}
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Select value={selectedWorkGroup} onValueChange={setSelectedWorkGroup}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <span className="truncate">
              {selectedWorkGroup === "all" ? "กลุ่มงาน: ทั้งหมด" : 
               selectedWorkGroup === "6090" ? "กลุ่มงาน: 6090" : 
               "กลุ่มงาน: NPL"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">กลุ่มงาน: ทั้งหมด</SelectItem>
            <SelectItem value="6090">กลุ่มงาน: 6090</SelectItem>
            <SelectItem value="NPL">กลุ่มงาน: NPL</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-[140px]">
            <span className="truncate">
              {selectedTeam === "all" ? "ทีม: ทั้งหมด" : `ทีม: ${selectedTeam}`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทีม: ทั้งหมด</SelectItem>
            {teamOptions.map(team => (
              <SelectItem key={team} value={team}>ทีม: {team}</SelectItem>
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="border-l-4 border-l-tedtam-blue card-shadow">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">งานทั้งหมด</p>
            <p className="text-xl font-bold">
              {realStats.total || totalStats.totalAssigned6090 + totalStats.totalAssignedNPL}
            </p>
            <p className="text-xs text-gray-400">เป้าหมาย {(realStats.total || (totalStats.totalAssigned6090 + totalStats.totalAssignedNPL)) + 20} ราย</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 card-shadow">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">จบงานแล้ว</p>
            <p className="text-xl font-bold">
              {realStats.completed || totalStats.totalCompleted6090 + totalStats.totalCompletedNPL}
            </p>
            <p className="text-xs text-green-500 font-medium">
              {realStats.completionRate || Math.round(((totalStats.totalCompleted6090 + totalStats.totalCompletedNPL) / 
                       (totalStats.totalAssigned6090 + totalStats.totalAssignedNPL)) * 100)}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-tedtam-orange card-shadow">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">Principle</p>
            <p className="text-xl font-bold">
              {formatNumber(realStats.totalAmount || totalStats.totalCured)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-green-500">+12% จากเดือนก่อน</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 card-shadow">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">คอมมิชชัน</p>
            <p className="text-xl font-bold">
              {formatNumber(realStats.commission || totalStats.totalCured * 0.03)}
            </p>
            <div className="flex items-center">
              <Award className="h-3 w-3 text-purple-500 mr-1" />
              <p className="text-xs text-purple-500">เพิ่มขึ้น 8%</p>
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
          <TabsTrigger value="charts" className="flex-1">
            <Activity className="h-4 w-4 mr-1" />
            กราฟ
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card className="card-shadow mb-3">
            <CardContent className="p-3">
              <h3 className="font-medium mb-2 text-sm">ความคืบหน้า</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CURED</span>
                    <span>{realStats.curedPercent || 67}%</span>
                  </div>
                  <Progress value={realStats.curedPercent || 67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>DR</span>
                    <span>{realStats.drPercent || 23}%</span>
                  </div>
                  <Progress value={realStats.drPercent || 23} className="h-2 bg-secondary [&>div]:bg-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>REPO</span>
                    <span>{realStats.repoPercent || 8}%</span>
                  </div>
                  <Progress value={realStats.repoPercent || 8} className="h-2 bg-secondary [&>div]:bg-red-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ตบเด้ง</span>
                    <span>{realStats.tapDengPercent || 2}%</span>
                  </div>
                  <Progress value={realStats.tapDengPercent || 2} className="h-2 bg-secondary [&>div]:bg-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-sm">สถิติงานรวม</h3>
                <div className="flex">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-7 text-xs px-2 ${detailView === "all" ? "bg-gray-100" : ""}`}
                    onClick={() => setDetailView("all")}
                  >
                    ทั้งหมด
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-7 text-xs px-2 ${detailView === "6090" ? "bg-gray-100" : ""}`}
                    onClick={() => setDetailView("6090")}
                  >
                    6090
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-7 text-xs px-2 ${detailView === "npl" ? "bg-gray-100" : ""}`}
                    onClick={() => setDetailView("npl")}
                  >
                    NPL
                  </Button>
                </div>
              </div>
              
              {/* แสดงค่าตามที่กรอง */}
              {(() => {
                const stats = getFilteredStats(detailView);
                return (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-md p-2">
                      <p className="text-xs text-gray-500">งานที่ได้รับ</p>
                      <p className="text-lg font-bold">{stats.assigned}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-2">
                      <p className="text-xs text-gray-500">จบแล้ว</p>
                      <p className="text-lg font-bold">{stats.completed}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-2">
                      <p className="text-xs text-gray-500">คงเหลือ</p>
                      <p className="text-lg font-bold">{stats.remaining}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-2">
                      <p className="text-xs text-gray-500">ทำได้</p>
                      <p className="text-lg font-bold text-green-500">{stats.percent}%</p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="byTeam">
          <div className="space-y-4">
            {/* แสดงข้อมูลจาก teamPerformance แทน */}
            {(teamPerformance.length > 0 ? teamPerformance : filteredPerformanceData).map((item, index) => {
              const team = "team" in item ? item : {
                team: item["ทีมลพท"],
                total: item["กลุ่มงาน6090รับงาน(จำนวน)"] + item["กลุ่มงานNPLรับงาน(จำนวน)"],
                totalCompleted: (item["กลุ่มงาน6090รับงาน(จำนวน)"] - item["กลุ่มงาน6090คงเหลือ(จำนวน)"]) + 
                              (item["กลุ่มงานNPLรับงาน(จำนวน)"] - item["กลุ่มงานNPLคงเหลือ(จำนวน)"]),
                percentComplete: Math.round(((item["กลุ่มงาน6090รับงาน(จำนวน)"] - item["กลุ่มงาน6090คงเหลือ(จำนวน)"]) + 
                                           (item["กลุ่มงานNPLรับงาน(จำนวน)"] - item["กลุ่มงานNPLคงเหลือ(จำนวน)"])) /
                                           (item["กลุ่มงาน6090รับงาน(จำนวน)"] + item["กลุ่มงานNPLรับงาน(จำนวน)"]) * 100),
                cured: item["6090ต้องเก็บงานกลุ่ม(Toral CURED)"],
                dr: item["6090ต้องเก็บงานกลุ่ม(DR)"] + item["NPLต้องเก็บงานกลุ่ม(DR)"],
                repo: item["6090ต้องเก็บงานกลุ่ม(REPO)"] + item["NPLต้องเก็บงานกลุ่ม(REPO)"],
                tapDeng: item["6090ต้องเก็บงานกลุ่ม(ตบเด้ง)"] + item["NPLต้องเก็บงานกลุ่ม(ตบเด้ง)"]
              };
              
              return (
                <Card key={index} className="card-shadow">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Badge className={`${index % 2 === 0 ? 'bg-tedtam-blue' : 'bg-tedtam-orange'} mr-2`}>
                          {team.team.charAt(0)}
                        </Badge>
                        <h3 className="font-medium text-sm">ทีม {team.team}</h3>
                      </div>
                      
                      {/* เพิ่มปุ่มกรองข้อมูลตามกลุ่มงาน */}
                      <div className="flex">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs px-2"
                          onClick={() => setDetailView("all")}
                        >
                          ทั้งหมด
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs px-2"
                          onClick={() => setDetailView("6090")}
                        >
                          6090
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs px-2"
                          onClick={() => setDetailView("npl")}
                        >
                          NPL
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>ความคืบหน้า ({team.totalCompleted}/{team.total})</span>
                          <span>{team.percentComplete}%</span>
                        </div>
                        <Progress value={team.percentComplete} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">CURED</p>
                        <p className="font-medium">{formatNumber(team.cured || 0)}</p>
                        <Progress value={Math.min(team.cured / 50000, 100)} className="h-1 mt-1" />
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">DR</p>
                        <p className="font-medium">{formatNumber(team.dr || 0)}</p>
                        <Progress 
                          value={Math.min(team.dr / 10000, 100)} 
                          className="h-1 mt-1 [&>div]:bg-blue-500" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">REPO</p>
                        <p className="font-medium">{formatNumber(team.repo || 0)}</p>
                        <Progress 
                          value={Math.min(Math.abs(team.repo) / 10000, 100)} 
                          className="h-1 mt-1 [&>div]:bg-red-500" 
                        />
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">ตบเด้ง</p>
                        <p className="font-medium">{formatNumber(team.tapDeng || 0)}</p>
                        <Progress 
                          value={Math.min(Math.abs(team.tapDeng) / 10000, 100)} 
                          className="h-1 mt-1 [&>div]:bg-purple-500" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="detail">
          <div className="flex justify-end mb-2">
            <div className="flex">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-xs px-2 ${detailView === "all" ? "bg-gray-100" : ""}`}
                onClick={() => setDetailView("all")}
              >
                ทั้งหมด
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-xs px-2 ${detailView === "6090" ? "bg-gray-100" : ""}`}
                onClick={() => setDetailView("6090")}
              >
                6090
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-xs px-2 ${detailView === "npl" ? "bg-gray-100" : ""}`}
                onClick={() => setDetailView("npl")}
              >
                NPL
              </Button>
            </div>
          </div>
          
          <Card className="card-shadow">
            <CardContent className="p-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ทีม</TableHead>
                      <TableHead className="text-right">รับงาน</TableHead>
                      <TableHead className="text-right">จบแล้ว</TableHead>
                      <TableHead className="text-right">%</TableHead>
                      <TableHead className="text-right">คงเหลือ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* แสดงตามฟิลเตอร์ที่เลือกไว้ */}
                    {filteredPerformanceData.map((team, index) => {
                      let assigned = 0;
                      let completed = 0;
                      let remaining = 0;
                      let percentage = 0;
                      
                      if (detailView === "all" || detailView === "6090") {
                        assigned += team["กลุ่มงาน6090รับงาน(จำนวน)"];
                        completed += (team["กลุ่มงาน6090รับงาน(จำนวน)"] - team["กลุ่มงาน6090คงเหลือ(จำนวน)"]);
                        remaining += team["กลุ่มงาน6090คงเหลือ(จำนวน)"];
                      }
                      
                      if (detailView === "all" || detailView === "npl") {
                        assigned += team["กลุ่มงานNPLรับงาน(จำนวน)"];
                        completed += (team["กลุ่มงานNPLรับงาน(จำนวน)"] - team["กลุ่มงานNPLคงเหลือ(จำนวน)"]);
                        remaining += team["กลุ่มงานNPLคงเหลือ(จำนวน)"];
                      }
                      
                      percentage = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{team["ทีมลพท"]}</TableCell>
                          <TableCell className="text-right">{assigned}</TableCell>
                          <TableCell className="text-right">{completed}</TableCell>
                          <TableCell className="text-right text-green-500 font-medium">{percentage}%</TableCell>
                          <TableCell className="text-right">{remaining}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts">
          <div className="flex justify-end mb-2">
            <div className="flex">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-xs px-2 ${detailView === "all" ? "bg-gray-100" : ""}`}
                onClick={() => setDetailView("all")}
              >
                ทั้งหมด
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-xs px-2 ${detailView === "6090" ? "bg-gray-100" : ""}`}
                onClick={() => setDetailView("6090")}
              >
                6090
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-xs px-2 ${detailView === "npl" ? "bg-gray-100" : ""}`}
                onClick={() => setDetailView("npl")}
              >
                NPL
              </Button>
            </div>
          </div>
          
          <Card className="card-shadow">
            <CardContent className="p-3">
              <h3 className="font-medium mb-4 text-sm">กราฟแสดงผลงาน</h3>
              <div className="h-80">
                <ChartContainer config={{
                  assigned: { theme: { light: "#9333ea", dark: "#d8b4fe" } },
                  completed: { theme: { light: "#16a34a", dark: "#86efac" } },
                  cured: { theme: { light: "#0891b2", dark: "#67e8f9" } },
                  dr: { theme: { light: "#f97316", dark: "#fdba74" } }
                }}>
                  <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="assigned" name="งานที่ได้รับ" fill="var(--color-assigned)" />
                    <Bar dataKey="completed" name="จบแล้ว" fill="var(--color-completed)" />
                    <Bar dataKey="cured" name="CURED" fill="var(--color-cured)" />
                    <Bar dataKey="dr" name="DR" fill="var(--color-dr)" />
                    {detailView !== "6090" && (
                      <>
                        <Bar dataKey="tapDeng" name="ตบเด้ง" fill="#9f7aea" />
                        <Bar dataKey="repo" name="REPO" fill="#f56565" />
                      </>
                    )}
                  </RechartsBarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leaderboard */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-tedtam-blue flex items-center">
            <Award className="h-5 w-5 mr-2" />
            อันดับผลงาน
          </h2>
          <Button variant="ghost" size="sm" className="text-xs text-tedtam-orange">
            ดูทั้งหมด <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </div>
        
        <Card className="card-shadow">
          <CardContent className="p-0">
            <div className="divide-y">
              {teamPerformance
                .sort((a, b) => b.percentComplete - a.percentComplete)
                .slice(0, 3)
                .map((team, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                        ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          i === 1 ? 'bg-gray-100 text-gray-700' : 
                          i === 2 ? 'bg-amber-100 text-amber-700' : 
                          'bg-gray-100 text-gray-700'}`
                        }
                      >
                        {i + 1}
                      </div>
                      <p className="font-medium">ทีม {team.team}</p>
                    </div>
                    <div className="flex items-center">
                      <p className={`font-bold 
                        ${i === 0 ? 'text-yellow-600' : 
                          i === 1 ? 'text-gray-600' : 
                          i === 2 ? 'text-amber-600' : 
                          'text-gray-600'}
                      `}>{team.percentComplete}%</p>
                      {i === 0 && (
                        <span className="ml-2 text-lg">🏆</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;
