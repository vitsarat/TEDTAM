import { useEffect, useState } from 'react';
import { customerService } from '@/services/customerService';
import type { Customer } from '@/types/customer';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion'; // เพิ่ม animation
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name');
  const [isLoading, setIsLoading] = useState(true);
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
    // กรองและเรียงลำดับข้อมูลเมื่อ searchTerm หรือ sortBy เปลี่ยน
    let filtered = [...customers];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, sortBy]);

  const loadCustomers = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

    const customerToAdd = {
      name: newCustomer.name,
      email: newCustomer.email || null,
      phone: newCustomer.phone || null,
      address: newCustomer.address || null,
      user_id: user.id,
    };

    try {
      const addedCustomer = await customerService.addCustomer(customerToAdd);
      if (addedCustomer) {
        setNewCustomer({ name: '', email: '', phone: '', address: '' });
        setIsAddDialogOpen(false);
        toast.success('เพิ่มลูกค้าสำเร็จ');
      } else {
        throw new Error('ไม่สามารถเพิ่มข้อมูลลูกค้าได้');
      }
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า');
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      const updatedCustomer = await customerService.updateCustomer(editingCustomer.id, {
        name: editingCustomer.name,
        email: editingCustomer.email || null,
        phone: editingCustomer.phone || null,
        address: editingCustomer.address || null,
      });
      if (updatedCustomer) {
        setEditingCustomer(null);
        setIsEditDialogOpen(false);
        toast.success('แก้ไขลูกค้าสำเร็จ');
      } else {
        throw new Error('ไม่สามารถอัปเดตข้อมูลลูกค้าได้');
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการแก้ไขลูกค้า');
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">รายการลูกค้า</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> เพิ่มลูกค้า
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มลูกค้าใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                <Input
                  placeholder="ชื่อ"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                <Input
                  placeholder="อีเมล"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">โทรศัพท์</label>
                <Input
                  placeholder="โทรศัพท์"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                <Input
                  placeholder="ที่อยู่"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit">บันทึก</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>ยกเลิก</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Sort */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="ค้นหาลูกค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select onValueChange={(value) => setSortBy(value as 'name' | 'created_at')} defaultValue="name">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="เรียงตาม" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">ชื่อ</SelectItem>
            <SelectItem value="created_at">วันที่เพิ่ม</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* รายการลูกค้า */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">กำลังโหลด...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <p className="text-center text-gray-500 py-10">ไม่มีข้อมูลลูกค้า</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCustomers.map(customer => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-gray-800">{customer.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">อีเมล: {customer.email || 'ไม่ระบุ'}</p>
                    <p className="text-sm text-gray-600">โทร: {customer.phone || 'ไม่ระบุ'}</p>
                    <p className="text-sm text-gray-600">ที่อยู่: {customer.address || 'ไม่ระบุ'}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" /> แก้ไข
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCustomer(customer.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> ลบ
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialog สำหรับแก้ไข */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลลูกค้า</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <form onSubmit={handleEditCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                <Input
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                <Input
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">โทรศัพท์</label>
                <Input
                  value={editingCustomer.phone || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                <Input
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit">บันทึก</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>ยกเลิก</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}