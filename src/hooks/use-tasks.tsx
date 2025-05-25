
import { useState } from 'react';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'delayed';

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
};

// ข้อมูลตัวอย่าง
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'ยื่นคำร้องศาล',
    description: 'ยื่นคำร้องศาลในคดีหมายเลข 123/2566',
    dueDate: new Date(2025, 4, 25),
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2',
    title: 'สัมภาษณ์พยาน',
    description: 'สัมภาษณ์พยานในคดีหมายเลข 187/2566',
    dueDate: new Date(2025, 4, 22),
    status: 'in-progress',
    priority: 'medium',
    assignedTo: 'สมศักดิ์'
  },
  {
    id: '3',
    title: 'จัดเตรียมเอกสาร',
    description: 'จัดเตรียมเอกสารสำหรับการไกล่เกลี่ย',
    dueDate: new Date(2025, 4, 20),
    status: 'completed',
    priority: 'medium'
  }
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
  // เพิ่มงานใหม่
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };
  
  // อัปเดตสถานะงาน
  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
  };
  
  // อัปเดตงาน
  const updateTask = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };
  
  // ลบงาน
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // กรองงานตามสถานะ
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };
  
  // กรองงานตามความสำคัญ
  const getTasksByPriority = (priority: 'low' | 'medium' | 'high') => {
    return tasks.filter(task => task.priority === priority);
  };
  
  // งานที่ใกล้ถึงกำหนด (ภายใน 3 วัน)
  const getUpcomingTasks = () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    return tasks.filter(task => 
      task.status !== 'completed' && 
      task.dueDate <= threeDaysFromNow
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };
  
  return {
    tasks,
    addTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByPriority,
    getUpcomingTasks
  };
};
