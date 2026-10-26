import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getContacts, createContact, deleteContact } from '../store/slices/contactSlice';
import { Plus, Trash2, User, Phone, Mail, Heart, ChevronLeft, Shield, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contacts = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', relationship: '' });
  const dispatch = useDispatch();
  const { contacts, isLoading } = useSelector((state) => state.contacts);

  useEffect(() => { dispatch(getContacts()); }, [dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createContact(formData));
    setFormData({ name: '', phone: '', email: '', relationship: '' });
    setShowAddForm(false);
  };

  return (
    <div className="page-shell pb-32">
      <header className="theme-header sticky top-0 z-50 px-6 py-5">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link to="/" className="rounded-2xl bg-white/80 p-2.5 text-pink-500 shadow-sm ring-1 ring-pink-100 transition-all hover:bg-pink-50">
            <ChevronLeft size={20} />
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Circle of trust</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 p-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="section-title text-3xl text-[color:var(--ink)]">Trusted circle</h1>
            <p className="mt-1 text-sm font-medium text-[color:var(--muted)]">Your safety network.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`rounded-[1.5rem] p-4 shadow-sm transition-all active:scale-95 ${showAddForm ? 'bg-white text-[color:var(--muted)] ring-1 ring-pink-100' : 'bg-gradient-to-br from-pink-400 to-pink-500 text-white'}`}
          >
            {showAddForm ? <X size={22} /> : <Plus size={22} />}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={onSubmit} className="soft-card rounded-[2rem] space-y-5 p-6 animate-slide-up">
            <div className="grid grid-cols-1 gap-4">
              {[
                { n: 'name', icon: User, ph: 'Full name' },
                { n: 'phone', icon: Phone, ph: 'Mobile number' },
                { n: 'relationship', icon: Heart, ph: 'Relation' },
                { n: 'email', icon: Mail, ph: 'Email (optional)' }
              ].map((f) => (
                <div key={f.n} className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-pink-400">
                    <f.icon size={18} />
                  </div>
                  <input
                    name={f.n}
                    required={f.n !== 'email'}
                    placeholder={f.ph}
                    className="soft-input"
                    value={formData[f.n]}
                    onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <button type="submit" className="soft-button uppercase tracking-[0.12em] text-xs">
              Add to circle
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" /></div>
        ) : contacts.length === 0 ? (
          <div className="soft-card flex flex-col items-center rounded-[2rem] p-12 text-center">
            <div className="mb-4 rounded-full bg-pink-50 p-5 text-pink-300"><User size={42} /></div>
            <p className="text-lg font-semibold text-[color:var(--ink)]">No contacts added yet.</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Start building your safety circle.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {contacts.map((contact) => (
              <div key={contact._id} className="soft-card group flex items-center justify-between rounded-[1.8rem] p-5 transition-all hover:border-pink-200">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-gradient-to-br from-pink-100 to-pink-200 text-xl font-bold text-pink-500 shadow-inner">
                    {contact.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[color:var(--ink)]">{contact.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-pink-500">{contact.relationship}</span>
                      <span className="flex items-center gap-1 text-xs font-medium text-[color:var(--muted)]"><Phone size={12} className="text-pink-300" /> {contact.phone}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.confirm('Remove from circle?') && dispatch(deleteContact(contact._id))}
                  className="rounded-2xl p-3 text-gray-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
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

export default Contacts;
