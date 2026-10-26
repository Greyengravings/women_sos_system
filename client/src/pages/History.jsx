import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSOSHistory } from '../store/slices/sosSlice';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const History = () => {
  const dispatch = useDispatch();
  const { history, isLoading } = useSelector((state) => state.sos);

  useEffect(() => { dispatch(getSOSHistory()); }, [dispatch]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'CLOSED': return { label: 'Resolved', color: 'green', icon: CheckCircle };
      case 'CANCELLED': return { label: 'Cancelled', color: 'gray', icon: XCircle };
      default: return { label: 'Active', color: 'red', icon: AlertCircle };
    }
  };

  return (
    <div className="page-shell pb-32">
      <header className="theme-header sticky top-0 z-50 px-6 py-5">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link to="/" className="rounded-2xl bg-white/80 p-2.5 text-pink-500 shadow-sm ring-1 ring-pink-100 transition-all hover:bg-pink-50">
            <ChevronLeft size={20} />
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Activity log</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 p-6 animate-fade-in">
        <div>
          <h1 className="section-title text-3xl text-[color:var(--ink)]">Alert history</h1>
          <p className="mt-1 text-sm font-medium text-[color:var(--muted)]">Tracking your previous safety events.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" /></div>
        ) : history.length === 0 ? (
          <div className="soft-card flex flex-col items-center rounded-[2rem] p-12 text-center">
            <p className="text-lg font-semibold text-[color:var(--ink)]">No history logs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {history.map((event) => {
              const status = getStatusInfo(event.status);
              const statusClasses = {
                green: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
                gray: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
                red: 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'
              };
              const iconMap = {
                green: CheckCircle,
                gray: XCircle,
                red: AlertCircle
              };
              const IconComponent = iconMap[status.color] || AlertCircle;

              return (
                <div key={event._id} className="soft-card relative overflow-hidden rounded-[1.9rem] p-5 transition-all hover:border-pink-200">
                  {event.status === 'ACTIVE' && <div className="absolute left-0 top-0 h-full w-1 bg-rose-500 animate-pulse"></div>}

                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-[1.2rem] p-3 ${statusClasses[status.color]}`}>
                        <IconComponent size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[color:var(--ink)]">SOS triggered</h3>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">
                          {new Date(event.activatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${statusClasses[status.color]}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex min-w-[150px] flex-1 items-center gap-2 rounded-2xl bg-pink-50/70 px-3 py-3 text-xs font-semibold text-[color:var(--ink)]">
                      <Clock size={16} className="text-pink-400" />
                      {new Date(event.activatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex min-w-[150px] flex-1 items-center gap-2 rounded-2xl bg-pink-50/70 px-3 py-3 text-xs font-semibold text-[color:var(--ink)]">
                      <MapPin size={16} className="text-pink-400" />
                      {event.location ? `${event.location.latitude.toFixed(2)}, ${event.location.longitude.toFixed(2)}` : 'Location unavailable'}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">ID: #{event._id.slice(-6).toUpperCase()}</span>
                    <button className="text-xs font-black uppercase tracking-[0.14em] text-pink-500 transition-colors hover:text-pink-600">Details →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
