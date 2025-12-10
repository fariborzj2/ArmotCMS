import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { UserPlus, Trash2, Edit2, Shield, Image as ImageIcon, Search as SearchIcon, ChevronLeft, Save } from 'lucide-react';
import { User } from '../../types';
import { MediaSelector } from '../../components/media/MediaSelector';
import { Pagination } from '../../components/ui/Pagination';

export const UserManager = () => {
  const { t } = useApp();
  
  // Mock Users State (Ideally this would come from AppContext)
  const [users, setUsers] = useState<User[]>([
    { username: 'admin', email: 'admin@armot.com', role: 'admin', fullName: 'Super Admin', bio: 'The boss.' },
    { username: 'editor_sarah', email: 'sarah@example.com', role: 'editor', fullName: 'Sarah Jones', bio: 'Content Editor' },
    { username: 'john_doe', email: 'john@example.com', role: 'user', fullName: 'John Doe', mobile: '09123456789' },
    { username: 'alex_writer', email: 'alex@example.com', role: 'editor', fullName: 'Alex Smith', bio: 'Writes blogs.' },
    { username: 'jane_user', email: 'jane@example.com', role: 'user', fullName: 'Jane Doe' },
    { username: 'mike_t', email: 'mike@example.com', role: 'user', fullName: 'Mike Tyson' },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState<Partial<User>>({});
  const [showMediaModal, setShowMediaModal] = useState(false);
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedUsers = filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handleDelete = (email: string) => {
    if (confirm(t('delete') + '?')) {
        setUsers(users.filter(u => u.email !== email));
    }
  };

  const startEdit = (user?: User) => {
    if (user) {
        setEditUser(user);
    } else {
        setEditUser({
            username: '',
            email: '',
            role: 'user',
            fullName: '',
            mobile: '',
            bio: '',
            avatar: ''
        });
    }
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser.username || !editUser.email) return;

    const existingIndex = users.findIndex(u => u.email === editUser.email); 

    if (existingIndex >= 0) {
        const updatedUsers = [...users];
        updatedUsers[existingIndex] = editUser as User;
        setUsers(updatedUsers);
    } else {
        setUsers([...users, editUser as User]);
    }
    setIsEditing(false);
  };

  // Modern Input Style
  const inputClass = "w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent hover:bg-white hover:border-gray-200 dark:hover:bg-gray-900 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/10 outline-none text-gray-900 dark:text-white transition-all duration-300 text-sm font-medium";
  const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5 ml-1";

  if (isEditing) {
      return (
          <div className="space-y-6 pb-24">
              <div className="flex items-center gap-4">
                  <button onClick={() => setIsEditing(false)} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <ChevronLeft size={24} className="rtl:rotate-180" />
                  </button>
                  <h1 className="text-2xl font-black dark:text-white">{editUser.email ? t('edit_user') : t('add_user')}</h1>
              </div>
              
              <Card>
                  <form onSubmit={handleSave} className="space-y-6">
                      <div className="flex flex-col items-center justify-center mb-8">
                           <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden mb-3 border-4 border-white dark:border-gray-800 shadow-xl relative group cursor-pointer transition-transform hover:scale-105" onClick={() => setShowMediaModal(true)}>
                               {editUser.avatar ? (
                                   <img src={editUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                               ) : (
                                   <ImageIcon size={32} className="text-gray-400" />
                               )}
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                   <Edit2 size={24} className="text-white" />
                               </div>
                           </div>
                           <span className="text-xs font-bold text-primary-500 uppercase tracking-wide">{t('avatar')}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                               <label className={labelClass}>{t('full_name')}</label>
                               <input 
                                   type="text" 
                                   value={editUser.fullName || ''}
                                   onChange={e => setEditUser({...editUser, fullName: e.target.value})}
                                   className={inputClass}
                                   required
                               />
                           </div>

                           <div>
                               <label className={labelClass}>{t('username')}</label>
                               <input 
                                   type="text" 
                                   value={editUser.username || ''}
                                   onChange={e => setEditUser({...editUser, username: e.target.value})}
                                   className={inputClass}
                                   required
                               />
                           </div>

                           <div>
                               <label className={labelClass}>{t('email')}</label>
                               <input 
                                   type="email" 
                                   value={editUser.email || ''}
                                   onChange={e => setEditUser({...editUser, email: e.target.value})}
                                   className={inputClass}
                                   required
                                   disabled={!!users.find(u => u.email === editUser.email && u.role === 'admin' && editUser.role !== 'admin')} // Lock admin email basically
                               />
                           </div>

                           <div>
                               <label className={labelClass}>{t('mobile')}</label>
                               <input 
                                   type="tel" 
                                   value={editUser.mobile || ''}
                                   onChange={e => setEditUser({...editUser, mobile: e.target.value})}
                                   className={inputClass}
                               />
                           </div>
                           
                           <div>
                               <label className={labelClass}>{t('role')}</label>
                               <div className="relative">
                                   <select 
                                       value={editUser.role || 'user'}
                                       onChange={e => setEditUser({...editUser, role: e.target.value as any})}
                                       className={`${inputClass} appearance-none cursor-pointer`}
                                   >
                                       <option value="user">{t('role_user_desc')}</option>
                                       <option value="editor">{t('role_editor_desc')}</option>
                                       <option value="admin">{t('role_admin_desc')}</option>
                                   </select>
                                   <div className="absolute top-1/2 right-4 rtl:right-auto rtl:left-4 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronLeft size={16} className="-rotate-90" />
                                   </div>
                               </div>
                           </div>
                      </div>

                      <div>
                           <label className={labelClass}>{t('bio')}</label>
                           <textarea 
                               value={editUser.bio || ''}
                               onChange={e => setEditUser({...editUser, bio: e.target.value})}
                               className={`${inputClass} h-32 resize-none`}
                           />
                      </div>
                  </form>
              </Card>

              {/* Sticky Save Button */}
              <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-12 md:bottom-12 flex justify-end z-30 pointer-events-none">
                <Button 
                    onClick={handleSave} 
                    size="lg"
                    className="shadow-2xl shadow-primary-600/40 rounded-full px-8 pointer-events-auto transform hover:scale-105 transition-all"
                >
                    <Save size={20} className="mr-2" />
                    {t('save')}
                </Button>
              </div>
              
              {showMediaModal && (
                <MediaSelector 
                    context="user"
                    onClose={() => setShowMediaModal(false)}
                    onSelect={(url) => {
                        setEditUser({...editUser, avatar: url});
                    }}
                />
               )}
          </div>
      );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black dark:text-white">{t('users')}</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
            <input 
                type="text" 
                placeholder={t('search_placeholder_admin')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-4 rtl:pl-4 rtl:pr-12 py-3.5 rounded-2xl border-none bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-4">
                <SearchIcon size={20} />
            </div>
        </div>
        <Button onClick={() => startEdit()} size="lg" className="rounded-2xl">
          <UserPlus size={20} className="mr-2" />
          {t('add_user')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
        {paginatedUsers.map((user) => (
            <div key={user.email} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-transparent dark:border-gray-700/50 hover:shadow-md transition-all relative overflow-hidden group">
                {/* Role Badge - Adjusted for RTL */}
                <div className={`absolute top-0 right-0 rtl:right-auto rtl:left-0 px-3 py-1.5 rounded-bl-2xl rtl:rounded-bl-none rtl:rounded-br-2xl text-[10px] font-bold uppercase tracking-wider
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 
                      user.role === 'editor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {t(user.role)}
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0 overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-lg">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-gray-400">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 pt-2">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg">{user.fullName || user.username}</h3>
                        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                    </div>
                </div>
                
                <div className="space-y-2 mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-300 flex justify-between border-b border-dashed border-gray-100 dark:border-gray-700 pb-2">
                        <span className="text-gray-400">{t('email')}</span>
                        <span className="truncate max-w-[150px]">{user.email}</span>
                    </div>
                    {user.mobile && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex justify-between border-b border-dashed border-gray-100 dark:border-gray-700 pb-2">
                            <span className="text-gray-400">{t('mobile')}</span>
                            <span>{user.mobile}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button onClick={() => startEdit(user)} className="flex-1 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2">
                        <Edit2 size={16} /> {t('edit')}
                    </button>
                    {user.role !== 'admin' && (
                        <button onClick={() => handleDelete(user.email)} className="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
                            <Trash2 size={16} /> {t('delete')}
                        </button>
                    )}
                </div>
            </div>
        ))}
      </div>

      <Pagination 
            totalItems={filteredUsers.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
      />
    </div>
  );
};