
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Menu as MenuIcon } from 'lucide-react';
import { MenuItem } from '../../types';

export const MenuManager = () => {
  const { t, menus, addMenuItem, updateMenuItem, deleteMenuItem } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});

  const headerMenus = menus.filter(m => m.location === 'header').sort((a, b) => a.order - b.order);
  const footerMenus = menus.filter(m => m.location === 'footer').sort((a, b) => a.order - b.order);

  const startEdit = (item?: MenuItem) => {
    if (item) {
      setEditForm(item);
    } else {
      setEditForm({
        label: { fa: '', en: '' },
        url: '',
        order: menus.length + 1,
        location: 'header'
      });
    }
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.url || !editForm.label?.fa) return;

    if (editForm.id) {
      updateMenuItem(editForm as MenuItem);
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        label: editForm.label,
        url: editForm.url,
        order: Number(editForm.order) || 1,
        location: editForm.location as 'header' | 'footer'
      };
      addMenuItem(newItem);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('delete') + '?')) {
      deleteMenuItem(id);
    }
  };

  const MenuList = ({ title, items }: { title: string, items: MenuItem[] }) => (
    <Card className="mb-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white">
        <MenuIcon size={18} className="text-primary-500" />
        {title}
      </h3>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-4">
               <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                 {item.order}
               </div>
               <div>
                 <p className="font-medium text-gray-900 dark:text-white">{item.label.fa} / {item.label.en}</p>
                 <p className="text-xs text-gray-400 font-mono">{item.url}</p>
               </div>
             </div>
             <div className="flex items-center gap-1">
               <button onClick={() => startEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                 <Edit2 size={16} />
               </button>
               <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                 <Trash2 size={16} />
               </button>
             </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400 text-sm italic p-2">No items</p>}
      </div>
    </Card>
  );

  if (isEditing) {
    return (
      <div className="space-y-6">
         <h1 className="text-2xl font-bold dark:text-white">{editForm.id ? t('edit') : t('add_menu_item')}</h1>
         <Card>
           <form onSubmit={handleSave} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('label_fa')}</label>
                   <input 
                     type="text" 
                     value={editForm.label?.fa || ''}
                     onChange={e => setEditForm({...editForm, label: { ...editForm.label!, fa: e.target.value }})}
                     className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                     required
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('label_en')}</label>
                   <input 
                     type="text" 
                     value={editForm.label?.en || ''}
                     onChange={e => setEditForm({...editForm, label: { ...editForm.label!, en: e.target.value }})}
                     className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                   />
                </div>
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('url')}</label>
                <input 
                  type="text" 
                  value={editForm.url || ''}
                  onChange={e => setEditForm({...editForm, url: e.target.value})}
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white ltr"
                  placeholder="/about or https://google.com"
                  required
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('order')}</label>
                  <input 
                    type="number" 
                    value={editForm.order || 0}
                    onChange={e => setEditForm({...editForm, order: parseInt(e.target.value)})}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('location')}</label>
                  <select 
                    value={editForm.location}
                    onChange={e => setEditForm({...editForm, location: e.target.value as any})}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                  >
                    <option value="header">{t('header')}</option>
                    <option value="footer">{t('footer')}</option>
                  </select>
                </div>
             </div>

             <div className="flex justify-end gap-2 pt-4">
               <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
               <Button type="submit">{t('save')}</Button>
             </div>
           </form>
         </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{t('menu_manager')}</h1>
        <Button onClick={() => startEdit()}>
          <Plus size={18} className="mr-2" />
          {t('add_menu_item')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MenuList title={t('header')} items={headerMenus} />
        <MenuList title={t('footer')} items={footerMenus} />
      </div>
    </div>
  );
};