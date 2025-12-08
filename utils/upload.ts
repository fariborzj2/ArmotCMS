
import { toJalaali } from './date';
import { MediaContext } from '../types';

export const generateMediaPath = (fileName: string, context: MediaContext = 'general') => {
  const now = new Date();
  const j = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  // Format: YYYY-MM-DD (Jalali)
  const dateStr = `${j.jy}-${String(j.jm).padStart(2, '0')}-${String(j.jd).padStart(2, '0')}`;
  
  // Folder structure: context/date
  const folder = `${context}/${dateStr}`;
  
  // Full path: upload/images/context/date/filename
  // Note: We assume images folder for now, in a real backend this might vary by mime type
  const path = `upload/images/${folder}/${fileName}`;

  return { path, folder, context };
};