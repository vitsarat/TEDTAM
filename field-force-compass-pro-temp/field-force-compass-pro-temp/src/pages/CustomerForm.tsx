
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  ChevronRight, 
  Camera, 
  Mic, 
  MapPin,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customerService } from "@/services/customerService";
import { CustomerFormData } from "@/types/customer";

const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Find existing customer if editing
  const existingCustomer = isEditing ? customerService.getCustomerById(id) : null;
  
  const [formData, setFormData] = useState<CustomerFormData>({
    name: existingCustomer?.name || "",
    accountNumber: existingCustomer?.accountNumber || "",
    groupCode: existingCustomer?.groupCode || "G1",
    branch: existingCustomer?.branch || "สาขาสุขุมวิท",
    principle: existingCustomer?.principle || 0,
    status: existingCustomer?.status || "ไม่จบ",
    brand: existingCustomer?.brand || "",
    model: existingCustomer?.model || "",
    licensePlate: existingCustomer?.licensePlate || "",
    resus: existingCustomer?.resus || "CURED",
    authorizationDate: existingCustomer?.authorizationDate || "",
    commission: existingCustomer?.commission || 0,
    registrationId: existingCustomer?.registrationId || "",
    workGroup: existingCustomer?.workGroup || "6090",
    fieldTeam: existingCustomer?.fieldTeam || "ทีม A",
    installment: existingCustomer?.installment || 0,
    initialBucket: existingCustomer?.initialBucket || "B1",
    currentBucket: existingCustomer?.currentBucket || "B1",
    cycleDay: existingCustomer?.cycleDay || "15",
    engineNumber: existingCustomer?.engineNumber || "",
    blueBookPrice: existingCustomer?.blueBookPrice || 0,
    address: existingCustomer?.address || "",
    latitude: existingCustomer?.latitude || 13.7563,
    longitude: existingCustomer?.longitude || 100.5018,
    hubCode: existingCustomer?.hubCode || "BKK01",
    workStatus: existingCustomer?.workStatus || "ลงพื้นที่",
    lastVisitResult: existingCustomer?.lastVisitResult || "",
    team: existingCustomer?.team || "ทีม A",
    phoneNumbers: [""]
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "principle" || name === "commission" || name === "installment" || name === "blueBookPrice"
        ? parseFloat(value) || 0
        : value,
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && existingCustomer) {
        // Update existing customer
        customerService.updateCustomer(existingCustomer.id, formData);
        toast({
          title: "อัพเดทข้อมูลสำเร็จ",
          description: `อัพเดทข้อมูลของ ${formData.name} เรียบร้อยแล้ว`,
        });
      } else {
        // Add new customer
        customerService.addCustomer(formData);
        toast({
          title: "เพิ่มข้อมูลสำเร็จ",
          description: `เพิ่มข้อมูลของ ${formData.name} เรียบร้อยแล้ว`,
        });
      }
      
      // Navigate back to customer list
      navigate('/customers');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้ โปรดลองอีกครั้ง",
      });
    }
  };

  // Handle next step
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/customers');
    }
  };

  // Handle scan QR code
  const handleScanQR = () => {
    toast({
      title: "กำลังเปิดสแกนเนอร์",
      description: "เตรียมสแกน QR Code เพื่อดึงข้อมูล",
    });
  };

  // Handle take photo
  const handleTakePhoto = () => {
    toast({
      title: "กำลังเปิดกล้อง",
      description: "เตรียมถ่ายภาพเอกสาร",
    });
  };

  // Handle voice record
  const handleVoiceRecord = () => {
    toast({
      title: "กำลังเปิดไมโครโฟน",
      description: "เริ่มบันทึกเสียงเพื่อแปลงเป็นข้อความ",
    });
  };

  // Handle location pick
  const handlePickLocation = () => {
    toast({
      title: "กำลังเปิดแผนที่",
      description: "เลือกตำแหน่งที่ตั้งของลูกค้า",
    });
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="tedtam-gradient text-white p-4 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10 absolute left-2 top-2"
          onClick={goToPrevStep}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="pt-6 pb-3">
          <h1 className="text-xl font-bold mt-2">
            {isEditing ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มข้อมูลลูกค้า"}
          </h1>
          <div className="text-sm mt-1 opacity-90">
            ขั้นตอนที่ {currentStep} จาก {totalSteps}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-between px-8 pt-4 pb-2">
        {[...Array(totalSteps)].map((_, i) => (
          <div 
            key={i} 
            className={`flex items-center justify-center rounded-full w-8 h-8 text-xs font-bold
              ${currentStep > i 
                ? "bg-tedtam-orange text-white" 
                : currentStep === i + 1 
                  ? "border-2 border-tedtam-orange text-tedtam-orange" 
                  : "bg-gray-200 text-gray-500"}`
              }
          >
            {currentStep > i ? "✓" : i + 1}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-tedtam-blue mb-4">ข้อมูลพื้นฐาน</h2>
            
            <div>
              <Label htmlFor="name">ชื่อลูกค้า</Label>
              <Input
                id="name"
                name="name"
                placeholder="ชื่อ-นามสกุล"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="accountNumber">เลขที่สัญญา</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  placeholder="เลขที่สัญญา"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div className="shrink-0">
                <Label className="opacity-0">scan</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleScanQR}
                  className="h-10 mt-1"
                >
                  <QrCode className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="principle">Principle (บาท)</Label>
              <Input
                id="principle"
                name="principle"
                type="number"
                placeholder="0.00"
                value={formData.principle}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>สถานะ</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="จบ">จบ</SelectItem>
                    <SelectItem value="ไม่จบ">ไม่จบ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>RESUS</Label>
                <Select 
                  value={formData.resus} 
                  onValueChange={(value: "CURED" | "DR" | "REPO" | "ตบเด้ง") => handleSelectChange("resus", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="เลือก RESUS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CURED">CURED</SelectItem>
                    <SelectItem value="DR">DR</SelectItem>
                    <SelectItem value="REPO">REPO</SelectItem>
                    <SelectItem value="ตบเด้ง">ตบเด้ง</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>กลุ่มงาน</Label>
                <Select 
                  value={formData.workGroup} 
                  onValueChange={(value: "6090" | "NPL") => handleSelectChange("workGroup", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="เลือกกลุ่มงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6090">6090</SelectItem>
                    <SelectItem value="NPL">NPL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>สาขา</Label>
                <Select 
                  value={formData.branch} 
                  onValueChange={(value) => handleSelectChange("branch", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="เลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="สาขาสุขุมวิท">สาขาสุขุมวิท</SelectItem>
                    <SelectItem value="สาขาสยาม">สาขาสยาม</SelectItem>
                    <SelectItem value="สาขาบางนา">สาขาบางนา</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Address */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-tedtam-blue mb-4">ที่อยู่</h2>
            
            <div>
              <Label htmlFor="address">ที่อยู่</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="address"
                  name="address"
                  placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                  value={formData.address}
                  onChange={handleChange}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleVoiceRecord}
                  className="h-10"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <Label>พิกัด</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">ละติจูด</span>
                    <span>{formData.latitude.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ลองจิจูด</span>
                    <span>{formData.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <Label className="opacity-0">map</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePickLocation}
                  className="h-10 mt-1"
                >
                  <MapPin className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="hubCode">Hub Code</Label>
              <Input
                id="hubCode"
                name="hubCode"
                placeholder="รหัส Hub"
                value={formData.hubCode}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
        )}
        
        {/* Step 3: Vehicle */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-tedtam-blue mb-4">ข้อมูลยานพาหนะ</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="brand">ยี่ห้อ</Label>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="ยี่ห้อรถ"
                  value={formData.brand}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="model">รุ่น</Label>
                <Input
                  id="model"
                  name="model"
                  placeholder="รุ่นรถ"
                  value={formData.model}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <Label htmlFor="licensePlate">ทะเบียนรถ</Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  placeholder="ป้ายทะเบียน"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div className="shrink-0">
                <Label className="opacity-0">camera</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleTakePhoto}
                  className="h-10 mt-1"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="engineNumber">เลขเครื่องยนต์</Label>
              <Input
                id="engineNumber"
                name="engineNumber"
                placeholder="เลขเครื่องยนต์"
                value={formData.engineNumber}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="blueBookPrice">ราคาตามบลูบุ๊ค (บาท)</Label>
              <Input
                id="blueBookPrice"
                name="blueBookPrice"
                type="number"
                placeholder="0.00"
                value={formData.blueBookPrice}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
        )}
        
        {/* Step 4: Financial */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-tedtam-blue mb-4">ข้อมูลการเงิน</h2>
            
            <div>
              <Label htmlFor="installment">ค่างวด (บาท)</Label>
              <Input
                id="installment"
                name="installment"
                type="number"
                placeholder="0.00"
                value={formData.installment}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="commission">คอมมิชชัน (บาท)</Label>
              <Input
                id="commission"
                name="commission"
                type="number"
                placeholder="0.00"
                value={formData.commission}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Bucket เดิม</Label>
                <Select 
                  value={formData.initialBucket} 
                  onValueChange={(value) => handleSelectChange("initialBucket", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="เลือก Bucket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B1">B1</SelectItem>
                    <SelectItem value="B2">B2</SelectItem>
                    <SelectItem value="B3">B3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bucket ปัจจุบัน</Label>
                <Select 
                  value={formData.currentBucket} 
                  onValueChange={(value) => handleSelectChange("currentBucket", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="เลือก Bucket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B1">B1</SelectItem>
                    <SelectItem value="B2">B2</SelectItem>
                    <SelectItem value="B3">B3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Cycle Day</Label>
              <Select 
                value={formData.cycleDay} 
                onValueChange={(value) => handleSelectChange("cycleDay", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="เลือก Cycle Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
              <Input
                id="phoneNumber"
                placeholder="เบอร์โทรศัพท์"
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-3">
          {currentStep > 1 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={goToPrevStep}
              className="flex-1"
            >
              ย้อนกลับ
            </Button>
          ) : (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/customers')}
              className="flex-1"
            >
              ยกเลิก
            </Button>
          )}

          {currentStep < totalSteps ? (
            <Button 
              type="button" 
              className="flex-1 bg-tedtam-orange hover:bg-tedtam-orange/90"
              onClick={goToNextStep}
            >
              <span>ถัดไป</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              className="flex-1 bg-tedtam-blue hover:bg-tedtam-blue/90"
            >
              {isEditing ? "อัพเดท" : "บันทึก"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
