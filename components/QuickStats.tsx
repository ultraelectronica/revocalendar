'use client';

interface QuickStatsProps {
  stats: {
    total: number;
    completed: number;
    upcoming: number;
    todayCount: number;
    overdue: number;
    completionRate: number;
  };
}

export default function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
      {/* Today */}
      <div className="glass-card p-3 sm:p-4 group hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white">{stats.todayCount}</div>
            <div className="text-[10px] sm:text-xs text-white/50">Today</div>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="glass-card p-3 sm:p-4 group hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white">{stats.upcoming}</div>
            <div className="text-[10px] sm:text-xs text-white/50">Upcoming</div>
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="glass-card p-3 sm:p-4 group hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white">{stats.completed}</div>
            <div className="text-[10px] sm:text-xs text-white/50">Completed</div>
          </div>
        </div>
      </div>

      {/* Overdue */}
      <div className="glass-card p-3 sm:p-4 group hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
            stats.overdue > 0 
              ? 'bg-gradient-to-br from-red-500/20 to-red-500/5' 
              : 'bg-gradient-to-br from-gray-500/20 to-gray-500/5'
          }`}>
            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${stats.overdue > 0 ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <div className={`text-xl sm:text-2xl font-bold ${stats.overdue > 0 ? 'text-red-400' : 'text-white'}`}>
              {stats.overdue}
            </div>
            <div className="text-[10px] sm:text-xs text-white/50">Overdue</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="col-span-2 sm:col-span-4 lg:col-span-2 glass-card p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs text-white/50">Completion Rate</span>
            <span className="text-xs sm:text-sm font-bold text-cyan-400">{stats.completionRate}%</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
