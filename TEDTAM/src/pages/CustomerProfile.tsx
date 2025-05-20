
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Map, 
  Car, 
  Clipboard, 
  Edit, 
  Trash2, 
  Share2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { customerService } from "@/services/customerService";
import { Customer } from "@/types/customer";

const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const foundCustomer = customerService.getCustomerById(id);
      if (foundCustomer) {
        setCustomer(foundCustomer);
      }
      setLoading(false);
    }
  }, [id]);

  const handleDelete = () => {
    if (id && customer) {
      const isDeleted = customerService.deleteCustomer(id);
      if (isDeleted) {
        toast({
          title: "ลบข้อมูลสำเร็จ",
          description: `ลบข้อมูลลูกค้า ${customer.name} เรียบร้อยแล้ว`,
        });
        navigate('/customers');
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบข้อมูลลูกค้าได้",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = () => {
    navigate(`/customer/edit/${id}`);
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

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tedtam-blue mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-4">
        <Button 
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/customers')}
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> ย้อนกลับ
        </Button>
        <div className="text-center py-8">
          <h2 className="text-xl font-bold mb-2">ไม่พบข้อมูลลูกค้า</h2>
          <p className="text-gray-500 mb-4">ไม่พบข้อมูลลูกค้ารายนี้ในระบบ</p>
          <Button onClick={() => navigate('/customers')}>
            กลับไปหน้ารายการลูกค้า
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="tedtam-gradient text-white p-4 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10 absolute left-2 top-2"
          onClick={() => navigate('/customers')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="pt-6 pb-3">
          <h1 className="text-xl font-bold mt-2">{customer.name}</h1>
          <div className="flex items-center text-sm mt-1">
            <span>{customer.accountNumber}</span>
            <span className="mx-2">•</span>
            <span>{customer.branch}</span>
          </div>
        </div>
        
        <div className="absolute right-3 top-3 flex gap-2">
          <Button 
            size="icon" 
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={handleEdit}
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="p-4 space-y-4">
        {/* Status Card */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">สถานะ</h3>
                <div className="flex gap-2 mt-1">
                  <Badge className={getStatusBadgeColor(customer.status)}>
                    {customer.status}
                  </Badge>
                  <Badge className={getResusBadgeColor(customer.resus)}>
                    {customer.resus}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-medium">กลุ่มงาน</h3>
                <Badge variant="outline" className="mt-1">{customer.workGroup}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Info */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">ข้อมูลการเงิน</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Principle</span>
                <span className="font-medium">{customer.principle.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ค่างวด</span>
                <span>{customer.installment.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">คอมมิชชัน</span>
                <span>{customer.commission.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bucket</span>
                <span>{customer.currentBucket} (เดิม: {customer.initialBucket})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cycle Day</span>
                <span>{customer.cycleDay}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">ข้อมูลยานพาหนะ</h3>
              <Car className="h-5 w-5 text-tedtam-blue" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">ยี่ห้อ/รุ่น</span>
                <span>{customer.brand} {customer.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ทะเบียน</span>
                <span>{customer.licensePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">เลขเครื่อง</span>
                <span>{customer.engineNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ราคาตามบลูบุ๊ค</span>
                <span>{customer.blueBookPrice.toLocaleString()} บาท</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">ที่อยู่</h3>
              <Map className="h-5 w-5 text-tedtam-blue" />
            </div>
            <p className="text-gray-600 mb-3">{customer.address}</p>
            <div className="bg-gray-100 rounded-md p-3 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">พิกัด</span>
                <span>{customer.latitude.toFixed(4)}, {customer.longitude.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hub Code</span>
                <span>{customer.hubCode}</span>
              </div>
            </div>
            <Button className="w-full mt-3 bg-tedtam-orange hover:bg-tedtam-orange/90">
              นำทาง
            </Button>
          </CardContent>
        </Card>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="bg-tedtam-blue hover:bg-tedtam-blue/90 flex items-center justify-center">
            <Phone className="h-4 w-4 mr-2" />
            <span>โทร</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <Share2 className="h-4 w-4 mr-2" />
            <span>แชร์</span>
          </Button>
        </div>

        {/* Work Status */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">สถานะการทำงาน</h3>
              <Clipboard className="h-5 w-5 text-tedtam-blue" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">สถานะ</span>
                <span>{customer.workStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ผลล่าสุด</span>
                <span>{customer.lastVisitResult}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">วันที่อนุมัติ</span>
                <span>{customer.authorizationDate}</span>
              </div>
              <Separator className="my-3" />
              <Button variant="outline" className="w-full flex items-center justify-center">
                <span>ดูประวัติการทำงาน</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfile;
