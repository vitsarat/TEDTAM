
import React from 'react';
import { CalendarClock, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTasks, TaskStatus } from '@/hooks/use-tasks';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export const TaskTracker = () => {
  const { tasks, getUpcomingTasks, updateTaskStatus } = useTasks();
  const upcomingTasks = getUpcomingTasks().slice(0, 3); // แสดงเพียง 3 รายการ

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-gray-500">รอดำเนินการ</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500">กำลังดำเนินการ</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">เสร็จสิ้น</Badge>;
      case 'delayed':
        return <Badge className="bg-amber-500">ล่าช้า</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">ต่ำ</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-amber-200 text-amber-700">ปานกลาง</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-rose-200 text-rose-700">สูง</Badge>;
      default:
        return null;
    }
  };

  const handleCompleteTask = (id: string) => {
    updateTaskStatus(id, 'completed');
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-tedtam-blue flex items-center">
          <CalendarClock className="h-5 w-5 mr-2" />
          การติดตามงาน
          <Button variant="ghost" className="ml-auto h-8 text-xs text-tedtam-orange">
            ดูทั้งหมด
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {upcomingTasks.length > 0 ? (
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="border rounded-md p-3">
                <div className="flex justify-between">
                  <h4 className="font-medium">{task.title}</h4>
                  <div className="flex space-x-2">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {format(task.dueDate, 'dd MMM yyyy', { locale: th })}
                  </div>
                  {task.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      เสร็จสิ้น
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2">ไม่มีงานที่ต้องทำในเร็วๆ นี้</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
