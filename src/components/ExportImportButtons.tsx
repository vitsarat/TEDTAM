import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download, Upload, Printer, FileText } from "lucide-react";
import ExcelJS from "exceljs";
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
  const handleExport = async () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    // Prepare data for export (removing internal fields if needed)
    const dataToExport = customers.map((customer) => {
      // Create a copy to avoid mutating the original
      const exportCustomer = { ...customer };
      return exportCustomer;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customers');

    // Add headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Account Number', key: 'accountnumber', width: 20 },
      { header: 'Principle', key: 'principle', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Group Code', key: 'groupcode', width: 15 },
      { header: 'Branch', key: 'branch', width: 20 },
      { header: 'Brand', key: 'brand', width: 15 },
      { header: 'Model', key: 'model', width: 15 },
      { header: 'License Plate', key: 'licenseplate', width: 15 },
    ];

    // Add data rows
    dataToExport.forEach(customer => worksheet.addRow(customer));

    const buffer = await workbook.xlsx.writeBuffer();
    const data = new Blob([buffer], { type: fileType });
    saveAs(data, `TEDTAM_Customers_${new Date().toISOString().split("T")[0]}${fileExtension}`);

    toast({
      title: "ส่งออกข้อมูลสำเร็จ",
      description: `ส่งออกข้อมูลลูกค้าทั้งหมด ${customers.length} รายการ`,
    });
  };

  // Import customers from Excel
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const workbook = new ExcelJS.Workbook();
    try {
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet('Customers');

      const importData: Record<string, any> = {};
      let duplicateCount = 0;

      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const item: any = {};
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = worksheet.getRow(1).getCell(colNumber).text.toLowerCase();
            item[header] = cell.value;
          });

          if (item.name && item.accountnumber) {
            if (importData[item.accountnumber]) {
              duplicateCount++;
            }
            importData[item.accountnumber] = item;
          }
        }
      });

      let importCount = 0;
      let updatedCount = 0;
      let addedCount = 0;

      for (const item of Object.values(importData)) {
        const existingCustomer = customerService.getCustomers().find(
          (c) => c.accountnumber === item.accountnumber
        );

        if (existingCustomer) {
          customerService.updateCustomer(existingCustomer.id, item);
          updatedCount++;
        } else {
          customerService.addCustomer(item as Omit<Customer, "id">);
          addedCount++;
        }
        importCount++;
      }

      if (onImport) onImport();

      toast({
        title: "นำเข้าข้อมูลสำเร็จ",
        description: `นำเข้าข้อมูลลูกค้า ${importCount} รายการ (อัพเดต ${updatedCount}, เพิ่มใหม่ ${addedCount})` +
                    (duplicateCount > 0 ? ` พบข้อมูลซ้ำ ${duplicateCount} รายการ ใช้ข้อมูลล่าสุดเท่านั้น` : ""),
      });

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

  // Print customer list
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
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