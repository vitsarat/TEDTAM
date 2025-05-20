
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Download, 
  ChevronDown, 
  Filter, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  BadgeDollarSign,
  Coins
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customerService } from "@/services/customerService";
import { toast } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";

// Define transaction interfaces
interface Transaction {
  id: number;
  date: string;
  customer: string;
  amount: number;
  status: string;
}

const WalletPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  
  // Use React Query to fetch data from the customer service
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });
  
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', selectedPeriod, selectedTeam],
    queryFn: (): Transaction[] => {
      // This would normally fetch from an API based on filters
      // For now we're using static data as a placeholder
      console.log(`Fetching transactions with period: ${selectedPeriod} and team: ${selectedTeam}`);
      return [
        { id: 1, date: "05/05/2025", customer: "สมชาย ใจดี", amount: 5000, status: "สำเร็จ" },
        { id: 2, date: "10/05/2025", customer: "สมหญิง จริงใจ", amount: 10000, status: "สำเร็จ" },
        { id: 3, date: "15/05/2025", customer: "Somsak Rakdee", amount: 7500, status: "สำเร็จ" },
        { id: 4, date: "20/05/2025", customer: "Somjai Dee Mak", amount: 12500, status: "รอดำเนินการ" },
        { id: 5, date: "25/05/2025", customer: "สมนึก ใจมั่น", amount: 6000, status: "รอดำเนินการ" },
      ].filter(t => {
        // Apply filtering based on selected options
        if (selectedTeam !== "all" && Math.random() > 0.7) return false;  // Simulate team filtering
        if (selectedPeriod === "today" && Math.random() > 0.3) return false; // Simulate date filtering
        return true;
      });
    },
  });
  
  // Calculate the total commission based on actual customer data
  const totalCommission = customers.reduce((acc, customer) => acc + customer.commission, 0);
  
  // Calculate stats based on the fetched transactions
  const successfulTransactions = transactions.filter(t => t.status === "สำเร็จ");
  const successAmount = successfulTransactions.reduce((acc, t) => acc + t.amount, 0);
  const pendingAmount = transactions.filter(t => t.status === "รอดำเนินการ").reduce((acc, t) => acc + t.amount, 0);

  // Handle downloading transactions
  const handleDownload = () => {
    console.log("Downloading transactions as Excel");
    toast.success("ดาวน์โหลดรายการธุรกรรมเป็น Excel สำเร็จ");
  };

  // Handle period selection change
  const handlePeriodChange = (value: string) => {
    console.log(`Period changed to: ${value}`);
    setSelectedPeriod(value);
    toast.success(`แสดงข้อมูลสำหรับ: ${
      value === "today" ? "วันนี้" : 
      value === "week" ? "สัปดาห์นี้" : 
      value === "month" ? "เดือนนี้" : "ปีนี้"
    }`);
  };

  // Handle team selection change
  const handleTeamChange = (value: string) => {
    console.log(`Team changed to: ${value}`);
    setSelectedTeam(value);
    toast.success(`แสดงข้อมูลสำหรับทีม: ${value === "all" ? "ทั้งหมด" : value}`);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    console.log(`Tab changed to: ${value}`);
  };

  // Handle viewing all transactions
  const handleViewAll = () => {
    console.log("Viewing all transactions");
    toast.info("กำลังโหลดรายการธุรกรรมทั้งหมด");
  };

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-tedtam-blue">กระเป๋าเงิน</h1>
          <p className="text-gray-600 text-sm">{new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleDownload}
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Card */}
      <Card className="tedtam-gradient text-white mb-6 card-shadow">
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <Wallet className="h-6 w-6" />
              </div>
              <p className="text-sm opacity-80">ยอดรวมคอมมิชชัน</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white text-xs opacity-80 hover:bg-white/10 hover:text-white"
              onClick={() => {
                console.log("Viewing commission details");
                toast.info("กำลังโหลดรายละเอียดคอมมิชชัน");
              }}
            >
              รายละเอียด
            </Button>
          </div>
          <h2 className="text-3xl font-bold mb-1">{totalCommission.toLocaleString()} บาท</h2>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>เพิ่มขึ้น 12% จากเดือนที่แล้ว</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center">
                <div className="bg-white/10 rounded-full p-1 mr-2">
                  <Coins className="h-4 w-4" />
                </div>
                <p className="text-xs opacity-80 mb-1">งานที่จบแล้ว</p>
              </div>
              <p className="text-xl font-bold">{successfulTransactions.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center">
                <div className="bg-white/10 rounded-full p-1 mr-2">
                  <BadgeDollarSign className="h-4 w-4" />
                </div>
                <p className="text-xs opacity-80 mb-1">รออนุมัติ</p>
              </div>
              <p className="text-xl font-bold">{transactions.length - successfulTransactions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
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

        <Select value={selectedTeam} onValueChange={handleTeamChange}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <span className="truncate">
              {selectedTeam === "all" ? "ทีม: ทั้งหมด" : 
               selectedTeam === "teamA" ? "ทีม: ทีม A" : 
               "ทีม: ทีม B"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทีม: ทั้งหมด</SelectItem>
            <SelectItem value="teamA">ทีม: ทีม A</SelectItem>
            <SelectItem value="teamB">ทีม: ทีม B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="card-shadow">
          <CardContent className="p-3">
            <div className="flex items-center mb-1">
              <div className="bg-green-100 rounded-full p-1 mr-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm text-gray-500">รับแล้ว</p>
            </div>
            <p className="text-xl font-bold text-green-600">{successAmount.toLocaleString()} บาท</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="p-3">
            <div className="flex items-center mb-1">
              <div className="bg-amber-100 rounded-full p-1 mr-2">
                <TrendingDown className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-sm text-gray-500">รออนุมัติ</p>
            </div>
            <p className="text-xl font-bold text-amber-600">{pendingAmount.toLocaleString()} บาท</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-tedtam-blue">รายการธุรกรรม</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-tedtam-orange flex items-center"
            onClick={handleViewAll}
          >
            ดูทั้งหมด
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </div>
        
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="success" className="flex-1">สำเร็จ</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">รอดำเนินการ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Card className="card-shadow">
              <CardContent className="p-0">
                {isLoadingTransactions ? (
                  <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
                ) : (
                  <div className="divide-y">
                    {transactions.map(transaction => (
                      <div key={transaction.id} className="p-3">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{transaction.customer}</p>
                          <p className="font-bold text-tedtam-blue">{transaction.amount.toLocaleString()} บาท</p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            transaction.status === "สำเร็จ" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="success">
            <Card className="card-shadow">
              <CardContent className="p-0">
                {isLoadingTransactions ? (
                  <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
                ) : (
                  <div className="divide-y">
                    {transactions
                      .filter(t => t.status === "สำเร็จ")
                      .map(transaction => (
                        <div key={transaction.id} className="p-3">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{transaction.customer}</p>
                            <p className="font-bold text-tedtam-blue">{transaction.amount.toLocaleString()} บาท</p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">{transaction.date}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending">
            <Card className="card-shadow">
              <CardContent className="p-0">
                {isLoadingTransactions ? (
                  <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
                ) : (
                  <div className="divide-y">
                    {transactions
                      .filter(t => t.status === "รอดำเนินการ")
                      .map(transaction => (
                        <div key={transaction.id} className="p-3">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{transaction.customer}</p>
                            <p className="font-bold text-tedtam-blue">{transaction.amount.toLocaleString()} บาท</p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">{transaction.date}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalletPage;
