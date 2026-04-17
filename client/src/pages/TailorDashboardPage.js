import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';

const API_URL = process.env.REACT_APP_API_URL;

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TIMING_PRESETS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];
const EXPERIENCE_OPTS = ['Less than 1 year','1-2 years','3-5 years','6-10 years','11-15 years','16-20 years','20+ years'];
const SPECIALITY_OPTS = ['Bespoke Suits','Bridal Wear','Embroidery','Alterations','Uniform Stitching','Ethnic Wear','Western Wear','Kids Wear'];

const CAT_META = {
  mens:   { label:"Men's Wear",   icon:'👔', color:'bg-blue-50 border-blue-200',   badge:'bg-blue-100 text-blue-700',   dot:'bg-blue-500',   active:'border-blue-500 bg-blue-50' },
  womens: { label:"Women's Wear", icon:'👗', color:'bg-pink-50 border-pink-200',   badge:'bg-pink-100 text-pink-700',   dot:'bg-pink-500',   active:'border-pink-500 bg-pink-50' },
  kids:   { label:'Kids / Child', icon:'🧒', color:'bg-purple-50 border-purple-200',badge:'bg-purple-100 text-purple-700',dot:'bg-purple-500', active:'border-purple-500 bg-purple-50'},
  alter:  { label:'Alterations',  icon:'✂️', color:'bg-teal-50 border-teal-200',   badge:'bg-teal-100 text-teal-700',   dot:'bg-teal-500',   active:'border-teal-500 bg-teal-50'  },
};

const DEFAULT_SERVICES = {
  mens:   [{id:1,name:'Suit',price:3500},{id:2,name:'Blazer',price:3000},{id:3,name:'Formal Shirt',price:600},{id:4,name:'Trouser',price:700}],
  womens: [{id:5,name:'Salwar Kameez',price:900},{id:6,name:'Blouse',price:400},{id:7,name:'Lehenga',price:4500}],
  kids:   [{id:8,name:'School Uniform',price:500},{id:9,name:'Kids Frock',price:450},{id:10,name:'Kids Suit',price:800}],
  alter:  [{id:11,name:'Hemming',price:150},{id:12,name:'Fitting Alteration',price:300},{id:13,name:'Zip Replace',price:120}],
};

/* ── Reusable UI ── */
function SectionCard({ children, className='' }) {
  return <div className={`bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden ${className}`}>{children}</div>;
}
function SectionHeader({ icon, title, action }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="font-bold text-xs tracking-widest uppercase text-stone-700">{title}</span>
      </div>
      {action}
    </div>
  );
}
function InputField({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</label>}
      <input className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-stone-300 placeholder:font-normal w-full" {...props}/>
    </div>
  );
}
function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${checked?'bg-green-500':'bg-stone-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${checked?'translate-x-6':'translate-x-0.5'}`}/>
    </button>
  );
}

/* ── Home Tab ── */
function HomeTab({ user }) {
  const navigate = useNavigate();
  const stats = [
    {label:'Pending Jobs',value:'3',icon:'⏳',ic:'text-amber-600',bg:'bg-amber-50',path:'/tailor/pending-jobs'},
    {label:'Completed',  value:'28',icon:'✅',ic:'text-green-600', bg:'bg-green-50', path:'/tailor/completed'},
    {label:'Earnings',   value:'₹14.2k',icon:'💰',ic:'text-emerald-600',bg:'bg-emerald-50',path:'/tailor/earnings'},
    {label:'Rating',     value:'4.8★',icon:'🏆',ic:'text-yellow-600',bg:'bg-yellow-50',path:null},
  ];
  const orders = [
    {id:'#1042',customer:'Riya Sharma',item:'Lehenga (Bridal)',status:'In Progress',due:'Feb 28',amount:'₹4,500'},
    {id:'#1041',customer:'Arun Mehta', item:'Sherwani',        status:'Pending',    due:'Mar 2', amount:'₹3,200'},
    {id:'#1040',customer:'Priya Patel',item:'Blouse (Silk)',   status:'Completed',  due:'Feb 22',amount:'₹800'},
  ];
  const sc = {'In Progress':'bg-blue-100 text-blue-700','Pending':'bg-amber-100 text-amber-700','Completed':'bg-green-100 text-green-700'};
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"/>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/[0.06]"/>
        <p className="text-orange-200 text-xs font-semibold relative z-10">{greet} 👋</p>
        <h2 className="text-white font-black text-2xl mt-1 relative z-10" style={{fontFamily:'Sora,sans-serif'}}>{user?.full_name?.split(' ')[0]}</h2>
        <p className="text-orange-100 text-sm mt-1 relative z-10">You have <span className="font-black text-white">3 pending jobs</span> today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map(s=>(
          <div key={s.label} onClick={()=>s.path&&navigate(s.path)}
            className={`${s.bg} border border-stone-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm ${s.path?'cursor-pointer hover:shadow-md':''} transition-all`}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm">{s.icon}</div>
            <div>
              <div className={`font-black text-xl leading-none ${s.ic}`} style={{fontFamily:'Sora,sans-serif'}}>{s.value}</div>
              <div className="text-stone-400 text-[11px] mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Completion */}
      <SectionCard>
        <div className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🎯</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-stone-700 mb-1.5">Profile Completion</div>
            <div className="bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" style={{width:'82%'}}/>
            </div>
          </div>
          <div className="text-orange-500 font-black text-sm flex-shrink-0">82%</div>
        </div>
      </SectionCard>

      {/* Recent Orders */}
      <SectionCard>
        <SectionHeader icon="📋" title="Recent Orders"/>
        <div className="divide-y divide-stone-50">
          {orders.map(o=>(
            <div key={o.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-bold text-stone-800">{o.customer}</p>
                <p className="text-xs text-stone-400">{o.id} · {o.item}</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc[o.status]}`}>{o.status}</span>
                <p className="text-xs text-stone-400 mt-1">Due {o.due}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ── Orders Tab ── */
function OrdersTab() {
  const [filter, setFilter] = useState('All');
  const filters = ['All','Pending','In Progress','Completed'];
  const orders = [
    {id:'#1042',customer:'Riya Sharma',item:'Lehenga (Bridal)',status:'In Progress',due:'Feb 28',amount:'₹4,500'},
    {id:'#1041',customer:'Arun Mehta', item:'Sherwani',        status:'Pending',    due:'Mar 2', amount:'₹3,200'},
    {id:'#1040',customer:'Priya Patel',item:'Blouse (Silk)',   status:'Completed',  due:'Feb 22',amount:'₹800'},
    {id:'#1039',customer:'Karan Singh',item:'Suit (3-piece)',  status:'Completed',  due:'Feb 20',amount:'₹6,000'},
    {id:'#1038',customer:'Anita Desai',item:'Salwar Kameez',   status:'Pending',    due:'Mar 5', amount:'₹1,200'},
  ];
  const sc = {'In Progress':'bg-blue-100 text-blue-700','Pending':'bg-amber-100 text-amber-700','Completed':'bg-green-100 text-green-700'};
  const filtered = filter==='All' ? orders : orders.filter(o=>o.status===filter);

  return (
    <div className="space-y-3">
      <h2 className="font-black text-stone-900 text-lg" style={{fontFamily:'Sora,sans-serif'}}>My Orders</h2>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter===f?'bg-orange-500 text-white shadow-md':'bg-white border border-stone-200 text-stone-500 hover:border-orange-300'}`}>
            {f}
          </button>
        ))}
      </div>
      {filtered.map(o=>(
        <SectionCard key={o.id}>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-black text-stone-800">{o.customer}</p>
                <p className="text-xs text-stone-400">{o.id} · {o.item}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${sc[o.status]}`}>{o.status}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-50">
              <p className="text-xs text-stone-400">📅 Due: {o.due}</p>
              <p className="text-sm font-black text-orange-500">{o.amount}</p>
            </div>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

/* ── Management Tab ── */
const PRICE_CATS = ['Men\'s Wear','Women\'s Wear','Kids Wear','Bridal','Alterations','Other'];

function ManagementTab() {
  const API_URL_M = process.env.REACT_APP_API_URL;
  const resolveImg = (p) => { if(!p) return null; return p.startsWith('http')?p:`${API_URL_M}${p}`; };

  const [listings, setListings]    = useState([]);
  const [editId,   setEditId]      = useState(null); // item id being edited, or 'new'
  const [form,     setForm]        = useState({ name:'', desc:'', price:'', cat:PRICE_CATS[0] });
  const [imgFile,  setImgFile]     = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [saving,   setSaving]      = useState(false);
  const [saved,    setSaved]       = useState(false);
  const [loading,  setLoading]     = useState(true);
  const [saveErr,  setSaveErr]     = useState('');

  // Load existing listings
  useEffect(() => {
    fetch(`${API_URL_M}/api/tailor/profile`, { credentials:'include' })
      .then(r=>r.ok?r.json():null)
      .then(d => {
        if (Array.isArray(d?.profile?.price_listings)) setListings(d.profile.price_listings);
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setEditId('new');
    setForm({ name:'', desc:'', price:'', cat:PRICE_CATS[0] });
    setImgFile(null); setImgPreview(null); setSaveErr('');
  };
  const openEdit = (item) => {
    setEditId(item.id);
    setForm({ name:item.name, desc:item.desc||'', price:String(item.price), cat:item.cat||PRICE_CATS[0] });
    setImgFile(null); setImgPreview(resolveImg(item.img)); setSaveErr('');
  };
  const cancelEdit = () => { setEditId(null); setImgFile(null); setImgPreview(null); setSaveErr(''); };

  const handleImgPick = (e) => {
    const f = e.target.files[0]; if(!f) return;
    setImgFile(f);
    const r = new FileReader(); r.onloadend=()=>setImgPreview(r.result); r.readAsDataURL(f);
  };

  const persistListings = async (newList) => {
    setSaving(true); setSaveErr('');
    try {
      // Use dedicated endpoint — won't overwrite other profile fields
      const res = await fetch(`${API_URL_M}/api/tailor/price-listings`, {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ price_listings: newList }),
      });
      const d = await res.json();
      if (!res.ok) { setSaveErr(d.message||'Save failed'); setSaving(false); return false; }
      setSaved(true); setTimeout(()=>setSaved(false),2500);
      return true;
    } catch(err) {
      console.error('Price listings save error:', err);
      setSaveErr('Network error — please try again');
      return false;
    } finally { setSaving(false); }
  };

  const handleAddOrUpdate = async () => {
    if (!form.name.trim() || !form.price) { setSaveErr('Name and price are required'); return; }
    setSaveErr('');
    setSaving(true);

    // 1. Upload image first (if new file picked)
    let imgPath = editId !== 'new' ? (listings.find(i=>i.id===editId)?.img||null) : null;
    if (imgFile) {
      try {
        const fd = new FormData();
        fd.append('pricing_img', imgFile);
        const ur = await fetch(`${API_URL_M}/api/upload/pricing-image`, { method:'POST', body:fd, credentials:'include' });
        if (ur.ok) {
          const ud = await ur.json();
          imgPath = ud.imageUrl; // e.g. /uploads/tailor_1_123.jpg
        } else {
          let errMsg = 'Image upload failed';
          try { const ue = await ur.json(); errMsg = ue.message || errMsg; } catch { errMsg = `Upload failed (HTTP ${ur.status})`; }
          setSaveErr(errMsg); setSaving(false); return;
        }
      } catch(uploadErr) {
        console.error('Pricing image upload error:', uploadErr);
        setSaveErr('Cannot reach server — is it running on port 3000?'); setSaving(false); return;
      }
    }

    // 2. Build updated list
    let newList;
    if (editId === 'new') {
      newList = [...listings, { id: Date.now(), name:form.name.trim(), desc:form.desc.trim(), price:Number(form.price), cat:form.cat, img:imgPath }];
    } else {
      newList = listings.map(i => i.id===editId
        ? { ...i, name:form.name.trim(), desc:form.desc.trim(), price:Number(form.price), cat:form.cat, img:imgPath }
        : i);
    }

    // 3. Persist
    setSaving(false); // persistListings will set it again
    const ok = await persistListings(newList);
    if (ok) { setListings(newList); cancelEdit(); }
  };

  const handleDelete = async (id) => {
    const newList = listings.filter(i=>i.id!==id);
    const ok = await persistListings(newList);
    if (ok) setListings(newList);
  };

  const groupedByCat = PRICE_CATS.reduce((acc,c)=>({ ...acc,[c]:listings.filter(i=>i.cat===c) }),{});
  const activeCats = PRICE_CATS.filter(c=>groupedByCat[c].length>0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-stone-900 text-lg" style={{fontFamily:'Sora,sans-serif'}}>Pricing List</h2>
        <button onClick={openNew}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-sm">
          + Add Item
        </button>
      </div>

      {/* ── Add / Edit Form ── */}
      {editId !== null && (
        <div className="bg-white rounded-2xl border border-orange-200 shadow-md p-4 space-y-3">
          <p className="font-black text-sm text-stone-800">{editId==='new'?'➕ New Pricing Item':'✏️ Edit Item'}</p>

          {/* Image picker */}
          <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 cursor-pointer hover:bg-orange-100 transition overflow-hidden relative">
            {imgPreview
              ? <img src={imgPreview} alt="preview" className="w-full h-full object-cover rounded-xl"/>
              : <div className="flex flex-col items-center gap-1 text-orange-400">
                  <span className="text-3xl">🖼️</span>
                  <span className="text-xs font-bold">Tap to add image</span>
                </div>}
            <input type="file" accept="image/*" className="hidden" onChange={handleImgPick}/>
            {imgPreview && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center transition rounded-xl">
                <span className="text-white text-sm font-bold opacity-0 hover:opacity-100">Change</span>
              </div>
            )}
          </label>

          {/* Fields */}
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
            placeholder="Item name (e.g. Bridal Lehenga)" maxLength={80}
            className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
          <textarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}
            placeholder="Short description (optional)" rows={2} maxLength={200}
            className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"/>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-1">Category</label>
              <select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                {PRICE_CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="w-32">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-1">Price (₹)</label>
              <input type="number" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}
                placeholder="0"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
            </div>
          </div>
          {saveErr && <p className="text-red-500 text-xs font-semibold">{saveErr}</p>}
          <div className="flex gap-2">
            <button onClick={cancelEdit}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-bold hover:bg-stone-50 transition">
              Cancel
            </button>
            <button onClick={handleAddOrUpdate} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-black transition disabled:opacity-60">
              {saving ? 'Saving…' : saved ? '✅ Saved!' : editId==='new' ? '➕ Add Item' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── Listing cards ── */}
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <span className="text-5xl block mb-3">🏷️</span>
          <p className="font-bold text-stone-600">No pricing items yet</p>
          <p className="text-stone-400 text-sm mt-1">Click "Add Item" to create your first pricing card</p>
        </div>
      ) : (
        activeCats.map(cat => (
          <div key={cat}>
            <p className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-2 px-1">{cat}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {groupedByCat[cat].map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative h-40 bg-stone-100 flex-shrink-0">
                    {resolveImg(item.img)
                      ? <img src={resolveImg(item.img)} alt={item.name} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🧵</div>}
                    {/* Category badge */}
                    <span className="absolute top-2 left-2 text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      {item.cat}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <p className="font-black text-stone-800 text-sm leading-tight">{item.name}</p>
                    {item.desc && <p className="text-stone-400 text-xs mt-1 leading-relaxed line-clamp-2">{item.desc}</p>}
                    <div className="flex items-center justify-between mt-auto pt-3">
                      <span className="text-orange-600 font-black text-base">₹{Number(item.price).toLocaleString('en-IN')}</span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>openEdit(item)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition text-sm">✏️</button>
                        <button onClick={()=>handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition text-sm font-bold">×</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      {saved && !editId && (
        <p className="text-center text-green-600 text-xs font-bold animate-pulse">✅ Changes saved!</p>
      )}
    </div>
  );
}

/* ── Profile Tab ── */
function ProfileTab({ user, onLogout, onSaved }) {
  const [profileImg, setProfileImg]         = useState(null);
  const [profileImgFile, setProfileImgFile] = useState(null);
  const [saved, setSaved]                   = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [saveError, setSaveError]           = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [available, setAvailable]           = useState(true);
  const [activeCat, setActiveCat]           = useState('mens');
  // Start with empty buckets; DEFAULT_SERVICES loaded only when DB has no products
  const [services, setServices]             = useState({mens:[],womens:[],kids:[],alter:[]});
  const [newSvc, setNewSvc]                 = useState({name:'',price:''});
  const [address, setAddress]               = useState({street:'',city:'',state:'',pin:''});
  const [contact, setContact]               = useState({phone:'',whatsapp:'',instagram:''});
  const [about, setAbout]                   = useState({shopName:'',tagline:'',bio:'',experience:'',specialities:[]});
  const [detecting, setDetecting]           = useState(false);
  const [locationError, setLocationError]   = useState('');
  // gallery: array of { preview: string (blob or server URL), file: File|null }
  const [gallery, setGallery]               = useState([]);
  const [deals, setDeals]                   = useState([]);
  const [newDeal, setNewDeal]               = useState({ title:'', description:'', discount:'', occasion:'', validUntil:'', active:true });
  const [timings, setTimings] = useState({
    Mon:{open:'09:00',close:'20:00',closed:false}, Tue:{open:'09:00',close:'20:00',closed:false},
    Wed:{open:'09:00',close:'20:00',closed:false}, Thu:{open:'09:00',close:'20:00',closed:false},
    Fri:{open:'09:00',close:'20:00',closed:false}, Sat:{open:'09:00',close:'21:00',closed:false},
    Sun:{open:'10:00',close:'17:00',closed:true},
  });

  /* ── Load ALL profile fields from DB on mount ── */
  useEffect(() => {
    setLoadingProfile(true);
    fetch(`${API_URL}/api/tailor/profile`, { credentials:'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.profile) {
          // No saved profile yet — load example/default services so form isn't blank
          setServices(DEFAULT_SERVICES);
          return;
        }
        const p = data.profile;

        // Profile image
        if (p.profile_img) setProfileImg(p.profile_img.startsWith('/uploads') ? `${API_URL}${p.profile_img}` : p.profile_img);

        // Contact & Address
        setAddress({street:p.street||'',city:p.city||'',state:p.state||'',pin:p.pin||''});
        setContact({phone:p.phone||'',whatsapp:p.whatsapp||'',instagram:p.instagram||''});

        // About fields
        setAbout({
          shopName:    p.shop_name    || '',
          tagline:     p.tagline      || '',
          bio:         p.bio          || '',
          experience:  p.experience   || '',
          specialities: Array.isArray(p.specialities) ? p.specialities : [],
        });

        // Timings
        if (p.timings && Object.keys(p.timings).length > 0) {
          setTimings(prev => ({ ...prev, ...p.timings }));
        }

        // Services — build per-category buckets
        if (p.products?.length) {
          const loaded = {mens:[],womens:[],kids:[],alter:[]};
          p.products.forEach((item, i) => {
            const cat = item.cat || 'mens';
            if (loaded[cat]) loaded[cat].push({id:i+1,...item});
          });
          setServices(
            Object.values(loaded).some(a=>a.length>0) ? loaded : DEFAULT_SERVICES
          );
        } else {
          setServices(DEFAULT_SERVICES);
        }

        // Gallery — {preview, file:null} since already on server
        if (p.gallery?.length) {
          setGallery(p.gallery.map(url => ({
            preview: url.startsWith('/uploads') ? `${API_URL}${url}` : url,
            file: null,
            serverPath: url.startsWith('/uploads') ? url : null,
          })));
        }
        // Deals
        if (Array.isArray(p.deals)) setDeals(p.deals);
      })
      .catch(err => console.error('Profile load error:', err))
      .finally(() => setLoadingProfile(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Detect location */
  const handleDetectLocation = () => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); return; }
    setDetecting(true); setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const d = await r.json();
          if (d?.address) {
            const a = d.address;
            setAddress({street:a.road||a.suburb||'',city:a.city||a.town||a.village||'',state:a.state||'',pin:a.postcode||''});
          } else setLocationError('Could not decode location.');
        } catch { setLocationError('Error fetching location.'); }
        finally { setDetecting(false); }
      },
      () => { setLocationError('Location access denied.'); setDetecting(false); },
      {enableHighAccuracy:true,timeout:10000}
    );
  };

  /* Image change */
  const handleImgChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImgFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImg(reader.result);
    reader.readAsDataURL(file);
  };

  /* Gallery ─ pick new images and preview them */
  const handleGallery = e => {
    const files = Array.from(e.target.files);
    const newItems = files.map(f => ({ preview: URL.createObjectURL(f), file: f, serverPath: null }));
    setGallery(prev => [...prev, ...newItems].slice(0, 9));
  };
  const removeGallery = i => setGallery(g => g.filter((_,j) => j !== i));

  /* Services */
  const addService = () => {
    if (!newSvc.name.trim() || !newSvc.price) return;
    setServices(s => ({...s,[activeCat]:[...s[activeCat],{id:Date.now(),name:newSvc.name,price:Number(newSvc.price),cat:activeCat}]}));
    setNewSvc({name:'',price:''});
  };
  const removeService = (cat, id) => setServices(s => ({...s,[cat]:s[cat].filter(x=>x.id!==id)}));

  /* Specialities */
  const toggleSpeciality = sp => setAbout(a=>({...a,specialities:a.specialities.includes(sp)?a.specialities.filter(x=>x!==sp):[...a.specialities,sp]}));

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      // 1. Upload profile image if changed
      // Normalize: strip API_URL prefix so we always store a relative path
      const normalizeImgPath = (url) => {
        if (!url) return null;
        if (url.startsWith(API_URL)) return url.slice(API_URL.length); // strip base API url
        return url; // already relative e.g. /uploads/...
      };

      let finalImgUrl = normalizeImgPath(profileImg); // relative path or null
      if (profileImgFile) {
        const fd = new FormData();
        fd.append('profile_img', profileImgFile);
        const upRes = await fetch(`${API_URL}/api/upload/profile-image`, {method:'POST',body:fd,credentials:'include'});
        const upData = await upRes.json();
        if (!upRes.ok) { setSaveError(upData.message||'Image upload failed'); setSaving(false); return; }
        finalImgUrl = upData.imageUrl; // '/uploads/...' relative path
      }

      // 2. Upload any new gallery images (file !== null), keep existing server paths
      const finalGallery = [];
      for (const item of gallery) {
        if (item.file) {
          // New file → upload to server
          try {
            const fd = new FormData();
            fd.append('gallery_img', item.file);
            const r = await fetch(`${API_URL}/api/upload/gallery-image`, {method:'POST',body:fd,credentials:'include'});
            if (r.ok) {
              const d = await r.json();
              finalGallery.push(d.imageUrl); // e.g. '/uploads/tailor_1_abc.jpg'
            }
          } catch { /* skip failed gallery upload */ }
        } else {
          // Already on server → use stored server path or strip API_URL prefix
          const path = item.serverPath || (item.preview.startsWith(API_URL) ? item.preview.slice(API_URL.length) : item.preview);
          finalGallery.push(path);
        }
      }

      // 3. Save all profile fields to DB
      const allProducts = Object.entries(services).flatMap(([cat,list]) => list.map(({name,price})=>({name,price,cat})));
      const res = await fetch(`${API_URL}/api/tailor/profile`, {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          // Contact & Address
          ...contact, ...address,
          // About
          shop_name:   about.shopName,
          tagline:     about.tagline,
          bio:         about.bio,
          experience:  about.experience,
          specialities: about.specialities,
          // Timings
          timings,
          // Services (all categories)
          products: allProducts,
          // Gallery (server paths)
          gallery: finalGallery,
          // Profile image
          profile_img: finalImgUrl,
          // Deals
          deals,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.message || 'Save failed'); return; }

      // 4. Update local state to reflect what's now on server
      setSaved(true);
      setProfileImgFile(null);
      const displayImg = finalImgUrl ? (finalImgUrl.startsWith('/uploads') ? `${API_URL}${finalImgUrl}` : finalImgUrl) : null;
      if (displayImg) setProfileImg(displayImg);
      // Notify parent (sidebar) of new image + shop name
      if (onSaved) onSaved({ profileImg: finalImgUrl, shopName: about.shopName });
      // Replace gallery items with server-backed versions
      setGallery(finalGallery.map(path => ({
        preview: path.startsWith('/uploads') ? `${API_URL}${path}` : path,
        file: null,
        serverPath: path,
      })));
      setTimeout(() => setSaved(false), 2500);
    } catch(err) {
      console.error('Profile save error:', err);
      setSaveError('Network error. Please try again.');
    } finally { setSaving(false); }
  };

  const openDays = DAYS.filter(d=>!timings[d]?.closed).length;
  const todayDay = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  const todayTiming = timings[todayDay];

  return (
    <div className="space-y-3 pb-4">
      {loadingProfile ? (
        /* ── Loading skeleton ── */
        <div className="space-y-3 animate-pulse">
          <div className="h-48 bg-orange-200/60 rounded-3xl"/>
          <div className="h-12 bg-stone-200 rounded-2xl"/>
          <div className="h-32 bg-stone-200 rounded-2xl"/>
          <div className="h-32 bg-stone-200 rounded-2xl"/>
          <div className="flex items-center justify-center py-6 gap-2">
            <span className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"/>
            <span className="text-stone-400 text-sm font-semibold">Loading your profile…</span>
          </div>
        </div>
      ) : (
      <>

      <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"/>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/[0.06]"/>
        <div className="flex gap-4 items-start relative z-10">
          <label htmlFor="profile-img-upload" className="cursor-pointer relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full border-[3px] border-white/50 bg-white overflow-hidden flex items-center justify-center">
              {profileImg
                ? <img src={profileImg} alt="Profile" className="w-full h-full object-cover"/>
                : <span className="text-4xl">🧵</span>}
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-orange-700 rounded-full border-2 border-white flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z"/></svg>
            </div>
            <input id="profile-img-upload" type="file" accept="image/*" className="hidden" onChange={handleImgChange}/>
          </label>
          <div className="flex-1 pt-1">
            <div className="text-white font-black text-xl leading-tight" style={{fontFamily:'Sora,sans-serif'}}>{about.shopName||user?.full_name||'My Tailor Shop'}</div>
            <div className="text-orange-100 text-xs mt-0.5">{user?.email}</div>
            {about.tagline && <div className="text-orange-50/80 text-[11px] mt-1 italic">"{about.tagline}"</div>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>
                Professional Tailor
              </span>
              {about.experience && <span className="bg-white/20 border border-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">⭐ {about.experience}</span>}
            </div>
          </div>
        </div>
        <div className="h-px bg-white/20 my-4 relative z-10"/>
        <div className="grid grid-cols-4 relative z-10">
          {[{v:'31',l:'Orders'},{v:'18',l:'Clients'},{v:'4.8★',l:'Rating'},{v:`${openDays}d`,l:'Open/Wk'}].map((s,i)=>(
            <div key={i} className={`text-center ${i>0?'border-l border-white/20':''}`}>
              <div className="text-white font-black text-xl leading-none" style={{fontFamily:'Sora,sans-serif'}}>{s.v}</div>
              <div className="text-orange-100/70 text-[10px] mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Completion */}
      <SectionCard>
        <div className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🎯</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-stone-700 mb-1.5">Profile Completion</div>
            <div className="bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" style={{width:'82%'}}/>
            </div>
          </div>
          <div className="text-orange-500 font-black text-sm flex-shrink-0">82%</div>
        </div>
      </SectionCard>

      {/* Availability */}
      <SectionCard>
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <div className="font-bold text-sm text-stone-800">Available for Orders</div>
            <div className="text-stone-400 text-xs mt-0.5">Clients can send order requests</div>
          </div>
          <Toggle checked={available} onChange={setAvailable}/>
        </div>
      </SectionCard>

      {/* About */}
      <SectionCard>
        <SectionHeader icon="✨" title="About & Tagline"/>
        <div className="p-4 flex flex-col gap-3">
          <InputField label="Shop / Studio Name" value={about.shopName} onChange={e=>setAbout(a=>({...a,shopName:e.target.value}))} placeholder="Your shop name"/>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tagline</label>
            <input className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-full"
              value={about.tagline} onChange={e=>setAbout(a=>({...a,tagline:e.target.value}))} placeholder="Stitching Dreams, One Thread at a Time…"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">About Me</label>
            <textarea rows={3} className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none font-medium leading-relaxed"
              value={about.bio} onChange={e=>setAbout(a=>({...a,bio:e.target.value}))} placeholder="Tell clients about yourself…"/>
          </div>
        </div>
      </SectionCard>

      {/* Experience & Skills */}
      <SectionCard>
        <SectionHeader icon="🏆" title="Experience & Skills"/>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Years of Experience</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_OPTS.map(opt=>(
                <button key={opt} onClick={()=>setAbout(a=>({...a,experience:opt}))}
                  className={`text-xs font-bold py-2.5 px-3 rounded-xl border transition text-left ${about.experience===opt?'bg-orange-500 text-white border-orange-500 shadow-md':'bg-stone-50 text-stone-600 border-stone-200 hover:border-orange-300'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Specialities</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALITY_OPTS.map(sp=>(
                <button key={sp} onClick={()=>toggleSpeciality(sp)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${about.specialities.includes(sp)?'bg-orange-100 text-orange-700 border-orange-300':'bg-stone-50 text-stone-500 border-stone-200 hover:border-orange-200'}`}>
                  {sp}
                </button>
              ))}
            </div>
          </div>
          {(about.experience||about.specialities.length>0) && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🧵</div>
              <div>
                <div className="font-black text-stone-800 text-base">{about.experience||'Experience'}</div>
                <div className="text-orange-600 text-xs font-semibold mt-0.5">of tailoring mastery</div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {about.specialities.map(s=>(
                    <span key={s} className="bg-orange-200/60 text-orange-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Shop Timings */}
      <SectionCard>
        <SectionHeader icon="🕐" title="Shop Timings"
          action={
            <button onClick={()=>setTimings(t=>{const n={...t};DAYS.forEach(d=>{if(!n[d].closed)n[d]={open:'09:00',close:'20:00',closed:false}});return n;})}
              className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
              Reset All
            </button>
          }
        />
        <div className="px-4 py-2 flex flex-col gap-0">
          {DAYS.map((day,i)=>{
            const t=timings[day]||{open:'09:00',close:'20:00',closed:false};
            return (
              <div key={day} className={`flex items-center gap-2 py-2.5 ${i<DAYS.length-1?'border-b border-stone-100':''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${t.closed?'bg-stone-100 text-stone-400':'bg-orange-100 text-orange-700'}`}>{day}</div>
                {t.closed ? (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs text-red-400 font-bold bg-red-50 px-2 py-1 rounded-lg">Closed</span>
                    <button onClick={()=>setTimings(tm=>({...tm,[day]:{...tm[day],closed:false}}))} className="text-[10px] font-bold text-stone-400 hover:text-orange-500 transition">Open</button>
                  </div>
                ):(
                  <div className="flex-1 flex items-center gap-1.5">
                    <select value={t.open} onChange={e=>setTimings(tm=>({...tm,[day]:{...tm[day],open:e.target.value}}))}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 px-2 py-1.5 outline-none focus:border-orange-400">
                      {TIMING_PRESETS.map(p=><option key={p}>{p}</option>)}
                    </select>
                    <span className="text-stone-400 text-xs font-bold">–</span>
                    <select value={t.close} onChange={e=>setTimings(tm=>({...tm,[day]:{...tm[day],close:e.target.value}}))}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 px-2 py-1.5 outline-none focus:border-orange-400">
                      {TIMING_PRESETS.map(p=><option key={p}>{p}</option>)}
                    </select>
                    <button onClick={()=>setTimings(tm=>({...tm,[day]:{...tm[day],closed:true}}))}
                      className="w-6 h-6 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 text-xs flex items-center justify-center flex-shrink-0 transition font-bold">✕</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mx-4 mb-4 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"/>
          <span className="text-xs font-bold text-green-700">Today ({todayDay}): {todayTiming?.closed?'Closed':`${todayTiming?.open} – ${todayTiming?.close}`}</span>
        </div>
      </SectionCard>

      {/* Services & Pricing */}
      <SectionCard>
        <SectionHeader icon="🏷️" title="Services & Pricing"/>
        <div className="flex gap-2 px-4 pt-3 overflow-x-auto scrollbar-hide pb-0">
          {Object.entries(CAT_META).map(([key,m])=>(
            <button key={key} onClick={()=>setActiveCat(key)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition whitespace-nowrap ${activeCat===key?m.active+' shadow-sm':'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'}`}>
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-2 mb-3">
            {services[activeCat].length===0 && <div className="text-center py-6 text-stone-300 text-sm">No services yet. Add one below!</div>}
            {services[activeCat].map(svc=>(
              <div key={svc.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${CAT_META[activeCat].color}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${CAT_META[activeCat].dot}`}/>
                <span className="flex-1 text-sm font-bold text-stone-800">{svc.name}</span>
                <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${CAT_META[activeCat].badge}`}>₹{Number(svc.price).toLocaleString('en-IN')}</span>
                <button onClick={()=>removeService(activeCat,svc.id)} className="w-6 h-6 bg-white rounded-full border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 transition text-xs flex items-center justify-center font-bold">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-center bg-stone-50 border border-stone-200 rounded-xl p-2">
            <input value={newSvc.name} onChange={e=>setNewSvc(n=>({...n,name:e.target.value}))} placeholder="Service name"
              className="flex-1 bg-transparent text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-300 min-w-0"/>
            <input value={newSvc.price} onChange={e=>setNewSvc(n=>({...n,price:e.target.value}))} type="number" placeholder="₹ Price"
              className="w-20 bg-transparent text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-300 text-right"/>
            <button onClick={addService} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-3 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap">+ Add</button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {Object.entries(CAT_META).map(([key,m])=>(
              <div key={key} onClick={()=>setActiveCat(key)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition ${activeCat===key?m.active:'bg-stone-50 border-stone-200'}`}>
                <span className="text-base">{m.icon}</span>
                <div>
                  <div className="text-[10px] font-bold text-stone-500">{m.label}</div>
                  <div className="text-xs font-black text-stone-800">{services[key].length} services</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Address */}
      <SectionCard>
        <SectionHeader icon="📍" title="Address"
          action={
            <button onClick={handleDetectLocation} disabled={detecting}
              className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full disabled:opacity-60">
              {detecting?<span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"/>:'🎯'}
              {detecting?'Detecting...':'Auto Detect'}
            </button>
          }
        />
        <div className="p-4 flex flex-col gap-3">
          {locationError && <div className="text-red-600 text-xs bg-red-50 p-2 rounded-lg border border-red-100">{locationError}</div>}
          <InputField label="Street Address" value={address.street} onChange={e=>setAddress(a=>({...a,street:e.target.value}))} placeholder="Street address"/>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="City"  value={address.city}  onChange={e=>setAddress(a=>({...a,city:e.target.value}))}  placeholder="City"/>
            <InputField label="State" value={address.state} onChange={e=>setAddress(a=>({...a,state:e.target.value}))} placeholder="State"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="PIN Code" value={address.pin} onChange={e=>setAddress(a=>({...a,pin:e.target.value}))} placeholder="PIN"/>
            <InputField label="Country" value="India" readOnly placeholder="Country"/>
          </div>
        </div>
      </SectionCard>

      {/* Contact */}
      <SectionCard>
        <SectionHeader icon="📞" title="Contact"/>
        <div className="p-4 flex flex-col gap-2.5">
          <PhoneInput
            id="tailor-phone"
            value={contact.phone}
            onChange={val => setContact(ct => ({ ...ct, phone: val }))}
            placeholder="Primary Phone"
            label="Primary Phone"
            inputStyle="tailor"
          />
          <PhoneInput
            id="tailor-whatsapp"
            value={contact.whatsapp}
            onChange={val => setContact(ct => ({ ...ct, whatsapp: val }))}
            placeholder="WhatsApp Number"
            label="WhatsApp Number"
            inputStyle="tailor"
          />
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-base flex-shrink-0">📷</div>
            <input value={contact.instagram} onChange={e => setContact(ct => ({ ...ct, instagram: e.target.value }))} placeholder="Instagram (optional)"
              className="flex-1 bg-transparent text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-300 placeholder:font-normal"/>
          </div>
        </div>
      </SectionCard>

      {/* Deals & Discounts */}
      <SectionCard>
        <SectionHeader icon="🎁" title="Deals & Discounts"
          action={
            <span className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full">
              {deals.filter(d=>d.active).length} Active
            </span>
          }
        />
        <div className="p-4 flex flex-col gap-3">

          {/* Existing deals list */}
          {deals.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎁</div>
              <p className="text-stone-400 text-sm font-semibold">No deals yet</p>
              <p className="text-stone-300 text-xs mt-0.5">Add a special offer below to attract more customers!</p>
            </div>
          )}
          {deals.map((deal, idx) => (
            <div key={idx} className={`rounded-2xl border p-3.5 flex flex-col gap-2 relative ${
              deal.active ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' : 'bg-stone-50 border-stone-200 opacity-60'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-stone-800 truncate">{deal.title}</span>
                    {deal.discount && <span className="text-xs font-black text-white bg-orange-500 px-2 py-0.5 rounded-full flex-shrink-0">{deal.discount}% OFF</span>}
                    {deal.occasion && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full flex-shrink-0">🎉 {deal.occasion}</span>}
                  </div>
                  {deal.description && <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{deal.description}</p>}
                  {deal.validUntil && <p className="text-[10px] text-stone-400 mt-1">📅 Valid until: <span className="font-bold">{new Date(deal.validUntil).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span></p>}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <button onClick={() => setDeals(d => d.map((x,i) => i===idx ? {...x,active:!x.active} : x))}
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition ${
                      deal.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-stone-100 text-stone-500 border-stone-200'
                    }`}>
                    {deal.active ? '✅ Active' : 'Off'}
                  </button>
                  <button onClick={() => setDeals(d => d.filter((_,i) => i!==idx))}
                    className="text-[10px] font-bold text-red-400 hover:text-red-600 transition">Remove</button>
                </div>
              </div>
            </div>
          ))}

          {/* Add new deal form */}
          <div className="bg-white border-2 border-dashed border-orange-200 rounded-2xl p-4 flex flex-col gap-2.5">
            <p className="text-xs font-black text-stone-600 uppercase tracking-wider">✨ Add New Deal</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Deal Title *</label>
                <input value={newDeal.title} onChange={e=>setNewDeal(n=>({...n,title:e.target.value}))}
                  placeholder="e.g. Diwali Festival Offer"
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 outline-none focus:border-orange-400 transition placeholder:text-stone-300"/>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Discount (%)</label>
                <input value={newDeal.discount} onChange={e=>setNewDeal(n=>({...n,discount:e.target.value}))} type="number" min="1" max="99"
                  placeholder="20"
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 outline-none focus:border-orange-400 transition placeholder:text-stone-300"/>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Occasion / Moment</label>
                <input value={newDeal.occasion} onChange={e=>setNewDeal(n=>({...n,occasion:e.target.value}))}
                  placeholder="Diwali, Wedding…"
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 outline-none focus:border-orange-400 transition placeholder:text-stone-300"/>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Description</label>
                <input value={newDeal.description} onChange={e=>setNewDeal(n=>({...n,description:e.target.value}))}
                  placeholder="Brief description of the offer…"
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 outline-none focus:border-orange-400 transition placeholder:text-stone-300"/>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Valid Until</label>
                <input value={newDeal.validUntil} onChange={e=>setNewDeal(n=>({...n,validUntil:e.target.value}))} type="date"
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 outline-none focus:border-orange-400 transition"/>
              </div>
            </div>
            <button
              onClick={() => {
                if (!newDeal.title.trim()) return;
                setDeals(d => [...d, { ...newDeal, id: Date.now(), active: true }]);
                setNewDeal({ title:'', description:'', discount:'', occasion:'', validUntil:'', active:true });
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-black py-2.5 rounded-xl transition shadow-sm">
              🎁 Add Deal
            </button>
          </div>

          <p className="text-stone-300 text-[11px] text-center">Deals are shown on your public profile. Remember to save your profile after adding!</p>
        </div>
      </SectionCard>

      {/* Gallery */}
      <SectionCard>
        <SectionHeader icon="🖼️" title="Gallery"/>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2.5">
            {gallery.map((item,i)=>(
              <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                <img src={item.preview} alt={`gallery-${i}`} className="w-full h-full object-cover"/>
                {item.file && (
                  <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">NEW</span>
                )}
                <button onClick={()=>removeGallery(i)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/50 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition font-bold">✕</button>
              </div>
            ))}
            {Array.from({length:Math.max(0,6-gallery.length)}).map((_,i)=>(
              <label key={i} className="aspect-square rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 flex flex-col items-center justify-center gap-1 hover:bg-orange-100 hover:border-orange-400 transition cursor-pointer">
                <span className="text-orange-400 text-xl font-bold">+</span>
                <span className="text-orange-400 text-[10px] font-bold">Add Photo</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGallery}/>
              </label>
            ))}
          </div>
          <p className="text-stone-400 text-xs mt-2.5">Up to 9 photos · Hover to remove</p>
        </div>
      </SectionCard>

      {/* Save / Logout */}
      {saveError && <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">{saveError}</div>}
      <button onClick={handleSave} disabled={saving||saved}
        className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black tracking-wide transition-all duration-300 disabled:opacity-80 ${saved?'bg-green-500':'bg-orange-500 hover:bg-orange-600'} text-white shadow-lg`}
        style={{boxShadow:saved?'0 8px 24px rgba(34,197,94,0.3)':'0 8px 24px rgba(249,115,22,0.3)'}}>
        {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
        {saved ? '✅ Profile Saved!' : saving ? 'Saving…' : '💾 Save Profile'}
      </button>
      <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition">
        🚪 Logout
      </button>

      </>)}
    </div>
  );
}

/* ── Offers Tab ── */
function OffersTab() {
  const API_URL_M = process.env.REACT_APP_API_URL;
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', discount: '', discount_type: 'percent', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchOffers = () => {
    fetch(`${API_URL_M}/api/tailor/offers`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.offers) setOffers(d.offers); setLoading(false); })
      .catch(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchOffers(); }, []);

  const handleAdd = async () => {
    setError('');
    if (!form.title || !form.discount || !form.start_date || !form.end_date) {
      setError('Title, discount, start date, and end date are required'); return;
    }
    setSaving(true);
    try {
      const r = await fetch(`${API_URL_M}/api/tailor/offers`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const d = await r.json();
      if (r.ok) {
        setForm({ title: '', description: '', discount: '', discount_type: 'percent', start_date: '', end_date: '' });
        fetchOffers();
      } else {
        setError(d.message || 'Failed to add offer');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      const r = await fetch(`${API_URL_M}/api/tailor/offers/${id}`, { method: 'DELETE', credentials: 'include' });
      if (r.ok) fetchOffers();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <h2 className="font-black text-stone-900 text-lg" style={{fontFamily:'Sora,sans-serif'}}>🔥 Manage Offers</h2>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 space-y-3">
         <p className="font-bold text-sm text-stone-800">➕ Add New Offer</p>
         <input placeholder="Offer Title (e.g., Summer Sale)" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full border border-stone-200 focus:ring-2 focus:ring-orange-300 outline-none rounded-xl px-3 py-2 text-sm" />
         <textarea placeholder="Description (Optional)" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border border-stone-200 focus:ring-2 focus:ring-orange-300 outline-none rounded-xl px-3 py-2 text-sm" />
         <div className="flex gap-2">
            <input placeholder="Discount Amount" type="number" min="0" value={form.discount} onChange={e=>setForm({...form,discount:e.target.value})} className="w-1/2 border border-stone-200 focus:ring-2 focus:ring-orange-300 outline-none rounded-xl px-3 py-2 text-sm" />
            <select value={form.discount_type} onChange={e=>setForm({...form,discount_type:e.target.value})} className="w-1/2 border border-stone-200 focus:ring-2 focus:ring-orange-300 outline-none rounded-xl px-3 py-2 text-sm">
               <option value="percent">% Percent OFF</option>
               <option value="flat">₹ Flat OFF</option>
            </select>
         </div>
         <div className="flex gap-2">
            <div className="w-1/2">
                <label className="text-[10px] font-bold text-stone-400 uppercase">Start Date</label>
                <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} className="w-full border border-stone-200 outline-none focus:ring-2 focus:ring-orange-300 rounded-xl px-3 py-2 text-sm text-stone-700" />
            </div>
            <div className="w-1/2">
                <label className="text-[10px] font-bold text-stone-400 uppercase">End Date</label>
                <input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} className="w-full border border-stone-200 outline-none focus:ring-2 focus:ring-orange-300 rounded-xl px-3 py-2 text-sm text-stone-700" />
            </div>
         </div>
         {error && <p className="text-red-500 font-bold text-xs">{error}</p>}
         <button onClick={handleAdd} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 transition text-white font-bold py-2.5 rounded-xl disabled:opacity-50">
           {saving ? 'Saving...' : '💾 Save Offer'}
         </button>
      </div>

      <div>
        <h3 className="font-bold text-sm text-stone-800 mb-3">Your Offers</h3>
        {loading && <p className="text-stone-400 text-sm">Loading...</p>}
        {offers.length === 0 && !loading && <p className="text-stone-500 text-sm bg-white p-4 rounded-xl shadow-sm text-center">No offers created yet</p>}
        {offers.map(o => (
           <div key={o.id} className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-stone-200">
             <div className="flex justify-between items-start">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                     <p className="font-bold text-stone-800">{o.title}</p>
                     {o.is_active ? 
                        <span className="text-[10px] uppercase font-black bg-green-100 border border-green-200 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>Active</span> 
                      : <span className="text-[10px] uppercase font-bold bg-stone-100 border border-stone-200 text-stone-500 px-2 py-0.5 rounded-full">Inactive</span>
                     }
                 </div>
                 {o.description && <p className="text-xs text-stone-500 mb-2">{o.description}</p>}
                 <p className="text-sm font-black text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
                    {o.discount}{o.discount_type === 'percent' ? '% OFF' : '₹ OFF'}
                 </p>
                 <p className="text-[11px] text-stone-400 mt-2 font-bold uppercase tracking-wider">
                    Valid: {new Date(o.start_date).toLocaleDateString()} - {new Date(o.end_date).toLocaleDateString()}
                    {o.is_active && o.days_left !== null && o.days_left >= 0 && (
                        <span className="ml-2 text-orange-500">({o.days_left} days left)</span>
                    )}
                 </p>
               </div>
               <button onClick={()=>handleDelete(o.id)} className="text-red-500 text-xs font-bold bg-red-50 hover:bg-red-100 border border-red-100 px-2 py-1.5 rounded-lg transition ml-2 flex-shrink-0">
                  Delete
               </button>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bottom Nav ── */
const NAV_TABS = [
  {id:'home',   icon:'🏠',label:'Home'},
  {id:'orders', icon:'📋',label:'Orders'},
  {id:'offers', icon:'🔥',label:'Offers'},
  {id:'manage', icon:'⚙️',label:'Manage'},
  {id:'profile',icon:'👤',label:'Profile'},
];

/* ── Main ── */
export default function TailorDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const API_URL_MAIN = process.env.REACT_APP_API_URL;
  const resolveImgMain = (p) => { if (!p) return null; return p.startsWith('http') ? p : `${API_URL_MAIN}${p}`; };

  const [sidebarProfileImg, setSidebarProfileImg] = useState(null);
  const [sidebarShopName, setSidebarShopName] = useState('');

  // Fetch just the profile image and shop name for sidebar display
  useEffect(() => {
    fetch(`${API_URL_MAIN}/api/tailor/profile`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.profile?.profile_img) setSidebarProfileImg(resolveImgMain(data.profile.profile_img));
        if (data?.profile?.shop_name)   setSidebarShopName(data.profile.shop_name);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const renderTab = () => {
    const props = { user, onLogout:handleLogout };
    switch(activeTab) {
      case 'home':    return <HomeTab {...props}/>;
      case 'orders':  return <OrdersTab/>;
      case 'offers':  return <OffersTab/>;
      case 'manage':  return <ManagementTab/>;
      case 'profile': return <ProfileTab {...props} onSaved={({ profileImg: img, shopName }) => {
        if (img) setSidebarProfileImg(img.startsWith('/uploads') ? `${API_URL_MAIN}${img}` : img);
        if (shopName) setSidebarShopName(shopName);
      }} />;
      default:        return <HomeTab {...props}/>;
    }
  };

  return (
    <div className="bg-stone-100 min-h-screen">
      <div className="w-full max-w-screen-xl mx-auto relative pb-24">

        {/* Top Nav */}
        <nav className="sticky top-0 z-50 bg-white border-b border-stone-200 flex items-center justify-between px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-base">✂</span>
            </div>
            <span className="font-bold text-base text-stone-900" style={{fontFamily:'Sora,sans-serif'}}>TailorHub</span>
            <span className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">Tailor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-9 h-9 bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center overflow-hidden">
              <span className="text-lg">🔔</span>
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"/>
            </div>
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-sm overflow-hidden">
              {sidebarProfileImg
                ? <img src={sidebarProfileImg} alt="profile" className="w-full h-full object-cover" />
                : (user?.full_name?.charAt(0)?.toUpperCase()||'T')}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="px-4 pt-4 lg:px-8 lg:pt-6">
          <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8 xl:grid-cols-[340px_1fr]">

            {/* ── Left Sidebar: always-visible tailor card + nav (desktop only) ── */}
            <aside className="hidden lg:flex lg:flex-col gap-4 self-start sticky top-[73px]">
              {/* Tailor profile card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10"/>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-14 h-14 rounded-full border-2 border-white/40 flex items-center justify-center text-2xl font-black flex-shrink-0 overflow-hidden bg-white/20">
                    {sidebarProfileImg
                      ? <img src={sidebarProfileImg} alt="profile" className="w-full h-full object-cover" />
                      : (user?.full_name?.charAt(0)?.toUpperCase()||'T')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-base leading-tight truncate" style={{fontFamily:'Sora,sans-serif'}}>
                      {sidebarShopName || user?.full_name || 'My Tailor Shop'}
                    </div>
                    <div className="text-orange-100 text-xs mt-0.5 truncate">{user?.email}</div>
                    <span className="mt-1.5 inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>
                      Professional Tailor
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick nav links */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Quick Navigation</span>
                </div>
                {[
                  {id:'home',   icon:'🏠', label:'Dashboard Home',   desc:'Stats & recent orders'},
                  {id:'orders', icon:'📋', label:'My Orders',        desc:'View & manage orders'},
                  {id:'offers', icon:'🔥', label:'Manage Offers',    desc:'Create & edit promos'},
                  {id:'manage', icon:'⚙️', label:'Management',       desc:'Portfolio & tools'},
                  {id:'profile',icon:'👤', label:'Edit Profile',     desc:'Shop info & services'},
                  {id:'browse', icon:'🔍', label:'Browse Tailors',   desc:'Explore tailors & deals', external:'/browse-deals'},
                ].map(item => (
                  <button key={item.id} onClick={() => item.external ? navigate(item.external) : setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-stone-50 last:border-0 ${
                      activeTab === item.id
                        ? 'bg-orange-50 border-l-4 border-l-orange-500'
                        : 'hover:bg-stone-50 border-l-4 border-l-transparent'
                    }`}>
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className={`text-sm font-bold ${activeTab === item.id ? 'text-orange-600' : 'text-stone-800'}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-stone-400">{item.desc}</div>
                    </div>
                    {activeTab === item.id && (
                      <span className="ml-auto text-orange-400 font-bold text-lg">›</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Logout button in sidebar on desktop */}
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition">
                🚪 Logout
              </button>
            </aside>

            {/* ── Right Main Content — each tab is unique ── */}
            {/* Single render — avoids duplicate input IDs between mobile/desktop */}
            <div>{renderTab()}</div>

          </div>
        </main>

        {/* Bottom Nav — full width on all screens */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 grid grid-cols-5 z-50 shadow-lg">
          {NAV_TABS.map(n=>(
            <button key={n.id} onClick={()=>setActiveTab(n.id)}
              className="flex flex-col items-center gap-0.5 py-2.5 transition-all">
              {activeTab===n.id && <div className="w-5 h-0.5 bg-orange-500 rounded-full mb-0.5"/>}
              <span className={`text-xl transition-transform ${activeTab===n.id?'scale-110':'scale-100'}`}>{n.icon}</span>
              <span className={`text-[10px] font-bold ${activeTab===n.id?'text-orange-500':'text-stone-400'}`}>{n.label}</span>
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}
