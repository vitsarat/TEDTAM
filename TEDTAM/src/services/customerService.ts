import { supabase } from '@/lib/supabase';
import { Customer } from '@/types/customer';
import { RealtimeChannel } from '@supabase/supabase-js';

// ลบ initialCustomers ออก เพราะเราจะดึงข้อมูลจาก Supabase
class CustomerService {
  private customers: Customer[] = [];

  // เพิ่ม constructor เพื่อโหลดข้อมูลจาก Supabase เมื่อเริ่มต้น
  constructor() {
    this.loadCustomers();
  }

  // ฟังก์ชันสำหรับโหลดข้อมูลจาก Supabase
  async loadCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*');
    if (error) {
      console.error('Error loading customers:', error);
    } else {
      this.customers = data || [];
    }
  }

  // ดึงข้อมูลลูกค้าทั้งหมดจากตัวแปรใน memory (ที่โหลดจาก Supabase)
  getCustomers(): Customer[] {
    return this.customers;
  }

  // ดึงข้อมูลลูกค้าตาม id
  getCustomerById(id: string): Customer | undefined {
    return this.customers.find(customer => customer.id === id);
  }

  // เพิ่มลูกค้าใหม่ผ่าน Supabase
  async addCustomer(customer: Omit<Customer, "id">): Promise<Customer | undefined> {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    if (error) {
      console.error('Error adding customer:', error);
      return undefined;
    }
    const newCustomer = data as Customer;
    this.customers.push(newCustomer);
    return newCustomer;
  }

  // อัปเดตข้อมูลลูกค้าผ่าน Supabase
  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined> {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating customer:', error);
      return undefined;
    }
    const updatedCustomer = data as Customer;
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers[index] = updatedCustomer;
    }
    return updatedCustomer;
  }

  // ลบลูกค้าผ่าน Supabase
  async deleteCustomer(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
    const initialLength = this.customers.length;
    this.customers = this.customers.filter(customer => customer.id !== id);
    return this.customers.length < initialLength;
  }

  // Filter customers by various criteria
  filterCustomers(filters: {
    searchTerm?: string;
    workGroup?: string | string[];
    branch?: string | string[];
    status?: string | string[];
    cycleDay?: string | string[];
    resus?: string | string[];
    team?: string | string[];
  }): Customer[] {
    return this.customers.filter(customer => {
      let matches = true;

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const nameMatches = customer.name.toLowerCase().includes(searchLower);
        const accountNumberMatches = customer.accountNumber?.includes(filters.searchTerm);
        const hubCodeMatches = customer.hubCode?.includes(filters.searchTerm);
        matches = matches && (nameMatches || accountNumberMatches || hubCodeMatches);
      }

      if (filters.workGroup) {
        const workGroups = Array.isArray(filters.workGroup) ? filters.workGroup : [filters.workGroup];
        if (workGroups.length > 0 && !workGroups.includes('all')) {
          matches = matches && workGroups.includes(customer.workGroup);
        }
      }

      if (filters.branch) {
        const branches = Array.isArray(filters.branch) ? filters.branch : [filters.branch];
        if (branches.length > 0 && !branches.includes('all')) {
          matches = matches && branches.includes(customer.branch);
        }
      }

      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        if (statuses.length > 0 && !statuses.includes('all')) {
          matches = matches && statuses.includes(customer.status);
        }
      }

      if (filters.cycleDay) {
        const cycleDays = Array.isArray(filters.cycleDay) ? filters.cycleDay : [filters.cycleDay];
        if (cycleDays.length > 0 && !cycleDays.includes('all')) {
          matches = matches && cycleDays.includes(customer.cycleDay);
        }
      }

      if (filters.resus) {
        const resuses = Array.isArray(filters.resus) ? filters.resus : [filters.resus];
        if (resuses.length > 0 && !resuses.includes('all')) {
          matches = matches && resuses.includes(customer.resus);
        }
      }

      if (filters.team) {
        const teams = Array.isArray(filters.team) ? filters.team : [filters.team];
        if (teams.length > 0 && !teams.includes('all')) {
          matches = matches && teams.includes(customer.team);
        }
      }

      return matches;
    });
  }

  // Subscribe to customer changes
  subscribeToCustomers(callback: (payload: {
    new: Customer;
    old: Customer;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  }) => void): RealtimeChannel {
    const channel = supabase
      .channel('customer_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          callback({
            new: payload.new as Customer,
            old: payload.old as Customer,
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
          });
        }
      )
      .subscribe();

    return channel;
  }

  // Unsubscribe from customer changes
  unsubscribeFromCustomers(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  }
}

export const customerService = new CustomerService();