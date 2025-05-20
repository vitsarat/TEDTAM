
import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreHorizontal, 
  Phone, 
  MapPin, 
  FileText,
  ArrowUp,
  ArrowDown,
  MessageCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { customerService } from "@/services/customerService";
import { Customer, CustomerFilter } from "@/types/customer";
import { Link, useNavigate } from "react-router-dom";
import ExportImportButtons from "@/components/ExportImportButtons";

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<CustomerFilter>({
    searchTerm: "",
    workGroup: [],
    branch: [],
    status: [],
    cycleDay: [],
    resus: [],
    team: [] // Added team filter array
  });
  const [sortField, setSortField] = useState<keyof Customer | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [scrollPosition, setScrollPosition] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const allCustomers = customerService.getCustomers();
    setCustomers(allCustomers);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value) {
      setCustomers(customerService.getCustomers());
    } else {
      const filtered = customerService.filterCustomers({ searchTerm: value });
      setCustomers(filtered);
    }
  };

  // Handle filter changes
  const toggleFilter = (filterType: keyof CustomerFilter, value: string) => {
    setFilters(prev => {
      const currentFilter = prev[filterType] as string[];
      
      if (currentFilter.includes(value)) {
        return {
          ...prev,
          [filterType]: currentFilter.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [filterType]: [...currentFilter, value]
        };
      }
    });
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = customerService.getCustomers();
    
    // Apply each filter
    if (filters.searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        customer.accountNumber.includes(filters.searchTerm) ||
        customer.hubCode.includes(filters.searchTerm)
      );
    }
    
    if (filters.workGroup.length > 0) {
      filtered = filtered.filter(customer => 
        filters.workGroup.includes(customer.workGroup)
      );
    }

    if (filters.branch.length > 0) {
      filtered = filtered.filter(customer => 
        filters.branch.includes(customer.branch)
      );
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(customer => 
        filters.status.includes(customer.status)
      );
    }

    if (filters.cycleDay.length > 0) {
      filtered = filtered.filter(customer => 
        filters.cycleDay.includes(customer.cycleDay)
      );
    }

    if (filters.resus.length > 0) {
      filtered = filtered.filter(customer => 
        filters.resus.includes(customer.resus)
      );
    }
    
    // Apply team filter
    if (filters.team.length > 0) {
      filtered = filtered.filter(customer => 
        filters.team.includes(customer.team)
      );
    }

    setCustomers(filtered);
    setIsFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      workGroup: [],
      branch: [],
      status: [],
      cycleDay: [],
      resus: [],
      team: []
    });
    setCustomers(customerService.getCustomers());
    setIsFilterOpen(false);
  };

  // Handle sorting
  const handleSort = (field: keyof Customer) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortField(field);
    setSortDirection(isAsc ? "desc" : "asc");
    
    const sortedCustomers = [...customers].sort((a, b) => {
      if (a[field] < b[field]) return isAsc ? 1 : -1;
      if (a[field] > b[field]) return isAsc ? -1 : 1;
      return 0;
    });
    
    setCustomers(sortedCustomers);
  };

  // Track scroll position for sticky header
  const handleScroll = () => {
    if (listRef.current) {
      setScrollPosition(listRef.current.scrollTop);
    }
  };

  // Handle printing
  const handlePrintList = () => {
    window.print();
  };

  // Get appropriate badge color for status
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case "จบ": return "bg-green-500 text-white";
      case "ไม่จบ": return "bg-amber-500 text-white";
      default: return "bg-gray-200 text-gray-700";
    }
  };

  // Get appropriate badge color for resus
  const getResusBadgeColor = (resus: string) => {
    switch(resus) {
      case "CURED": return "bg-green-500 text-white";
      case "DR": return "bg-blue-500 text-white";
      case "REPO": return "bg-red-500 text-white";
      case "ตบเด้ง": return "bg-purple-500 text-white";
      default: return "bg-gray-200 text-gray-700";
    }
  };

  // Get unique team values for filtering
  const getUniqueTeams = () => {
    const allCustomers = customerService.getCustomers();
    const teams = allCustomers.map(customer => customer.team);
    return Array.from(new Set(teams)).filter(team => team); // Filter out empty team values
  };

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-tedtam-blue dark:text-blue-300">รายการลูกค้า</h1>
        <Button 
          onClick={() => navigate('/customer/add')}
          className="bg-tedtam-orange hover:bg-tedtam-orange/90 dark:bg-amber-600 flex items-center"
          size="sm"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          <span>เพิ่ม</span>
        </Button>
      </div>

      {/* Export/Import buttons */}
      <div className="mb-4">
        <ExportImportButtons 
          customers={customers}
          onImport={loadCustomers}
          onPrint={handlePrintList}
        />
      </div>

      {/* Search and Filter */}
      <div className="flex mb-4 gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="ค้นหา ชื่อ, เลขที่สัญญา, Hub Code"
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative dark:bg-gray-800 dark:border-gray-700">
              <Filter className="h-4 w-4" />
              {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : !!f) && (
                <span className="absolute -top-1 -right-1 bg-tedtam-orange text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                  {Object.values(filters).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : val ? 1 : 0), 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="font-medium mb-2 dark:text-white">ตัวกรอง</h3>
            <Separator className="mb-3 dark:bg-gray-700" />
            
            {/* Filter groups */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1 dark:text-gray-200">กลุ่มงาน</h4>
                <div className="flex flex-wrap gap-2">
                  {["6090", "NPL"].map(group => (
                    <Badge 
                      key={group}
                      variant={filters.workGroup.includes(group) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("workGroup", group)}
                    >
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 dark:text-gray-200">สาขา</h4>
                <div className="flex flex-wrap gap-2">
                  {["สาขาสุขุมวิท", "สาขาสยาม", "สาขาบางนา"].map(branch => (
                    <Badge 
                      key={branch}
                      variant={filters.branch.includes(branch) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("branch", branch)}
                    >
                      {branch}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 dark:text-gray-200">สถานะ</h4>
                <div className="flex flex-wrap gap-2">
                  {["จบ", "ไม่จบ"].map(status => (
                    <Badge 
                      key={status}
                      variant={filters.status.includes(status) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("status", status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 dark:text-gray-200">Cycle Day</h4>
                <div className="flex flex-wrap gap-2">
                  {["10", "15"].map(cycleDay => (
                    <Badge 
                      key={cycleDay}
                      variant={filters.cycleDay.includes(cycleDay) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("cycleDay", cycleDay)}
                    >
                      {cycleDay}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 dark:text-gray-200">Resus</h4>
                <div className="flex flex-wrap gap-2">
                  {["CURED", "DR", "REPO", "ตบเด้ง"].map(resus => (
                    <Badge 
                      key={resus}
                      variant={filters.resus.includes(resus) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("resus", resus)}
                    >
                      {resus}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Added Team filter */}
              <div>
                <h4 className="text-sm font-medium mb-1 dark:text-gray-200">ทีม</h4>
                <div className="flex flex-wrap gap-2">
                  {getUniqueTeams().map(team => (
                    <Badge 
                      key={team}
                      variant={filters.team.includes(team) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("team", team)}
                    >
                      {team}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                size="sm"
                className="dark:border-gray-600 dark:text-white"
              >
                รีเซ็ต
              </Button>
              <Button 
                onClick={applyFilters}
                className="bg-tedtam-blue hover:bg-tedtam-blue/90 dark:bg-blue-700"
                size="sm"
              >
                นำไปใช้
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Sort controls */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
        {[
          { field: 'principle' as keyof Customer, label: 'Principle' },
          { field: 'status' as keyof Customer, label: 'สถานะ' },
          { field: 'branch' as keyof Customer, label: 'สาขา' },
          { field: 'resus' as keyof Customer, label: 'Resus' },
          { field: 'team' as keyof Customer, label: 'ทีม' }, // Added team sort option
        ].map(item => (
          <Button 
            key={item.field}
            variant="outline"
            size="sm"
            className={`px-3 py-1 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white ${sortField === item.field ? 'border-tedtam-blue text-tedtam-blue dark:border-blue-500 dark:text-blue-400' : ''}`}
            onClick={() => handleSort(item.field)}
          >
            {item.label}
            {sortField === item.field && (
              sortDirection === "asc" ? 
                <ArrowUp className="ml-1 h-3 w-3" /> : 
                <ArrowDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        ))}
      </div>

      {/* Customer List */}
      <div 
        ref={listRef}
        className="overflow-y-auto max-h-[calc(100vh-330px)]"
        onScroll={handleScroll}
      >
        {/* Sticky header with count */}
        <div className={`sticky top-0 bg-white dark:bg-gray-900 z-10 py-2 ${scrollPosition > 0 ? 'shadow-sm dark:shadow-gray-800' : ''}`}>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">ทั้งหมด {customers.length} ราย</p>
            <Button variant="ghost" className="h-6 p-0 dark:text-tedtam-orange">
              <span className="text-xs text-tedtam-orange">จัดเรียง</span>
            </Button>
          </div>
        </div>

        {/* Customer cards */}
        <div className="space-y-3">
          {customers.map(customer => (
            <Link to={`/customer/${customer.id}`} key={customer.id}>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 card-shadow transition-transform active:scale-98 hover:border-tedtam-blue dark:hover:border-blue-500">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium dark:text-white">{customer.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {customer.accountNumber} 
                      <span className="mx-1">•</span> 
                      {customer.branch}
                    </p>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 dark:text-white">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-0 dark:bg-gray-800 dark:border-gray-700">
                      <div className="p-1">
                        <Button variant="ghost" className="w-full justify-start text-sm h-9 dark:text-white">
                          <Phone className="mr-2 h-4 w-4" />
                          <span>โทร</span>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm h-9 dark:text-white">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>นำทาง</span>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm h-9 dark:text-white">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>รายงาน</span>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm">
                    <span className="font-medium dark:text-white">{customer.principle.toLocaleString()} บาท</span>
                    <div className="flex gap-2 mt-1">
                      <Badge className={getStatusBadgeColor(customer.status)}>
                        {customer.status}
                      </Badge>
                      <Badge className={getResusBadgeColor(customer.resus)}>
                        {customer.resus}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                    {customer.workGroup}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}

          {customers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-3">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">ไม่พบข้อมูลลูกค้า</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ลองเปลี่ยนคำค้นหาหรือตัวกรองแล้วลองอีกครั้ง
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <Button 
        className="fixed right-4 bottom-20 rounded-full w-14 h-14 bg-tedtam-orange hover:bg-tedtam-orange/90 dark:bg-amber-600 shadow-lg flex items-center justify-center animate-pulse-soft"
        size="icon"
        onClick={() => navigate('/customer/add')}
      >
        <UserPlus className="h-6 w-6" />
      </Button>
      
      <Button 
        className="fixed right-4 bottom-36 rounded-full w-12 h-12 bg-tedtam-blue hover:bg-tedtam-blue/90 dark:bg-blue-700 shadow-lg flex items-center justify-center z-20"
        size="icon"
        onClick={() => navigate('/chat')}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default CustomerList;
