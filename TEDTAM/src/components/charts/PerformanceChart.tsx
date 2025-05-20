import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface PerformanceChartProps {
  data: any[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cured" fill="#4CAF50" name="CURED" />
          <Bar dataKey="dr" fill="#2196F3" name="DR" />
          <Bar dataKey="repo" fill="#F44336" name="REPO" />
          <Bar dataKey="tapDeng" fill="#9C27B0" name="ตบเด้ง" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;