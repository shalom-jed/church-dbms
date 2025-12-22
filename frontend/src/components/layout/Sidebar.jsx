import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
const linkBase = 'flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium';
export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className='hidden md:flex md:flex-col w-60 bg-slate-900 border-r border-slate-800'>
      <div className='px-4 py-3 border-b border-slate-800 flex items-center gap-2'>
        <div className='h-8 w-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-xs font-bold'>
          CDM
        </div>
        <div>
          <div className='text-xs font-semibold'>Church Data Management</div>
          <div className='text-[10px] text-slate-400'>{user?.name} · {user?.role}</div>
        </div>
      </div>
      <nav className='flex-1 overflow-y-auto px-2 py-3 text-[11px]'>
        <NavLink to='/' end className={({ isActive }) => `${linkBase} ${isActive ? 'bg-slate-800 text-slate-50' : 'text-slate-300 hover:bg-slate-800/60'}`}>
          Dashboard
        </NavLink>
        <NavLink to='/members' className={({ isActive }) => `${linkBase} ${isActive ? 'bg-slate-800 text-slate-50' : 'text-slate-300 hover:bg-slate-800/60'}`}>
          Members
        </NavLink>
        <NavLink to='/groups' className={({ isActive }) => `${linkBase} ${isActive ? 'bg-slate-800 text-slate-50' : 'text-slate-300 hover:bg-slate-800/60'}`}>
          Small Groups
        </NavLink>
        <NavLink to='/attendance' className={({ isActive }) => `${linkBase} ${isActive ? 'bg-slate-800 text-slate-50' : 'text-slate-300 hover:bg-slate-800/60'}`}>
          Attendance
        </NavLink>
        <NavLink to='/donations' className={({ isActive }) => `${linkBase} ${isActive ? 'bg-slate-800 text-slate-50' : 'text-slate-300 hover:bg-slate-800/60'}`}>
          Donations
        </NavLink>
        <NavLink to='/events' className={({ isActive }) => `${linkBase} ${isActive ? 'bg-slate-800 text-slate-50' : 'text-slate-300 hover:bg-slate-800/60'}`}>
          Events
        </NavLink>
        <NavLink to='/reports' className={({ isActive }) => `${linkBase} ${isActive ? 'bg-slate-800 text-slate-50' : 'text-slate-300 hover:bg-slate-800/60'}`}>
          Reports
        </NavLink>
        <NavLink to='/settings' className={({ isActive }) => `${linkBase} ${isActive ? 'bg-slate-800 text-slate-50' : 'text-slate-300 hover:bg-slate-800/60'}`}>
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}