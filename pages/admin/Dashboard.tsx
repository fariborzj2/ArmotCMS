import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, FileText, Image, Zap, TrendingUp, Calendar, ArrowUpRight, Activity, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { t, isRTL, pages, media, plugins, comments, logs, user, lang } = useApp();

  const activePluginsCount = plugins.filter(p => p.active).length;
  const recentComments = comments.slice(0, 3);
  const recentLogs = logs.slice(0, 4);

  // Generate dynamic Persian data for the last 7 days
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayName = new Intl.DateTimeFormat(isRTL ? 'fa-IR' : 'en-US', { weekday: 'long' }).format(d);
      data.push({
        name: dayName,
        visits: Math.floor(Math.random() * 3000) + 1500,
      });
    }
    return data;
  }, [isRTL]);

  // Modern Stat Card Component
  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, trend }: any) => (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
         <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${colorClass} transition-transform group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
         </div>
         {trend && (
             <div className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                 <TrendingUp size={12} /> +{trend}%
             </div>
         )}
      </div>
      <div>
        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t(title)}</p>
      </div>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 ${bgClass}`}></div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 text-right rtl:text-right ltr:text-left outline-none ring-0">
          <p className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{label}</p>
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
             <span className="w-2 h-2 rounded-full bg-primary-500"></span>
             <span className="font-bold text-lg">{payload[0].value.toLocaleString(isRTL ? 'fa-IR' : 'en-US')}</span>
             <span className="text-xs text-gray-500">{t('views')}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-base">
      <style>{`
        .recharts-wrapper, .recharts-surface:focus { outline: none !important; }
        .recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line { 
           stroke-dasharray: 4 4; stroke: #E5E7EB; stroke-opacity: 0.5;
        }
        .dark .recharts-cartesian-grid-horizontal line, .dark .recharts-cartesian-grid-vertical line { 
           stroke: #374151;
        }
      `}</style>

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {t('welcome')}, {user?.username} 👋
              </h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t('dashboard_subtitle')}</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-white dark:bg-[#111827] px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 font-medium">
              <Calendar size={16} />
              {new Date().toLocaleDateString(isRTL ? 'fa-IR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-base">
        <StatCard 
            title="total_visits" 
            value={isRTL ? (12500).toLocaleString('fa-IR') : "12.5k"} 
            icon={Eye} 
            colorClass="text-blue-600" 
            bgClass="bg-blue-50 dark:bg-blue-900/20"
            trend={12}
        />
        <StatCard 
            title="total_pages" 
            value={isRTL ? pages.length.toLocaleString('fa-IR') : pages.length} 
            icon={FileText} 
            colorClass="text-purple-600" 
            bgClass="bg-purple-50 dark:bg-purple-900/20"
            trend={5}
        />
        <StatCard 
            title="active_plugins" 
            value={isRTL ? activePluginsCount.toLocaleString('fa-IR') : activePluginsCount} 
            icon={Zap} 
            colorClass="text-amber-600" 
            bgClass="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard 
            title="total_files" 
            value={isRTL ? media.length.toLocaleString('fa-IR') : media.length} 
            icon={Image} 
            colorClass="text-pink-600" 
            bgClass="bg-pink-50 dark:bg-pink-900/20"
            trend={8}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-base">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="text-primary-500" size={20} />
                  {t('total_visits')}
              </h3>
              <button className="text-sm font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-xl hover:bg-primary-100 transition-colors">
                  {t('last_7_days')}
              </button>
          </div>
          <div className="h-[280px] w-full" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                  reversed={isRTL}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  orientation={isRTL ? 'right' : 'left'} 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  dx={isRTL ? 10 : -10}
                  tickFormatter={(val) => isRTL ? val.toLocaleString('fa-IR') : val}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4' }} isAnimationActive={false} />
                <Area type="monotone" dataKey="visits" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" animationDuration={1500} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Activity & Comments */}
        <div className="space-y-base">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg dark:text-white">{t('recent_activity')}</h3>
                <Link to="/admin/logs" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
                    <ArrowUpRight size={18} />
                </Link>
             </div>
             <div className="space-y-6 relative">
                 <div className="absolute left-[19px] rtl:right-[19px] rtl:left-auto top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800"></div>
                 {recentLogs.map((log, idx) => (
                    <div key={log.id} className="flex gap-4 items-start relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-4 border-white dark:border-[#111827] ${idx === 0 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                            <Activity size={16} />
                        </div>
                        <div className="min-w-0 pt-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{log.action.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-500 mb-1">{t('by')} <span className="font-medium text-gray-700 dark:text-gray-300">{log.user}</span></p>
                            <p className="text-[10px] text-gray-400 font-mono">{log.timestamp}</p>
                        </div>
                    </div>
                 ))}
                 {recentLogs.length === 0 && <p className="text-gray-500 text-sm text-center py-4">{t('no_activity')}</p>}
             </div>
          </div>

          <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-2xl p-6 shadow-lg text-white">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{t('recent_comments')}</h3>
                <div className="bg-white/20 p-2 rounded-xl">
                    <MessageSquare size={18} className="text-white" />
                </div>
             </div>
             <div className="space-y-4">
                {recentComments.length > 0 ? recentComments.map((c, i) => (
                    <div key={c.id} className={`flex items-start gap-3 ${i !== recentComments.length - 1 ? 'border-b border-white/10 pb-3' : ''}`}>
                       <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                           {c.author.charAt(0)}
                       </div>
                       <div className="min-w-0">
                           <p className="text-sm font-bold truncate opacity-90">{c.author}</p>
                           <p className="text-xs truncate opacity-70">{c.content}</p>
                       </div>
                    </div>
                )) : (
                    <p className="text-sm opacity-70 text-center py-2">{t('no_comments')}</p>
                )}
             </div>
             <Link to="/admin/comments" className="mt-6 block w-full py-2.5 bg-white text-primary-700 font-bold text-center rounded-xl text-sm hover:bg-gray-50 transition-colors">
                 {t('view_all_comments')}
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};