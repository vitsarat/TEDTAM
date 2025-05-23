import { useEffect, useState } from 'react';
import { customerService } from '@/services/customerService';
import type { Customer } from '@/types/customer';

export default function Dashboard() {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [todayCustomers, setTodayCustomers] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const customers = await customerService.getCustomers();
        setTotalCustomers(customers.length);

        const today = new Date().toISOString().split('T')[0];
        const todayCustomers = customers.filter(customer =>
          new Date(customer.created_at || '').toISOString().split('T')[0] === today
        );
        setTodayCustomers(todayCustomers.length);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">แดชบอร์ด</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold">จำนวนลูกค้าทั้งหมด</h3>
          <p className="text-3xl font-bold">{totalCustomers}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold">ลูกค้าที่เพิ่มวันนี้</h3>
          <p className="text-3xl font-bold">{todayCustomers}</p>
        </div>
      </div>
    </div>
  );
}