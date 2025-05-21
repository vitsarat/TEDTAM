import { supabase } from '@/lib/supabase';

export interface PerformanceReport {
  id: string;
  team: string;
  work_group: string;
  total_assigned: number;
  total_completed: number;
  total_cured: number;
  total_dr: number;
  total_repo: number;
  total_tap_deng: number;
  report_date: string;
  created_at: string;
}

export const performanceService = {
  // ดึงข้อมูล Performance ทั้งหมด
  async getPerformanceData(): Promise<PerformanceReport[]> {
    const { data, error } = await supabase
      .from('performance_reports')
      .select('*')
      .order('report_date', { ascending: false });

    if (error) {
      console.error('Error fetching performance data:', error);
      throw error;
    }

    return data || [];
  },

  // ดึงข้อมูลตามช่วงเวลา
  async getPerformanceByDateRange(startDate: Date, endDate: Date): Promise<PerformanceReport[]> {
    const { data, error } = await supabase
      .from('performance_reports')
      .select('*')
      .gte('report_date', startDate.toISOString().split('T')[0])
      .lte('report_date', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching performance data by date range:', error);
      throw error;
    }

    return data || [];
  },

  // บันทึกข้อมูล Performance
  async savePerformanceReport(reportData: Omit<PerformanceReport, 'id' | 'created_at'>): Promise<PerformanceReport | null> {
    const { data, error } = await supabase
      .from('performance_reports')
      .insert([reportData])
      .select()
      .single();

    if (error) {
      console.error('Error saving performance report:', error);
      throw error;
    }

    return data;
  },
};