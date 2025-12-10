import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Edit2, Trash2, Menu as MenuIcon, GripVertical, CornerDownRight } from 'lucide-react';
import { MenuItem } from '../../types';
import { DynamicIcon } from '../../components/ui/DynamicIcon';

export const MenuManager = () => {
  const { t, menus, addMenuItem, updateMenuItem, deleteMenuItem, reorderMenus } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // Helper to sort menu items
  const sortMenus = (items: MenuItem[]) => items.sort((a, b) => a.order - b.order);

  // Group menus by location
  const headerMenus = sortMenus(menus.filter(m => m.location === 'header'));
  const footerMenus = sortMenus(menus.filter(m => m.location === 'footer'));

  const startEdit = (item?: MenuItem) => {
    if (item) {
      setEditForm(item);
    } else {
      setEditForm({
        label: { fa: '', en: '' },
        url: '',
        order: menus.length + 1,
        location: 'header',
        parentId: '',
        icon: ''
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
        location: editForm.location as 'header' | 'footer',
        parentId: editForm.parentId || undefined,
        icon: editForm.icon || undefined
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

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
      setDraggedItemId(id);
      e.dataTransfer.effectAllowed = 'move';
      // Set a transparent drag image if needed, or rely on default
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, targetId: string, parentId: string | undefined, location: 'header' | 'footer') => {
      e.preventDefault();
      if (!draggedItemId || draggedItemId === targetId) return;

      // Filter siblings (same parent, same location)
      const siblings = menus
        .filter(m => m.location === location && (m.parentId || undefined) === (parentId || undefined))
        .sort((a, b) => a.order - b.order);

      const fromIndex = siblings.findIndex(m => m.id === draggedItemId);
      const toIndex = siblings.findIndex(m => m.id === targetId);

      if (fromIndex === -1 || toIndex === -1) return;

      const updatedSiblings = [...siblings];
      const [movedItem] = updatedSiblings.splice(fromIndex, 1);
      updatedSiblings.splice(toIndex, 0, movedItem);

      // Create update payload
      const batchUpdate = updatedSiblings.map((item, idx) => ({
          ...item,
          order: idx + 1
      }));

      reorderMenus(batchUpdate);
      setDraggedItemId(null);
  };

  const MenuItemRow: React.FC<{ item: MenuItem, depth?: number, items: MenuItem[], location: 'header' | 'footer' }> = ({ item, depth = 0, items, location }) => {
      // Find children
      const children = items.filter(child => child.parentId === item.id);
      
      return (
          <>
            <div 
                className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-700 ${draggedItemId === item.id ? 'opacity-50 border-dashed border-2' : ''}`}
                style={{ marginRight: depth * 24 + 'px' }} // RTL indent
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id, item.parentId, location)}
            >
                 <div className="flex items-center gap-3 w-full overflow-hidden">
                   <div className="cursor-move text-gray-300 hover:text-gray-500 p-1">
                        <GripVertical size={16} />
                   </div>

                   {/* Visual Hierarchy Indicator */}
                   {depth > 0 && <CornerDownRight size={16} className="text-gray-400" />}

                   {/* Icon Preview */}
                   {item.icon && <DynamicIcon name={item.icon} size={16} className="text-gray-500" />}

                   <div className="flex-1 min-w-0">
                     <p className="font-medium text-gray-900 dark:text-white truncate">{item.label.fa} / {item.label.en}</p>
                     <p className="text-xs text-gray-400 font-mono truncate ltr text-left">{item.url}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-1 shrink-0 ml-2 rtl:mr-2 rtl:ml-0">
                   <button onClick={() => startEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                     <Edit2 size={16} />
                   </button>
                   <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                     <Trash2 size={16} />
                   </button>
                 </div>
            </div>
            {/* Recursively render children */}
            {children.map(child => (
                <MenuItemRow key={child.id} item={child} depth={depth + 1} items={items} location={location} />
            ))}
          </>
      );
  };

  const MenuList = ({ title, items, location }: { title: string, items: MenuItem[], location: 'header' | 'footer' }) => {
      // Get only root items to start recursion
      const rootItems = items.filter(item => !item.parentId);

      return (
        <Card className="mb-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white">
                <MenuIcon size={18} className="text-primary-500" />
                {title}
              </h3>
          </div>
          <div className="space-y-2 flex-1">
            {rootItems.map((item) => (
               <MenuItemRow key={item.id} item={item} items={items} location={location} />
            ))}
            {items.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center text-gray-400 text-sm">
                    {t('no_results')}
                </div>
            )}
          </div>
        </Card>
      );
  };

  if (isEditing) {
    // Filter available parents (exclude self and own children to prevent circles - simplified check here)
    const availableParents = menus.filter(m => m.location === editForm.location && m.id !== editForm.id);

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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('order')}</label>
                  <input 
                    type="number" 
                    value={editForm.order || 0}
                    onChange={e => setEditForm({...editForm, order: parseInt(e.target.value)})}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                  />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('parent_menu')}</label>
                    <select 
                        value={editForm.parentId || ''}
                        onChange={e => setEditForm({...editForm, parentId: e.target.value})}
                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                    >
                        <option value="">{t('no_parent')}</option>
                        {availableParents.map(p => (
                            <option key={p.id} value={p.id}>{p.label.fa} / {p.label.en}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('icon_name')}</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={editForm.icon || ''}
                            onChange={e => setEditForm({...editForm, icon: e.target.value})}
                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                            placeholder="Home, User, Star..."
                        />
                        {editForm.icon && (
                            <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2">
                                <DynamicIcon name={editForm.icon} size={20} className="text-primary-500" />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('icon_hint')}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <MenuList title={t('header')} items={headerMenus} location="header" />
        <MenuList title={t('footer')} items={footerMenus} location="footer" />
      </div>
    </div>
  );
};