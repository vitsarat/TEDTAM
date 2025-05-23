import { useEffect, useState } from 'react';
import { customerService } from '@/services/customerService';
import type { Customer } from '@/types/customer';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '', email: '', phone: '', address: '',
    accountNumber: '', groupCode: '', branch: '', principle: 0,
    status: '', brand: '', model: '', licensePlate: '',
    resus: '', authorizationDate: '', commission: 0, registrationId: '',
    workGroup: '', fieldTeam: '', installment: 0, initialBucket: '',
    currentBucket: '', cycleDay: '', engineNumber: '', blueBookPrice: 0,
    latitude: 0, longitude: 0, hubCode: '', workStatus: '',
    lastVisitResult: '', team: ''
  });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name');
  const { user } = useAuth();

  useEffect(() => {
    loadCustomers();

    const channel = customerService.subscribeToCustomers((payload) => {
      console.log('Received Realtime update:', payload);
      switch (payload.eventType) {
        case 'INSERT':
          setCustomers(prev => {
            if (prev.some(customer => customer.id === payload.new.id)) {
              console.warn('Duplicate customer ID detected in INSERT:', payload.new.id);
              return prev;
            }
            return [...prev, payload.new];
          });
          toast.success('เพิ่มข้อมูลลูกค้าสำเร็จ');
          break;
        case 'UPDATE':
          setCustomers(prev =>
            prev.map(customer =>
              customer.id === payload.new.id ? payload.new : customer
            )
          );
          toast.success('อัปเดตข้อมูลลูกค้าสำเร็จ');
          break;
        case 'DELETE':
          setCustomers(prev =>
            prev.filter(customer => customer.id !== payload.old.id)
          );
          toast.success('ลบข้อมูลลูกค้าสำเร็จ');
          break;
      }
    });

    return () => {
      customerService.unsubscribeFromCustomers(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = [...customers];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
        (customer.phone && customer.phone.includes(searchLower)) ||
        (customer.accountNumber && customer.accountNumber.includes(searchLower))
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'created_at') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      return 0;
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, sortBy]);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      console.log('Initial customers loaded:', data);
      const uniqueCustomers = Array.from(
        new Map(data.map(customer => [customer.id, customer])).values()
      );
      if (uniqueCustomers.length !== data.length) {
        console.warn('Duplicate customer IDs detected during initial load:', data);
        toast.error('พบข้อมูลลูกค้าที่มี ID ซ้ำ กรุณาตรวจสอบใน Supabase');
      }
      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า');
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('กรุณาล็อกอินก่อนเพิ่มข้อมูล');
      return;
    }

    if (!newCustomer.name) {
      toast.error('กรุณากรอกชื่อ');
      return;
    }

    const customerToAdd: Omit<Customer, 'id' | 'created_at'> = {
      name: newCustomer.name,
      email: newCustomer.email || null,
      phone: newCustomer.phone || null,
      address: newCustomer.address || null,
      accountNumber: newCustomer.accountNumber || null,
      groupCode: newCustomer.groupCode || null,
      branch: newCustomer.branch || null,
      principle: newCustomer.principle || null,
      status: newCustomer.status || null,
      brand: newCustomer.brand || null,
      model: newCustomer.model || null,
      licensePlate: newCustomer.licensePlate || null,
      resus: newCustomer.resus || null,
      authorizationDate: newCustomer.authorizationDate || null,
      commission: newCustomer.commission || null,
      registrationId: newCustomer.registrationId || null,
      workGroup: newCustomer.workGroup || null,
      fieldTeam: newCustomer.fieldTeam || null,
      installment: newCustomer.installment || null,
      initialBucket: newCustomer.initialBucket || null,
      currentBucket: newCustomer.currentBucket || null,
      cycleDay: newCustomer.cycleDay || null,
      engineNumber: newCustomer.engineNumber || null,
      blueBookPrice: newCustomer.blueBookPrice || null,
      latitude: newCustomer.latitude || null,
      longitude: newCustomer.longitude || null,
      hubCode: newCustomer.hubCode || null,
      workStatus: newCustomer.workStatus || null,
      lastVisitResult: newCustomer.lastVisitResult || null,
      team: newCustomer.team || null,
      user_id: user.id,
    };

    try {
      const addedCustomer = await customerService.addCustomer(customerToAdd);
      if (addedCustomer) {
        setNewCustomer({
          name: '', email: '', phone: '', address: '',
          accountNumber: '', groupCode: '', branch: '', principle: 0,
          status: '', brand: '', model: '', licensePlate: '',
          resus: '', authorizationDate: '', commission: 0, registrationId: '',
          workGroup: '', fieldTeam: '', installment: 0, initialBucket: '',
          currentBucket: '', cycleDay: '', engineNumber: '', blueBookPrice: 0,
          latitude: 0, longitude: 0, hubCode: '', workStatus: '',
          lastVisitResult: '', team: ''
        });
        toast.success('เพิ่มลูกค้าสำเร็จจากหน้าเว็บ');
      } else {
        throw new Error('ไม่สามารถเพิ่มข้อมูลลูกค้าได้');
      }
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า');
    }
  };

  const handleEditCustomer = async (customer: Customer) => {
    if (editingCustomer) {
      try {
        const updatedCustomer = await customerService.updateCustomer(editingCustomer.id, {
          name: editingCustomer.name,
          email: editingCustomer.email || null,
          phone: editingCustomer.phone || null,
          address: editingCustomer.address || null,
          accountNumber: editingCustomer.accountNumber || null,
          groupCode: editingCustomer.groupCode || null,
          branch: editingCustomer.branch || null,
          principle: editingCustomer.principle || null,
          status: editingCustomer.status || null,
          brand: editingCustomer.brand || null,
          model: editingCustomer.model || null,
          licensePlate: editingCustomer.licensePlate || null,
          resus: editingCustomer.resus || null,
          authorizationDate: editingCustomer.authorizationDate || null,
          commission: editingCustomer.commission || null,
          registrationId: editingCustomer.registrationId || null,
          workGroup: editingCustomer.workGroup || null,
          fieldTeam: editingCustomer.fieldTeam || null,
          installment: editingCustomer.installment || null,
          initialBucket: editingCustomer.initialBucket || null,
          currentBucket: editingCustomer.currentBucket || null,
          cycleDay: editingCustomer.cycleDay || null,
          engineNumber: editingCustomer.engineNumber || null,
          blueBookPrice: editingCustomer.blueBookPrice || null,
          latitude: editingCustomer.latitude || null,
          longitude: editingCustomer.longitude || null,
          hubCode: editingCustomer.hubCode || null,
          workStatus: editingCustomer.workStatus || null,
          lastVisitResult: editingCustomer.lastVisitResult || null,
          team: editingCustomer.team || null,
        });
        if (updatedCustomer) {
          setEditingCustomer(null);
          toast.success('แก้ไขลูกค้าสำเร็จ');
        } else {
          throw new Error('ไม่สามารถอัปเดตข้อมูลลูกค้าได้');
        }
      } catch (error: any) {
        console.error('Error updating customer:', error);
        toast.error(error.message || 'เกิดข้อผิดพลาดในการแก้ไขลูกค้า');
      }
    } else {
      setEditingCustomer(customer);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const success = await customerService.deleteCustomer(id);
      if (success) {
        toast.success('ลบลูกค้าสำเร็จ');
      } else {
        throw new Error('ไม่สามารถลบข้อมูลลูกค้าได้');
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลบลูกค้า');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">รายการลูกค้า</h2>

      {/* ช่องค้นหาและการเรียงลำดับ */}
      <div className="mb-6 space-y-4">
        <Input
          placeholder="ค้นหา ชื่อ, อีเมล, โทรศัพท์ หรือเลขบัญชี"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center space-x-4">
          <span>เรียงลำดับตาม:</span>
          <Select value={sortBy} onValueChange={(value: 'name' | 'created_at') => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกการเรียงลำดับ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">ชื่อ</SelectItem>
              <SelectItem value="created_at">วันที่สร้าง (ใหม่ไปเก่า)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ฟอร์มเพิ่มลูกค้า */}
      <form onSubmit={handleAddCustomer} className="mb-6 space-y-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="ชื่อ"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          required
        />
        <Input
          placeholder="อีเมล"
          value={newCustomer.email}
          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
        />
        <Input
          placeholder="โทรศัพท์"
          value={newCustomer.phone}
          onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
        />
        <Input
          placeholder="ที่อยู่"
          value={newCustomer.address}
          onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
        />
        <Input
          placeholder="เลขบัญชี"
          value={newCustomer.accountNumber}
          onChange={(e) => setNewCustomer({ ...newCustomer, accountNumber: e.target.value })}
        />
        <Input
          placeholder="รหัสกลุ่ม"
          value={newCustomer.groupCode}
          onChange={(e) => setNewCustomer({ ...newCustomer, groupCode: e.target.value })}
        />
        <Input
          placeholder="สาขา"
          value={newCustomer.branch}
          onChange={(e) => setNewCustomer({ ...newCustomer, branch: e.target.value })}
        />
        <Input
          type="number"
          placeholder="ยอดหนี้ (principle)"
          value={newCustomer.principle || ''}
          onChange={(e) => setNewCustomer({ ...newCustomer, principle: parseFloat(e.target.value) || 0 })}
        />
        <Input
          placeholder="สถานะ"
          value={newCustomer.status}
          onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
        />
        <Input
          placeholder="ยี่ห้อรถ"
          value={newCustomer.brand}
          onChange={(e) => setNewCustomer({ ...newCustomer, brand: e.target.value })}
        />
        <Input
          placeholder="รุ่นรถ"
          value={newCustomer.model}
          onChange={(e) => setNewCustomer({ ...newCustomer, model: e.target.value })}
        />
        <Input
          placeholder="เลขทะเบียนรถ"
          value={newCustomer.licensePlate}
          onChange={(e) => setNewCustomer({ ...newCustomer, licensePlate: e.target.value })}
        />
        <Input
          placeholder="ผลลัพธ์ (resus)"
          value={newCustomer.resus}
          onChange={(e) => setNewCustomer({ ...newCustomer, resus: e.target.value })}
        />
        <Input
          type="date"
          placeholder="วันที่อนุญาต (authorizationDate)"
          value={newCustomer.authorizationDate}
          onChange={(e) => setNewCustomer({ ...newCustomer, authorizationDate: e.target.value })}
        />
        <Input
          type="number"
          placeholder="ค่าคอมมิชชั่น"
          value={newCustomer.commission || ''}
          onChange={(e) => setNewCustomer({ ...newCustomer, commission: parseFloat(e.target.value) || 0 })}
        />
        <Input
          placeholder="รหัสทะเบียน"
          value={newCustomer.registrationId}
          onChange={(e) => setNewCustomer({ ...newCustomer, registrationId: e.target.value })}
        />
        <Input
          placeholder="กลุ่มงาน"
          value={newCustomer.workGroup}
          onChange={(e) => setNewCustomer({ ...newCustomer, workGroup: e.target.value })}
        />
        <Input
          placeholder="ทีมงานภาคสนาม"
          value={newCustomer.fieldTeam}
          onChange={(e) => setNewCustomer({ ...newCustomer, fieldTeam: e.target.value })}
        />
        <Input
          type="number"
          placeholder="ค่างวด"
          value={newCustomer.installment || ''}
          onChange={(e) => setNewCustomer({ ...newCustomer, installment: parseFloat(e.target.value) || 0 })}
        />
        <Input
          placeholder="Initial Bucket"
          value={newCustomer.initialBucket}
          onChange={(e) => setNewCustomer({ ...newCustomer, initialBucket: e.target.value })}
        />
        <Input
          placeholder="Current Bucket"
          value={newCustomer.currentBucket}
          onChange={(e) => setNewCustomer({ ...newCustomer, currentBucket: e.target.value })}
        />
        <Input
          placeholder="Cycle Day"
          value={newCustomer.cycleDay}
          onChange={(e) => setNewCustomer({ ...newCustomer, cycleDay: e.target.value })}
        />
        <Input
          placeholder="เลขเครื่องยนต์"
          value={newCustomer.engineNumber}
          onChange={(e) => setNewCustomer({ ...newCustomer, engineNumber: e.target.value })}
        />
        <Input
          type="number"
          placeholder="ราคาสมุดสีน้ำเงิน"
          value={newCustomer.blueBookPrice || ''}
          onChange={(e) => setNewCustomer({ ...newCustomer, blueBookPrice: parseFloat(e.target.value) || 0 })}
        />
        <Input
          type="number"
          placeholder="Latitude"
          value={newCustomer.latitude || ''}
          onChange={(e) => setNewCustomer({ ...newCustomer, latitude: parseFloat(e.target.value) || 0 })}
        />
        <Input
          type="number"
          placeholder="Longitude"
          value={newCustomer.longitude || ''}
          onChange={(e) => setNewCustomer({ ...newCustomer, longitude: parseFloat(e.target.value) || 0 })}
        />
        <Input
          placeholder="รหัส Hub"
          value={newCustomer.hubCode}
          onChange={(e) => setNewCustomer({ ...newCustomer, hubCode: e.target.value })}
        />
        <Input
          placeholder="สถานะงาน"
          value={newCustomer.workStatus}
          onChange={(e) => setNewCustomer({ ...newCustomer, workStatus: e.target.value })}
        />
        <Input
          placeholder="ผลการเยี่ยมครั้งล่าสุด"
          value={newCustomer.lastVisitResult}
          onChange={(e) => setNewCustomer({ ...newCustomer, lastVisitResult: e.target.value })}
        />
        <Input
          placeholder="ทีม"
          value={newCustomer.team}
          onChange={(e) => setNewCustomer({ ...newCustomer, team: e.target.value })}
        />
        <Button type="submit">เพิ่มลูกค้า</Button>
      </form>

      {/* รายการลูกค้า */}
      {filteredCustomers.length === 0 ? (
        <p>ไม่มีข้อมูลลูกค้า</p>
      ) : (
        <ul className="space-y-4">
          {filteredCustomers.map(customer => (
            <li key={customer.id} className="border p-4 rounded-lg shadow-sm">
              {editingCustomer && editingCustomer.id === customer.id ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="ชื่อ"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="อีเมล"
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  />
                  <Input
                    placeholder="โทรศัพท์"
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  />
                  <Input
                    placeholder="ที่อยู่"
                    value={editingCustomer.address || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  />
                  <Input
                    placeholder="เลขบัญชี"
                    value={editingCustomer.accountNumber || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, accountNumber: e.target.value })}
                  />
                  <Input
                    placeholder="รหัสกลุ่ม"
                    value={editingCustomer.groupCode || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, groupCode: e.target.value })}
                  />
                  <Input
                    placeholder="สาขา"
                    value={editingCustomer.branch || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, branch: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="ยอดหนี้ (principle)"
                    value={editingCustomer.principle || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, principle: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    placeholder="สถานะ"
                    value={editingCustomer.status || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                  />
                  <Input
                    placeholder="ยี่ห้อรถ"
                    value={editingCustomer.brand || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, brand: e.target.value })}
                  />
                  <Input
                    placeholder="รุ่นรถ"
                    value={editingCustomer.model || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, model: e.target.value })}
                  />
                  <Input
                    placeholder="เลขทะเบียนรถ"
                    value={editingCustomer.licensePlate || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, licensePlate: e.target.value })}
                  />
                  <Input
                    placeholder="ผลลัพธ์ (resus)"
                    value={editingCustomer.resus || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, resus: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder="วันที่อนุญาต (authorizationDate)"
                    value={editingCustomer.authorizationDate || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, authorizationDate: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="ค่าคอมมิชชั่น"
                    value={editingCustomer.commission || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, commission: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    placeholder="รหัสทะเบียน"
                    value={editingCustomer.registrationId || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, registrationId: e.target.value })}
                  />
                  <Input
                    placeholder="กลุ่มงาน"
                    value={editingCustomer.workGroup || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, workGroup: e.target.value })}
                  />
                  <Input
                    placeholder="ทีมงานภาคสนาม"
                    value={editingCustomer.fieldTeam || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, fieldTeam: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="ค่างวด"
                    value={editingCustomer.installment || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, installment: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    placeholder="Initial Bucket"
                    value={editingCustomer.initialBucket || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, initialBucket: e.target.value })}
                  />
                  <Input
                    placeholder="Current Bucket"
                    value={editingCustomer.currentBucket || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, currentBucket: e.target.value })}
                  />
                  <Input
                    placeholder="Cycle Day"
                    value={editingCustomer.cycleDay || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, cycleDay: e.target.value })}
                  />
                  <Input
                    placeholder="เลขเครื่องยนต์"
                    value={editingCustomer.engineNumber || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, engineNumber: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="ราคาสมุดสีน้ำเงิน"
                    value={editingCustomer.blueBookPrice || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, blueBookPrice: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Latitude"
                    value={editingCustomer.latitude || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, latitude: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Longitude"
                    value={editingCustomer.longitude || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, longitude: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    placeholder="รหัส Hub"
                    value={editingCustomer.hubCode || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, hubCode: e.target.value })}
                  />
                  <Input
                    placeholder="สถานะงาน"
                    value={editingCustomer.workStatus || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, workStatus: e.target.value })}
                  />
                  <Input
                    placeholder="ผลการเยี่ยมครั้งล่าสุด"
                    value={editingCustomer.lastVisitResult || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, lastVisitResult: e.target.value })}
                  />
                  <Input
                    placeholder="ทีม"
                    value={editingCustomer.team || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, team: e.target.value })}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleEditCustomer(customer)} className="mr-2">บันทึก</Button>
                    <Button onClick={() => setEditingCustomer(null)} variant="outline">ยกเลิก</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>ชื่อ:</strong> {customer.name}</p>
                      <p><strong>อีเมล:</strong> {customer.email || 'ไม่ระบุ'}</p>
                      <p><strong>โทรศัพท์:</strong> {customer.phone || 'ไม่ระบุ'}</p>
                      <p><strong>ที่อยู่:</strong> {customer.address || 'ไม่ระบุ'}</p>
                      <p><strong>เลขบัญชี:</strong> {customer.accountNumber || 'ไม่ระบุ'}</p>
                      <p><strong>รหัสกลุ่ม:</strong> {customer.groupCode || 'ไม่ระบุ'}</p>
                      <p><strong>สาขา:</strong> {customer.branch || 'ไม่ระบุ'}</p>
                      <p><strong>ยอดหนี้:</strong> {customer.principle || 'ไม่ระบุ'}</p>
                      <p><strong>สถานะ:</strong> {customer.status || 'ไม่ระบุ'}</p>
                      <p><strong>ยี่ห้อรถ:</strong> {customer.brand || 'ไม่ระบุ'}</p>
                      <p><strong>รุ่นรถ:</strong> {customer.model || 'ไม่ระบุ'}</p>
                      <p><strong>เลขทะเบียนรถ:</strong> {customer.licensePlate || 'ไม่ระบุ'}</p>
                      <p><strong>ผลลัพธ์ (resus):</strong> {customer.resus || 'ไม่ระบุ'}</p>
                      <p><strong>วันที่อนุญาต:</strong> {customer.authorizationDate || 'ไม่ระบุ'}</p>
                      <p><strong>ค่าคอมมิชชั่น:</strong> {customer.commission || 'ไม่ระบุ'}</p>
                      <p><strong>รหัสทะเบียน:</strong> {customer.registrationId || 'ไม่ระบุ'}</p>
                      <p><strong>กลุ่มงาน:</strong> {customer.workGroup || 'ไม่ระบุ'}</p>
                      <p><strong>ทีมงานภาคสนาม:</strong> {customer.fieldTeam || 'ไม่ระบุ'}</p>
                      <p><strong>ค่างวด:</strong> {customer.installment || 'ไม่ระบุ'}</p>
                      <p><strong>Initial Bucket:</strong> {customer.initialBucket || 'ไม่ระบุ'}</p>
                      <p><strong>Current Bucket:</strong> {customer.currentBucket || 'ไม่ระบุ'}</p>
                      <p><strong>Cycle Day:</strong> {customer.cycleDay || 'ไม่ระบุ'}</p>
                      <p><strong>เลขเครื่องยนต์:</strong> {customer.engineNumber || 'ไม่ระบุ'}</p>
                      <p><strong>ราคาสมุดสีน้ำเงิน:</strong> {customer.blueBookPrice || 'ไม่ระบุ'}</p>
                      <p><strong>Latitude:</strong> {customer.latitude || 'ไม่ระบุ'}</p>
                      <p><strong>Longitude:</strong> {customer.longitude || 'ไม่ระบุ'}</p>
                      <p><strong>รหัส Hub:</strong> {customer.hubCode || 'ไม่ระบุ'}</p>
                      <p><strong>สถานะงาน:</strong> {customer.workStatus || 'ไม่ระบุ'}</p>
                      <p><strong>ผลการเยี่ยมครั้งล่าสุด:</strong> {customer.lastVisitResult || 'ไม่ระบุ'}</p>
                      <p><strong>ทีม:</strong> {customer.team || 'ไม่ระบุ'}</p>
                      <p><strong>วันที่สร้าง:</strong> {new Date(customer.created_at || '').toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleEditCustomer(customer)} className="mr-2">แก้ไข</Button>
                      <Button onClick={() => handleDeleteCustomer(customer.id)} variant="destructive">ลบ</Button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}