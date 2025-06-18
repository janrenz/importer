'use client';

import { User } from '@/types';
import { useState, useMemo } from 'react';

interface UserListProps {
  users: User[];
  selectedUsers: Set<string>;
  onSelectionChange: (userId: string, selected: boolean) => void;
  onSelectAll: (filteredUsers: User[]) => void;
  onDeselectAll: () => void;
}

export default function UserList({ 
  users, 
  selectedUsers, 
  onSelectionChange, 
  onSelectAll, 
  onDeselectAll
}: UserListProps) {
  const [filter, setFilter] = useState<'all' | 'students' | 'teachers'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Apply type filter
    if (filter === 'students') {
      filtered = filtered.filter(user => user.userType === 'student');
    } else if (filter === 'teachers') {
      filtered = filtered.filter(user => user.userType === 'teacher');
    }
    
    // Apply grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(user => user.klasse === gradeFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.schildId.toLowerCase().includes(query) ||
        (user.klasse && user.klasse.toLowerCase().includes(query))
      );
    }
    
    // Sort to show teachers first, then students
    filtered = filtered.sort((a, b) => {
      if (a.userType === 'teacher' && b.userType === 'student') return -1;
      if (a.userType === 'student' && b.userType === 'teacher') return 1;
      // If same type, sort alphabetically by last name
      return a.lastName.localeCompare(b.lastName);
    });
    
    return filtered;
  }, [users, filter, gradeFilter, searchQuery]);

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Keine Benutzer geladen. Bitte laden Sie eine XML-Datei hoch.</p>
      </div>
    );
  }

  const selectedCount = selectedUsers.size;
  const totalCount = users.length;
  const filteredCount = filteredUsers.length;
  const studentsCount = users.filter(u => u.userType === 'student').length;
  const teachersCount = users.filter(u => u.userType === 'teacher').length;
  
  // Get unique grades/classes for filtering
  const availableGrades = useMemo(() => {
    const grades = users
      .filter(u => u.klasse && u.klasse.trim())
      .map(u => u.klasse!)
      .filter((grade, index, arr) => arr.indexOf(grade) === index)
      .sort();
    return grades;
  }, [users]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Benutzer
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {selectedCount} von {totalCount} Benutzern ausgewählt
            {filteredCount !== totalCount && (
              <span className="ml-2 text-sm">
                ({filteredCount} angezeigt)
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Benutzer suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* User Type Filter */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    filter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Alle ({totalCount})
                </button>
                <button
                  onClick={() => setFilter('students')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    filter === 'students'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Schüler ({studentsCount})
                </button>
                <button
                  onClick={() => setFilter('teachers')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    filter === 'teachers'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Lehrer ({teachersCount})
                </button>
              </div>

              {/* Grade Filter */}
              {availableGrades.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Klasse:
                  </label>
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">Alle Klassen</option>
                    {availableGrades.map(grade => (
                      <option key={grade} value={grade}>
                        {grade} ({users.filter(u => u.klasse === grade).length})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectAll(filteredUsers.filter(user => user.userType === 'teacher' && user.email && user.email.trim() !== ''))}
            className="btn-secondary text-sm px-3 py-2"
          >
            Alle Lehrer auswählen
          </button>
          <button
            onClick={onDeselectAll}
            className="btn-secondary text-sm px-3 py-2"
          >
            Auswahl löschen
          </button>
        </div>
      </div>

      {/* Student Notice */}
      {studentsCount > 0 && (
        <div className="card p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.86-.833-2.63 0L4.184 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">Hinweis zu Schüleraccounts</h4>
              <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                Schüleraccounts sind in telli noch nicht unterstützt. Nur Lehreraccounts können synchronisiert werden.
              </p>
            </div>
          </div>
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery.trim() || filter !== 'all' 
              ? 'Keine Benutzer entsprechen den aktuellen Filtern.' 
              : 'Keine Benutzer in der Datei gefunden.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user, index) => {
            const isStudentDisabled = user.userType === 'student';
            const hasNoEmail = !user.email || user.email.trim() === '';
            const isDisabled = isStudentDisabled || hasNoEmail;
            return (
            <div key={user.id} className="animate-fade-in" style={{animationDelay: `${index * 0.05}s`}}>
              <div className={`card p-5 transition-all duration-200 ${
                isDisabled 
                  ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' 
                  : `cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
                      selectedUsers.has(user.id) 
                        ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`
              }`}
              onClick={() => !isDisabled && onSelectionChange(user.id, !selectedUsers.has(user.id))}
              >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    user.userType === 'student' 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    {user.userType === 'student' ? (
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.userType === 'student' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {user.userType === 'student' ? 'Schüler' : 'Lehrer'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  disabled={isDisabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) {
                      onSelectionChange(user.id, e.target.checked);
                    }
                  }}
                  className={`h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded-md ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.firstName} {user.lastName}
                </h3>
                <p className={`text-sm truncate ${
                  hasNoEmail 
                    ? 'text-red-600 dark:text-red-400 italic' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {hasNoEmail ? 'Keine E-Mail-Adresse hinterlegt' : user.email}
                </p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>{user.schildId}</span>
                  </div>
                  {user.klasse && (
                    <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{user.klasse}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          );
          })}
        </div>
      )}
    </div>
  );
}