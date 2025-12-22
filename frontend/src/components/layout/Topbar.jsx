// frontend/src/components/layout/Topbar.jsx

import { useAuth } from '../../context/AuthContext.jsx';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Church Data Management System</div>
          <div className="text-[10px] text-slate-400">
            Assembly of God Church, Ruwanwella
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-[11px] text-slate-300">
                {user.name || user.email} · {user.role}
              </span>
              <button
                onClick={logout}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px]"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}