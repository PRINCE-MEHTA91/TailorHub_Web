import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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
function ManagementTab() {
  const sections = [
    {icon:'📐',title:'Measurement Templates',desc:'Save standard size templates',badge:null},
    {icon:'🖼️',title:'Portfolio',            desc:'Showcase your best work',      badge:'5 items'},
    {icon:'📆',title:'Availability',          desc:'Set your working hours',       badge:'Open'},
    {icon:'💬',title:'Customer Messages',     desc:'Manage inquiries',             badge:'2 new'},
    {icon:'🏷️',title:'Pricing List',         desc:'Set prices for your services', badge:null},
    {icon:'⭐',title:'Reviews & Ratings',    desc:'See what customers say',       badge:'4.8 avg'},
  ];
  return (
    <div className="space-y-3">
      <h2 className="font-black text-stone-900 text-lg" style={{fontFamily:'Sora,sans-serif'}}>Management</h2>
      {sections.map(s=>(
        <SectionCard key={s.title}>
          <button className="w-full flex items-center gap-4 p-4 text-left hover:bg-stone-50 transition-colors">
            <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{s.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-800">{s.title}</p>
              <p className="text-xs text-stone-400 mt-0.5 truncate">{s.desc}</p>
            </div>
            {s.badge && <span className="flex-shrink-0 bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full">{s.badge}</span>}
            <span className="text-stone-300 text-lg flex-shrink-0">›</span>
          </button>
        </SectionCard>
      ))}
    </div>
  );
}

/* ── Profile Tab ── */
function ProfileTab({ user, onLogout }) {
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
      let finalImgUrl = profileImg || null;
      if (profileImgFile) {
        const fd = new FormData();
        fd.append('profile_img', profileImgFile);
        const upRes = await fetch(`${API_URL}/api/upload/profile-image`, {method:'POST',body:fd,credentials:'include'});
        const upData = await upRes.json();
        if (!upRes.ok) { setSaveError(upData.message||'Image upload failed'); setSaving(false); return; }
        finalImgUrl = upData.imageUrl;
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
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.message || 'Save failed'); return; }

      // 4. Update local state to reflect what's now on server
      setSaved(true);
      setProfileImgFile(null);
      if (finalImgUrl) setProfileImg(finalImgUrl.startsWith('/uploads') ? `${API_URL}${finalImgUrl}` : finalImgUrl);
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
          {[
            {icon:'📱',bg:'bg-amber-50', label:'Primary Phone',       val:contact.phone,     key:'phone'},
            {icon:'💬',bg:'bg-green-50', label:'WhatsApp Number',     val:contact.whatsapp,  key:'whatsapp'},
            {icon:'📷',bg:'bg-red-50',   label:'Instagram (optional)',val:contact.instagram, key:'instagram'},
          ].map(c=>(
            <div key={c.key} className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition">
              <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center text-base flex-shrink-0`}>{c.icon}</div>
              <input value={c.val} onChange={e=>setContact(ct=>({...ct,[c.key]:e.target.value}))} placeholder={c.label}
                maxLength={c.key==='instagram'?undefined:10}
                className="flex-1 bg-transparent text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-300 placeholder:font-normal"/>
            </div>
          ))}
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

/* ── Bottom Nav ── */
const NAV_TABS = [
  {id:'home',   icon:'🏠',label:'Home'},
  {id:'orders', icon:'📋',label:'Orders'},
  {id:'manage', icon:'⚙️',label:'Manage'},
  {id:'profile',icon:'👤',label:'Profile'},
];

/* ── Main ── */
export default function TailorDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = async () => { await logout(); navigate('/'); };

  const renderTab = () => {
    const props = { user, onLogout:handleLogout };
    switch(activeTab) {
      case 'home':    return <HomeTab {...props}/>;
      case 'orders':  return <OrdersTab/>;
      case 'manage':  return <ManagementTab/>;
      case 'profile': return <ProfileTab {...props}/>;
      default:        return <HomeTab {...props}/>;
    }
  };

  return (
    <div className="bg-stone-100 min-h-screen flex justify-center">
      <div className="w-full max-w-[430px] bg-stone-100 relative pb-24">

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
            <div className="relative w-9 h-9 bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center">
              <span className="text-lg">🔔</span>
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"/>
            </div>
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-sm">
              {user?.full_name?.charAt(0)?.toUpperCase()||'T'}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="px-4 pt-4">
          {renderTab()}
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-stone-200 grid grid-cols-4 px-2 py-2 z-50 shadow-lg">
          {NAV_TABS.map(n=>(
            <button key={n.id} onClick={()=>setActiveTab(n.id)} className="flex flex-col items-center gap-0.5 py-1 transition-all">
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
