
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Eye, Activity, FileText, Image, Zap, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const data = [
  { name: 'شنبه', uv: 4000, pv: 2400 },
  { name: 'یکشنبه', uv: 3000, pv: 1398 },
  { name: 'دوشنبه', uv: 2000, pv: 9800 },
  { name: 'سه‌شنبه', uv: 2780, pv: 3908 },
  { name: 'چهارشنبه', uv: 1890, pv: 4800 },
  { name: 'پنج‌شنبه', uv: 2390, pv: 3800 },
  { name: 'جمعه', uv: 3490, pv: 4300 },
];

export const Dashboard = () => {
  const { t, isRTL, pages, media, plugins, comments, logs } = useApp();

  const activePluginsCount = plugins.filter(p => p.active).length;
  const recentComments = comments.slice(0, 3);
  const recentLogs = logs.slice(0, 5);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t(title)}</p>
        <h3 className="text-2xl font-bold dark:text-white">{value}</h3>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">{t('dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="total_visits" value="12,345" icon={Eye} color="bg-blue-500" />
        <StatCard title="active_plugins" value={activePluginsCount} icon={Zap} color="bg-green-500" />
        <StatCard title="total_pages" value={pages.length} icon={FileText} color="bg-purple-500" />
        <StatCard title="total_files" value={media.length} icon={Image} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section with min-w-0 to fix grid overflow issues */}
        <Card className="lg:col-span-2 min-w-0">
          <h3 className="text-lg font-bold mb-4 dark:text-white">نمودار بازدید</h3>
          {/* Force LTR direction for Recharts to calculate coordinates correctly, regardless of document dir */}
          <div className="h-64 w-full" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={data} 
                margin={{ 
                  top: 10, 
                  // In RTL, Axis is on Right, so we reduce right margin to avoid large gap
                  // In LTR, Axis is on Left, so we keep right margin for visual balance
                  right: isRTL ? 0 : 30, 
                  left: isRTL ? 30 : 0, 
                  bottom: 0 
                }}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fontFamily: 'Estedad, sans-serif', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  // In RTL (Persian), we typically want the axis on the Right side visually
                  orientation={isRTL ? 'right' : 'left'} 
                  tick={{ fontFamily: 'Estedad, sans-serif', fontSize: 12 }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#fff',
                    direction: isRTL ? 'rtl' : 'ltr', // Restore RTL for text inside tooltip
                    fontFamily: 'Estedad, sans-serif',
                    textAlign: isRTL ? 'right' : 'left'
                  }}
                  itemStyle={{ padding: 0 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="uv" 
                  stroke="#0ea5e9" 
                  fillOpacity={1} 
                  fill="url(#colorUv)" 
                  name={t('total_visits')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <div className="space-y-6 min-w-0">
          <Card>
             <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center justify-between">
                {t('recent_activity')}
                <Link to="/admin/logs" className="text-xs text-primary-500 hover:underline">{t('view')}</Link>
             </h3>
             <div className="space-y-4">
                 {recentLogs.map(log => (
                    <div key={log.id} className="flex gap-2 items-start text-sm">
                        <div className="mt-1 w-2 h-2 rounded-full bg-primary-500 shrink-0"></div>
                        <div className="min-w-0">
                            <p className="dark:text-white font-medium truncate">{log.user}</p>
                            <p className="text-gray-500 text-xs truncate">{log.action}</p>
                            <p className="text-gray-400 text-[10px]">{log.timestamp}</p>
                        </div>
                    </div>
                 ))}
                 {recentLogs.length === 0 && <p className="text-gray-500 text-sm">No recent activity.</p>}
             </div>
          </Card>

          <Card>
             <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center justify-between">
                {t('recent_comments')}
                <Link to="/admin/comments" className="text-xs text-primary-500 hover:underline">{t('view')}</Link>
             </h3>
             <div className="space-y-4">
                {recentComments.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">{t('no_comments')}</p>
                ) : (
                  recentComments.map(c => (
                    <div key={c.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0">
                       <p className="text-sm font-bold dark:text-white truncate">{c.author}</p>
                       <p className="text-xs text-gray-500 truncate">{c.content}</p>
                    </div>
                  ))
                )}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
