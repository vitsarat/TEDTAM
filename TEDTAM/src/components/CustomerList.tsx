import { useEffect, useState } from 'react';
import { customerService } from '@/services/customerService';
import type { Customer } from '@/types/customer';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner'; // เพิ่มการ import toast

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();

    const channel = customerService.subscribeToCustomers((payload) => {
      console.log('Received Realtime update:', payload);
      switch (payload.eventType) {
        case 'INSERT':
          setCustomers(prev => [...prev, payload.new]);
          toast.success('เพิ่มข้อมูลลูกค้าสำเร็จ'); // เพิ่มการแจ้งเตือน
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

  const loadCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      console.log('Initial customers loaded:', data);
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า');
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerToAdd = {
      ...newCustomer,
      user_id: 'YOUR_ADMIN_UUID', // แทนที่ด้วย UUID ของ admin@example.com
    };
    const addedCustomer = await customerService.addCustomer(customerToAdd);
    if (addedCustomer) {
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
      toast.success('เพิ่มลูกค้าสำเร็จจากหน้าเว็บ');
    } else {
      toast.error('เกิดข้อผิดพลาดในการเพิ่มลูกค้า');
    }
  };

  const handleEditCustomer = async (customer: Customer) => {
    if (editingCustomer) {
      const updatedCustomer = await customerService.updateCustomer(editingCustomer.id, {
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        address: editingCustomer.address,
      });
      if (updatedCustomer) {
        setEditingCustomer(null);
        toast.success('แก้ไขลูกค้าสำเร็จ');
      } else {
        toast.error('เกิดข้อผิดพลาดในการแก้ไขลูกค้า');
      }
    } else {
      setEditingCustomer(customer);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    const success = await customerService.deleteCustomer(id);
    if (success) {
      toast.success('ลบลูกค้าสำเร็จ');
    } else {
      toast.error('เกิดข้อผิดพลาดในการลบลูกค้า');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">รายการลูกค้า</h2>

      {/* ฟอร์มเพิ่มลูกค้า */}
      <form onSubmit={handleAddCustomer} className="mb-6 space-y-4">
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
        <Button type="submit">เพิ่มลูกค้า</Button>
      </form>

      {/* รายการลูกค้า */}
      {customers.length === 0 ? (
        <p>ไม่มีข้อมูลลูกค้า</p>
      ) : (
        <ul className="space-y-2">
          {customers.map(customer => (
            <li key={customer.id} className="border p-2 rounded flex justify-between items-center">
              {editingCustomer && editingCustomer.id === customer.id ? (
                <>
                  <div className="space-y-2">
                    <Input
                      value={editingCustomer.name}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    />
                    <Input
                      value={editingCustomer.email || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    />
                    <Input
                      value={editingCustomer.phone || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    />
                    <Input
                      value={editingCustomer.address || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Button onClick={() => handleEditCustomer(customer)} className="mr-2">บันทึก</Button>
                    <Button onClick={() => setEditingCustomer(null)} variant="outline">ยกเลิก</Button>
                  </div>
                </>
              ) : (
                <>
                  <span>
                    {customer.name} - อีเมล: {customer.email || 'ไม่ระบุ'} - โทร: {customer.phone || 'ไม่ระบุ'}
                  </span>
                  <div>
                    <Button onClick={() => handleEditCustomer(customer)} className="mr-2">แก้ไข</Button>
                    <Button onClick={() => handleDeleteCustomer(customer.id)} variant="destructive">ลบ</Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}