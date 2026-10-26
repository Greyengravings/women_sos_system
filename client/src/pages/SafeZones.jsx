import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSafeZones, createSafeZone, deleteSafeZone } from '../store/slices/safeZoneSlice';
import useGeolocation from '../hooks/useGeolocation';
import { Plus, Trash2, MapPin, ShieldCheck, Navigation, ChevronLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({ click(e) { onLocationSelect(e.latlng); } });
  return null;
};

const SafeZones = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', latitude: '', longitude: '', radius: 500 });
  const dispatch = useDispatch();
  const { safeZones, isLoading } = useSelector((state) => state.safeZones);
  const { location, getLocation } = useGeolocation();

  useEffect(() => { dispatch(getSafeZones()); getLocation(); }, [dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createSafeZone({
      name: formData.name,
      location: { latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) },
      radius: parseInt(formData.radius)
    }));
    setFormData({ name: '', latitude: '', longitude: '', radius: 500 });
    setShowAddForm(false);
  };

  return (
    <div className="page-shell pb-32">
      <header className="theme-header sticky top-0 z-50 px-6 py-5">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link to="/" className="rounded-2xl bg-white/80 p-2.5 text-pink-500 shadow-sm ring-1 ring-pink-100 transition-all hover:bg-pink-50">
            <ChevronLeft size={20} />
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Safe zones</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 p-6 animate-fade-in">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="section-title text-3xl text-[color:var(--ink)]">Safe zones</h1>
            <p className="mt-1 text-sm font-medium text-[color:var(--muted)]">Mark places where you feel secure.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`rounded-[1.5rem] p-4 shadow-sm transition-all active:scale-95 ${showAddForm ? 'bg-white text-[color:var(--muted)] ring-1 ring-pink-100' : 'bg-gradient-to-br from-pink-400 to-pink-500 text-white'}`}
          >
            <Plus size={22} />
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={onSubmit} className="soft-card rounded-[2rem] space-y-5 p-6 animate-slide-up">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="ml-2 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">Zone name</label>
                <input
                  name="name"
                  required
                  placeholder="Home, office..."
                  className="soft-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="ml-2 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">Radius (m)</label>
                <input
                  name="radius"
                  type="number"
                  required
                  className="soft-input"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                />
              </div>
            </div>

            <div className="relative h-[260px] overflow-hidden rounded-[1.6rem] border border-pink-100">
              <MapContainer center={location.loaded ? [location.coordinates.lat, location.coordinates.lng] : [20, 77]} zoom={13} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onLocationSelect={(ll) => setFormData({ ...formData, latitude: ll.lat, longitude: ll.lng })} />
                {formData.latitude && <Marker position={[formData.latitude, formData.longitude]} />}
              </MapContainer>
              <div className="absolute right-4 top-4 z-[500]">
                <button
                  type="button"
                  onClick={() => location.loaded && setFormData({ ...formData, latitude: location.coordinates.lat, longitude: location.coordinates.lng })}
                  className="rounded-2xl bg-white p-3 text-pink-500 shadow-lg transition-all hover:bg-pink-50 active:scale-95"
                >
                  <Navigation size={18} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={!formData.latitude} className="soft-button disabled:cursor-not-allowed disabled:opacity-60">
              Create zone
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" /></div>
        ) : safeZones.length === 0 ? (
          <div className="soft-card rounded-[2rem] border-dashed border-2 border-pink-100 p-12 text-center">
            <p className="text-lg font-semibold text-[color:var(--ink)]">No safe zones defined yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {safeZones.map((zone) => (
              <div key={zone._id} className="soft-card flex items-center justify-between gap-4 rounded-[1.7rem] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-500">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[color:var(--ink)]">{zone.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">
                      <MapPin size={12} /> {zone.radius}m radius
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.confirm('Delete this safe zone?') && dispatch(deleteSafeZone(zone._id))}
                  className="rounded-2xl p-3 text-gray-300 transition-all hover:bg-rose-50 hover:text-rose-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SafeZones;
