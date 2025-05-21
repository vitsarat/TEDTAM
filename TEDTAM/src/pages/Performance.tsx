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
import { format, startOfDay, endOfDay } from "date-fns";
import { th } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { performanceService, PerformanceReport } from "@/services/performanceService";
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

const Performance: React.FC = () => {
  const [selectedWorkGroup, setSelectedWorkGroup] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("today");
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [detailView, setDetailView] = useState<"6090" | "npl" | "all">("all");
  const [date, setDate] = useState<Date>(new Date());
  const [performanceData, setPerformanceData] = useState<PerformanceReport[]>([]);

  // โหลดข้อมูล Performance จาก Supabase
  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        const data = await performanceService.getPerformanceData();
        setPerformanceData(data);
      } catch (error) {
        console.error('Error loading performance data:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลได้",
          variant: "destructive",
        });
      }
    };

    loadPerformanceData();
  }, [selectedPeriod, date]);

  // Real-time subscription สำหรับ performance reports
  useEffect(() => {
    const subscription = supabase
      .channel('performance_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'performance_reports',
      }, () => {
        loadPerformanceData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadPerformanceData = async () => {
    try {
      const data = await performanceService.getPerformanceData();
      setPerformanceData(data);
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  // คำนวณข้อมูลจาก performance data
  const totalStats = useMemo(() => {
    return performanceData.reduce((acc, team) => {
      if (team.work_group === "6090") {
        acc.totalAssigned6090 += team.total_assigned;
        acc.totalRemaining6090 += (team.total_assigned - team.total_completed);
        acc.totalCompleted6090 += team.total_completed;
      } else if (team.work_group === "NPL") {
        acc.totalAssignedNPL += team.total_assigned;
        acc.totalRemainingNPL += (team.total_assigned - team.total_completed);
        acc.totalCompletedNPL += team.total_completed;
      }

      acc.totalCured += team.total_cured;
      acc.totalDR += team.total_dr;
      acc.totalRepo += team.total_repo;
      acc.totalTapDeng += team.total_tap_deng;

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
    });
  }, [performanceData]);

  const realStats = useMemo(() => {
    const total = totalStats.totalAssigned6090 + totalStats.totalAssignedNPL;
    const completed = totalStats.totalCompleted6090 + totalStats.totalCompletedNPL;

    const totalResusAmount = totalStats.totalCured + totalStats.totalDR + totalStats.totalRepo + totalStats.totalTapDeng;
    const curedPercent = totalResusAmount > 0 ? Math.round((totalStats.totalCured / totalResusAmount) * 100) : 0;
    const drPercent = totalResusAmount > 0 ? Math.round((totalStats.totalDR / totalResusAmount) * 100) : 0;
    const repoPercent = totalResusAmount > 0 ? Math.round((totalStats.totalRepo / totalResusAmount) * 100) : 0;
    const tapDengPercent = totalResusAmount > 0 ? Math.round((totalStats.totalTapDeng / totalResusAmount) * 100) : 0;

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalAmount: totalResusAmount,
      commission: totalResusAmount * 0.03,
      curedPercent,
      drPercent,
      repoPercent,
      tapDengPercent,
    };
  }, [totalStats]);

  const filteredPerformanceData = useMemo(() => {
    return performanceData.filter(item => {
      if (selectedWorkGroup !== "all" && 
          (selectedWorkGroup === "6090" && item.work_group !== "6090" || 
           selectedWorkGroup === "NPL" && item.work_group !== "NPL")) {
        return false;
      }

      if (selectedTeam !== "all" && item.team !== selectedTeam) {
        return false;
      }

      return true;
    });
  }, [selectedWorkGroup, selectedTeam, performanceData]);

  const chartData = useMemo(() => {
    return filteredPerformanceData.map(team => ({
      name: team.team,
      assigned: team.total_assigned,
      completed: team.total_completed,
      cured: Math.round(team.total_cured / 100000) / 10,
      dr: Math.round(team.total_dr / 100000) / 10,
      tapDeng: Math.round(team.total_tap_deng / 100000) / 10,
      repo: Math.round(team.total_repo / 100000) / 10,
    }));
  }, [filteredPerformanceData]);

  const teamOptions = useMemo(() => {
    const teams = new Set(performanceData.map(item => item.team));
    return Array.from(teams);
  }, [performanceData]);

  const handleShare = () => {
    toast({
      title: "แชร์รายงานผลงานสำเร็จ",
    });
  };

  const handleExport = async () => {
    try {
      const data = await performanceService.getPerformanceByDateRange(
        startOfDay(date),
        endOfDay(date)
      );

      // แปลงข้อมูลเป็นรูปแบบสำหรับ Excel
      const worksheetData = data.map(item => ({
        ทีม: item.team,
        กลุ่มงาน: item.work_group,
        'งานที่ได้รับ': item.total_assigned,
        'งานที่จบแล้ว': item.total_completed,
        'ยอด CURED': item.total_cured,
        'ยอด DR': item.total_dr,
        'ยอด REPO': item.total_repo,
        'ยอดตบเด้ง': item.total_tap_deng,
        'วันที่รายงาน': item.report_date,
      }));

      // สร้าง worksheet และ workbook
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Performance Report');

      // Export ไฟล์ Excel
      XLSX.writeFile(workbook, `Performance_Report_${format(date, 'yyyy-MM-dd')}.xlsx`);

      toast({
        title: "ดาวน์โหลดรายงานเป็น Excel สำเร็จ",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออกข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} ล้าน`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString('th-TH');
  };

  const renderTeamProgress = (team: PerformanceReport) => {
    const completed = team.total_completed;
    const total = team.total_assigned;
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

  const getFilteredStats = (viewType: "6090" | "npl" | "all") => {
    if (viewType === "all") {
      return {
        assigned: realStats.total,
        completed: realStats.completed,
        remaining: realStats.total - realStats.completed,
        percent: realStats.completionRate,
      };
    } else if (viewType === "6090") {
      return {
        assigned: totalStats.totalAssigned6090,
        completed: totalStats.totalCompleted6090,
        remaining: totalStats.totalRemaining6090,
        percent: totalStats.totalAssigned6090 > 0 ? 
          Math.round((totalStats.totalCompleted6090 / totalStats.totalAssigned6090) * 100) : 0,
      };
    } else {
      return {
        assigned: totalStats.totalAssignedNPL,
        completed: totalStats.totalCompletedNPL,
        remaining: totalStats.totalRemainingNPL,
        percent: totalStats.totalAssignedNPL > 0 ? 
          Math.round((totalStats.totalCompletedNPL / totalStats.totalAssignedNPL) * 100) : 0,
      };
    }
  };

  const teamPerformance = useMemo(() => {
    const teamData: Record<string, {
      total6090: number;
      totalNPL: number;
      completed6090: number;
      completedNPL: number;
      cured: number;
      dr: number;
      repo: number;
      tapDeng: number;
    }> = {};

    performanceData.forEach(item => {
      if (!teamData[item.team]) {
        teamData[item.team] = {
          total6090: 0,
          totalNPL: 0,
          completed6090: 0,
          completedNPL: 0,
          cured: 0,
          dr: 0,
          repo: 0,
          tapDeng: 0,
        };
      }

      if (item.work_group === "6090") {
        teamData[item.team].total6090 += item.total_assigned;
        teamData[item.team].completed6090 += item.total_completed;
      } else if (item.work_group === "NPL") {
        teamData[item.team].totalNPL += item.total_assigned;
        teamData[item.team].completedNPL += item.total_completed;
      }

      teamData[item.team].cured += item.total_cured;
      teamData[item.team].dr += item.total_dr;
      teamData[item.team].repo += item.total_repo;
      teamData[item.team].tapDeng += item.total_tap_deng;
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
      tapDeng: data.tapDeng,
    }));
  }, [performanceData]);

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
              {realStats.total}
            </p>
            <p className="text-xs text-gray-400">เป้าหมาย {realStats.total + 20} ราย</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 card-shadow">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">จบงานแล้ว</p>
            <p className="text-xl font-bold">
              {realStats.completed}
            </p>
            <p className="text-xs text-green-500 font-medium">
              {realStats.completionRate}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-tedtam-orange card-shadow">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">Principle</p>
            <p className="text-xl font-bold">
              {formatNumber(realStats.totalAmount)}
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
              {formatNumber(realStats.commission)}
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
        </TabsList>
        
        <TabsContent value="summary">
          <Card className="card-shadow mb-3">
            <CardContent className="p-3">
              <h3 className="font-medium mb-2 text-sm">ความคืบหน้า</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CURED</span>
                    <span>{realStats.curedPercent}%</span>
                  </div>
                  <Progress value={realStats.curedPercent} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>DR</span>
                    <span>{realStats.drPercent}%</span>
                  </div>
                  <Progress value={realStats.drPercent} className="h-2 bg-secondary [&>div]:bg-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>REPO</span>
                    <span>{realStats.repoPercent}%</span>
                  </div>
                  <Progress value={realStats.repoPercent} className="h-2 bg-secondary [&>div]:bg-red-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ตบเด้ง</span>
                    <span>{realStats.tapDengPercent}%</span>
                  </div>
                  <Progress value={realStats.tapDengPercent} className="h-2 bg-secondary [&>div]:bg-purple-500" />
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
            {teamPerformance.map((item, index) => (
              <Card key={index} className="card-shadow">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Badge className={`${index % 2 === 0 ? 'bg-tedtam-blue' : 'bg-tedtam-orange'} mr-2`}>
                        {item.team.charAt(0)}
                      </Badge>
                      <h3 className="font-medium text-sm">ทีม {item.team}</h3>
                    </div>
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
                        <span>ความคืบหน้า ({item.totalCompleted}/{item.total})</span>
                        <span>{item.percentComplete}%</span>
                      </div>
                      <Progress value={item.percentComplete} className="h-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-500">CURED</p>
                      <p className="font-medium">{formatNumber(item.cured)}</p>
                      <Progress value={Math.min(item.cured / 50000, 100)} className="h-1 mt-1" />
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-500">DR</p>
                      <p className="font-medium">{formatNumber(item.dr)}</p>
                      <Progress 
                        value={Math.min(item.dr / 10000, 100)} 
                        className="h-1 mt-1 [&>div]:bg-blue-500" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-500">REPO</p>
                      <p className="font-medium">{formatNumber(item.repo)}</p>
                      <Progress 
                        value={Math.min(Math.abs(item.repo) / 10000, 100)} 
                        className="h-1 mt-1 [&>div]:bg-red-500" 
                      />
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-500">ตบเด้ง</p>
                      <p className="font-medium">{formatNumber(item.tapDeng)}</p>
                      <Progress 
                        value={Math.min(Math.abs(item.tapDeng) / 10000, 100)} 
                        className="h-1 mt-1 [&>div]:bg-purple-500" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    {filteredPerformanceData.map((team, index) => {
                      let assigned = 0;
                      let completed = 0;
                      let remaining = 0;
                      let percentage = 0;
                      
                      if (detailView === "all" || detailView === "6090") {
                        assigned += team.total_assigned;
                        completed += team.total_completed;
                        remaining += (team.total_assigned - team.total_completed);
                      }
                      
                      if (detailView === "all" || detailView === "npl") {
                        assigned += team.total_assigned;
                        completed += team.total_completed;
                        remaining += (team.total_assigned - team.total_completed);
                      }
                      
                      percentage = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{team.team}</TableCell>
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