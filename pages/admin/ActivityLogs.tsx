
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Shield, Clock, User, Activity } from 'lucide-react';
import { formatDateTime } from '../../utils/date';

export const ActivityLogs = () => {
  const { t, logs, lang } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Activity className="text-primary-500" />
            {t('activity_log')}
        </h1>
      </div>

      <div className="md:bg-white md:dark:bg-gray-800 md:rounded-xl md:shadow-sm md:border md:border-gray-200 md:dark:border-gray-700 overflow-hidden">
        <div className="">
          <table className="w-full text-left rtl:text-right block md:table">
            <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">{t('username')}</th>
                <th className="px-6 py-3">{t('actions')}</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">{t('date')}</th>
                <th className="px-6 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group space-y-4 md:space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
              {logs.map((log) => (
                <tr key={log.id} className="block md:table-row bg-white dark:bg-gray-800 md:bg-transparent rounded-xl shadow-sm md:shadow-none border border-gray-200 dark:border-gray-700 md:border-none p-4 md:p-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 font-medium dark:text-white flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                     <span className="md:hidden text-gray-500 text-xs font-bold">{t('username')}</span>
                     <div className="flex items-center gap-2">
                         <User size={14} className="text-gray-400" />
                         {log.user}
                     </div>
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                     <span className="md:hidden text-gray-500 text-xs font-bold">{t('actions')}</span>
                     <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded text-xs font-mono">
                       {log.action}
                     </span>
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-gray-500 text-sm flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                    <span className="md:hidden text-gray-500 text-xs font-bold">Details</span>
                    {log.details}
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-gray-500 text-xs font-mono flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                    <span className="md:hidden text-gray-500 text-xs font-bold">{t('date')}</span>
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDateTime(log.timestamp, lang)}
                    </div>
                  </td>
                  <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-gray-400 text-xs font-mono flex justify-between items-center md:block">
                    <span className="md:hidden text-gray-500 text-xs font-bold">IP</span>
                    {log.ip}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr className="block md:table-row">
                  <td colSpan={5} className="block md:table-cell px-6 py-12 text-center text-gray-500">
                    <Shield size={32} className="mx-auto mb-2 text-gray-300" />
                    No activity recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
