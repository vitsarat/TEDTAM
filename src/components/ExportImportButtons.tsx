import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download, Upload, Printer, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Customer } from "@/types/customer";
import { customerService } from "@/services/customerService";
import { useAuth } from "@/contexts/AuthContext";

interface ExportImportButtonsProps {
  customers: Customer[];
  onImport?: () => void;
  onPrint?: () => void;
  hideImport?: boolean;
}

const ExportImportButtons: React.FC<ExportImportButtonsProps> = ({
  customers,
  onImport,
  onPrint,
  hideImport = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Export customers to Excel
  const handleExport = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    // Prepare data for export (removing internal fields if needed)
    const dataToExport = customers.map((customer) => {
      // Create a copy to avoid mutating the original
      const exportCustomer = { ...customer };
      return exportCustomer;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = { Sheets: { Customers: ws }, SheetNames: ["Customers"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, `TEDTAM_Customers_${new Date().toISOString().split("T")[0]}${fileExtension}`);

    toast({
      title: "ส่งออกข้อมูลสำเร็จ",
      description: `ส่งออกข้อมูลลูกค้าทั้งหมด ${customers.length} รายการ`,
    });
  };

  // Import customers from Excel
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if user is admin
    if (!isAdmin) {
      toast({
        title: "ไม่มีสิทธิ์เข้าถึง",
        description: "คุณไม่มีสิทธิ์นำเข้าข้อมูล กรุณาติดต่อผู้ดูแลระบบ",
        variant: "destructive"
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target?.result, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Process imported data
        const importData: Record<string, any> = {};
        let duplicateCount = 0;
        
        // Group by accountNumber and keep only the latest entries
        // (assuming all records in the Excel file are from the latest update)
        data.forEach((item: any) => {
          if (item.name && item.accountNumber) {
            // If this account number already exists in our import data, it's a duplicate
            if (importData[item.accountNumber]) {
              duplicateCount++;
            }
            
            // Always keep the latest record (last one encountered)
            importData[item.accountNumber] = item;
          }
        });
        
        // Process the deduplicated data
        let importCount = 0;
        let updatedCount = 0;
        let addedCount = 0;
        
        Object.values(importData).forEach((item: any) => {
          // Check if customer with this account number already exists in the database
          const existingCustomer = customerService.getCustomers().find(
            (c) => c.accountNumber === item.accountNumber
          );

          if (existingCustomer) {
            // Update existing customer
            customerService.updateCustomer(existingCustomer.id, item);
            updatedCount++;
          } else {
            // Add new customer
            customerService.addCustomer(item as Omit<Customer, "id">);
            addedCount++;
          }
          importCount++;
        });

        if (onImport) onImport();
        
        toast({
          title: "นำเข้าข้อมูลสำเร็จ",
          description: `นำเข้าข้อมูลลูกค้า ${importCount} รายการ (อัพเดต ${updatedCount}, เพิ่มใหม่ ${addedCount})` +
                      (duplicateCount > 0 ? ` พบข้อมูลซ้ำ ${duplicateCount} รายการ ใช้ข้อมูลล่าสุดเท่านั้น` : ""),
        });

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Error importing file:", error);
        toast({
          title: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล",
          description: "โปรดตรวจสอบรูปแบบไฟล์ Excel",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "เกิดข้อผิดพลาดในการอ่านไฟล์",
        variant: "destructive",
      });
    };

    reader.readAsBinaryString(file);
  };

  // Print customer list
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Default print functionality
      window.print();
    }
    
    toast({
      title: "กำลังพิมพ์รายการลูกค้า",
      description: `จำนวน ${customers.length} รายการ`,
    });
  };

  // Disable import features for non-admin users
  const importDisabled = !isAdmin;

  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center text-xs"
        onClick={handleExport}
      >
        <Download className="h-3.5 w-3.5 mr-1" />
        <span>ส่งออก Excel</span>
      </Button>
      
      {!hideImport && (
        <>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center text-xs ${importDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => isAdmin && fileInputRef.current?.click()}
            disabled={importDisabled}
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            <span>นำเข้า Excel {!isAdmin && '(เฉพาะผู้ดูแลระบบ)'}</span>
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx,.xls"
            className="hidden"
            disabled={importDisabled}
          />
          <Button
            variant="outline" 
            size="sm"
            className="flex items-center text-xs bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:text-green-700 dark:bg-gray-800 dark:border-gray-700"
            onClick={() => isAdmin && fileInputRef.current?.click()}
            disabled={importDisabled}
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            <span>ตัวอย่างไฟล์ Excel</span>
          </Button>
        </>
      )}
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center text-xs"
        onClick={handlePrint}
      >
        <Printer className="h-3.5 w-3.5 mr-1" />
        <span>พิมพ์รายการ</span>
      </Button>
    </div>
  );
};

export default ExportImportButtons;
