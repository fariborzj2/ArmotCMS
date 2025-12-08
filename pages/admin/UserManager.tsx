
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { UserPlus, Trash2, Edit2, Shield, Image as ImageIcon, Search as SearchIcon } from 'lucide-react';
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
  const itemsPerPage = 5;

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

    // Check if we are updating existing user
    const existingIndex = users.findIndex(u => u.email === editUser.email); 

    if (existingIndex >= 0) {
        // Update
        const updatedUsers = [...users];
        updatedUsers[existingIndex] = editUser as User;
        setUsers(updatedUsers);
    } else {
        // Create
        setUsers([...users, editUser as User]);
    }
    setIsEditing(false);
  };

  if (isEditing) {
      return (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold dark:text-white">{editUser.email ? t('edit_user') : t('add_user')}</h1>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
              </div>
              
              <Card>
                  <form onSubmit={handleSave} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* Avatar Section */}
                           <div className="md:col-span-2 flex flex-col items-center justify-center mb-4">
                               <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden mb-2 border-2 border-dashed border-gray-300 dark:border-gray-700 relative group cursor-pointer" onClick={() => setShowMediaModal(true)}>
                                   {editUser.avatar ? (
                                       <img src={editUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                                   ) : (
                                       <ImageIcon size={32} className="text-gray-400" />
                                   )}
                                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                       <span className="text-white text-xs">{t('upload_file')}</span>
                                   </div>
                               </div>
                               <button type="button" onClick={() => setShowMediaModal(true)} className="text-sm text-primary-500 hover:underline">{t('select_media')}</button>
                           </div>

                           <div>
                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name')}</label>
                               <input 
                                   type="text" 
                                   value={editUser.fullName || ''}
                                   onChange={e => setEditUser({...editUser, fullName: e.target.value})}
                                   className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                                   required
                               />
                           </div>

                           <div>
                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('username')}</label>
                               <input 
                                   type="text" 
                                   value={editUser.username || ''}
                                   onChange={e => setEditUser({...editUser, username: e.target.value})}
                                   className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                                   required
                               />
                           </div>

                           <div>
                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                               <input 
                                   type="email" 
                                   value={editUser.email || ''}
                                   onChange={e => setEditUser({...editUser, email: e.target.value})}
                                   className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                                   required
                                   disabled={!!users.find(u => u.email === editUser.email)} 
                               />
                           </div>

                           <div>
                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('mobile')}</label>
                               <input 
                                   type="tel" 
                                   value={editUser.mobile || ''}
                                   onChange={e => setEditUser({...editUser, mobile: e.target.value})}
                                   className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                               />
                           </div>
                           
                           <div>
                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('role')}</label>
                               <select 
                                   value={editUser.role || 'user'}
                                   onChange={e => setEditUser({...editUser, role: e.target.value as any})}
                                   className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                               >
                                   <option value="user">User (Normal)</option>
                                   <option value="editor">Editor (Can manage content)</option>
                                   <option value="admin">Admin (Full Access)</option>
                               </select>
                           </div>
                      </div>

                      <div className="mt-4">
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('bio')}</label>
                           <textarea 
                               value={editUser.bio || ''}
                               onChange={e => setEditUser({...editUser, bio: e.target.value})}
                               className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white h-24"
                           />
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <Button type="submit">{t('save')}</Button>
                      </div>
                  </form>
              </Card>
              
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{t('users')}</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative">
            <input 
                type="text" 
                placeholder={t('search_placeholder_admin')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white w-full md:w-64"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <Button variant="primary" onClick={() => startEdit()}>
          <UserPlus size={18} className="mr-2" />
          {t('add_user')}
        </Button>
      </div>

      <div className="md:bg-white md:dark:bg-gray-800 md:rounded-xl md:shadow-sm md:border md:border-gray-200 md:dark:border-gray-700 overflow-hidden">
        <div className="">
            <table className="w-full text-left rtl:text-right block md:table">
            <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs">
                <tr>
                <th className="px-6 py-3">{t('username')}</th>
                <th className="px-6 py-3">{t('full_name')}</th>
                <th className="px-6 py-3">{t('role')}</th>
                <th className="px-6 py-3 text-right rtl:text-left">{t('actions')}</th>
                </tr>
            </thead>
            <tbody className="block md:table-row-group space-y-4 md:space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedUsers.map((user) => (
                <tr key={user.email} className="block md:table-row bg-white dark:bg-gray-800 md:bg-transparent rounded-xl shadow-sm md:shadow-none border border-gray-200 dark:border-gray-700 md:border-none p-4 md:p-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 font-medium dark:text-white flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                        <span className="md:hidden text-gray-500 text-xs font-bold">{t('username')}</span>
                        <div className="flex items-center gap-3">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p>{user.username}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>
                    </td>
                    <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-gray-500 flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                        <span className="md:hidden text-gray-500 text-xs font-bold">{t('full_name')}</span>
                        {user.fullName || '-'}
                    </td>
                    <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 flex justify-between items-center md:block border-b border-gray-100 dark:border-gray-700 md:border-none">
                        <span className="md:hidden text-gray-500 text-xs font-bold">{t('role')}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 
                              user.role === 'editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                            {user.role === 'admin' && <Shield size={10} />}
                            {user.role}
                        </span>
                    </td>
                    <td className="block md:table-cell px-0 py-2 md:px-6 md:py-4 text-right rtl:text-left flex justify-between items-center md:block">
                        <span className="md:hidden text-gray-500 text-xs font-bold">{t('actions')}</span>
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => startEdit(user)}
                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                            {user.role !== 'admin' && (
                                <button 
                                    onClick={() => handleDelete(user.email)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
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
