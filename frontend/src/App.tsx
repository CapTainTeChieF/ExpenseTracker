import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDownRight, ArrowUpRight, CheckCircle2, CirclePlus, Edit3, Landmark, LogOut,
  ReceiptText, ShieldCheck, Tags, Trash2, Wallet, X, BarChart3, PieChart as PieIcon,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';

type Kind = 'INCOME' | 'EXPENSE';
type User = {id: string; name: string; email: string};
type Category = {id: string; name: string; kind: Kind};
type Transaction = {
  id: string; kind: Kind; amount: string; currency: 'BDT'; transactionDate: string;
  description: string; categoryId: string | null; categoryName: string | null;
};
type Summary = {currency: 'BDT'; income: string; expense: string; balance: string; transactionCount: number};
type MonthlySummary = Summary & {
  month: string;
  categories: {kind: Kind; name: string; total: string; count: number}[];
};
type Trend = {currency: 'BDT'; endMonth: string; months: {month:string; income:string; expense:string}[]};
type Tab = 'dashboard' | 'categories';
type KindFilter = 'ALL' | Kind;

const CHART_COLORS = ['#2563eb','#7c3aed','#0d9488','#e87931','#e11d48','#0ea5e9','#a16207','#475569'];
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const today = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
};
const bdt = (amount: string | number) => `৳${Number(amount).toLocaleString('en-BD', {
  minimumFractionDigits:2, maximumFractionDigits:2,
})}`;

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials:'include',
    headers: {'Content-Type':'application/json', ...(init.headers || {})},
  });
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const info = json as {message?: string | string[]};
    throw new Error(Array.isArray(info.message) ? info.message.join(', ') : info.message || `HTTP ${res.status}`);
  }
  return json as T;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login');
  const [authForm, setAuthForm] = useState({name:'', email:'', password:''});
  const [tab, setTab] = useState<Tab>('dashboard');
  const [month, setMonth] = useState(today().slice(0,7));
  const [filterKind, setFilterKind] = useState<KindFilter>('ALL');
  const [list, setList] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<MonthlySummary | null>(null);
  const [trend, setTrend] = useState<Trend | null>(null);
  const [trendRange, setTrendRange] = useState<3|6|12>(6);
  const [kind, setKind] = useState<Kind>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryKind, setNewCategoryKind] = useState<Kind>('EXPENSE');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const kindCategories = useMemo(() => categories.filter(x => x.kind === kind),[categories,kind]);
  const expensePie = useMemo(() => (monthly?.categories ?? [])
    .filter(x => x.kind === 'EXPENSE' && Number(x.total) > 0)
    .map(x => ({name:x.name, value:Number(x.total)})), [monthly]);
  const barData = useMemo(() => (trend?.months ?? []).map(item => ({
    month:item.month, income:Number(item.income), expense:Number(item.expense),
  })), [trend]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const filter = new URLSearchParams({month});
      if (filterKind !== 'ALL') filter.set('kind',filterKind);
      const [tx,cats,all,period,history] = await Promise.all([
        api<Transaction[]>(`/transactions?${filter}`),
        api<Category[]>('/categories'),
        api<Summary>('/analytics/summary'),
        api<MonthlySummary>(`/analytics/monthly?month=${encodeURIComponent(month)}`),
        api<Trend>(`/analytics/trend?months=${trendRange}&endMonth=${encodeURIComponent(month)}`),
      ]);
      setList(tx); setCategories(cats); setSummary(all); setMonthly(period); setTrend(history);
    } finally {setLoading(false);}
  },[month,filterKind,trendRange]);

  useEffect(() => {
    api<User>('/auth/me').then(setUser).catch(() => {}).finally(() => setChecking(false));
  },[]);

  useEffect(() => {
    if (!user) return;
    void refresh().catch(e => setError((e as Error).message));
  },[user,refresh]);

  function resetForm() {
    setEditing(null); setKind('EXPENSE'); setAmount(''); setDate(today());
    setDescription(''); setCategoryId('');
  }
  function beginEdit(t: Transaction) {
    setEditing(t.id); setKind(t.kind); setAmount(t.amount); setDate(t.transactionDate);
    setDescription(t.description); setCategoryId(t.categoryId || '');
    setTab('dashboard'); setError('');setNotice('');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  async function submitAuth(event: FormEvent) {
    event.preventDefault(); setError('');setNotice('');setBusy(true);
    try {
      const body = authMode === 'register' ? authForm : {email:authForm.email,password:authForm.password};
      const response = await api<{user:User}>(`/auth/${authMode}`,{method:'POST',body:JSON.stringify(body)});
      setAuthForm({name:'',email:'',password:''});setUser(response.user);
      setNotice('Login successful. Start adding your transactions.');
    } catch(e) {setError((e as Error).message);} finally {setBusy(false);}
  }

  async function saveTransaction(event: FormEvent) {
    event.preventDefault();setBusy(true);setError('');setNotice('');
    try {
      const cleanAmount = amount.trim();
      if (!/^\d{1,12}(\.\d{1,2})?$/.test(cleanAmount) || Number(cleanAmount) <= 0) {
        throw new Error('Enter a valid amount (up to two decimal places)');
      }
      const body = {
        kind,amount:cleanAmount,transactionDate:date,description,
        // On edit explicitly allow clearing a previously selected category.
        ...(editing ? {categoryId: categoryId || null} : (categoryId ? {categoryId} : {})),
      };
      await api(`/transactions${editing?`/${editing}`:''}`,{
        method:editing?'PATCH':'POST',body:JSON.stringify(body),
      });
      const wasEditing = Boolean(editing);
      resetForm(); await refresh();
      setNotice(wasEditing?'Transaction updated.':'New transaction saved.');
    } catch(e) {setError((e as Error).message);} finally {setBusy(false);}
  }

  async function deleteTransaction(id: string) {
    if (!window.confirm('Permanently delete this transaction?')) return;
    setBusy(true);setError('');setNotice('');
    try {
      await api(`/transactions/${id}`,{method:'DELETE'});
      if (editing === id) resetForm();
      await refresh();setNotice('Transaction deleted.');
    } catch(e) {setError((e as Error).message);} finally {setBusy(false);}
  }

  async function createCategory(event: FormEvent) {
    event.preventDefault();setBusy(true);setError('');setNotice('');
    try {
      await api('/categories',{method:'POST',body:JSON.stringify({name:newCategoryName,kind:newCategoryKind})});
      setNewCategoryName('');await refresh();setNotice('New category created.');
    } catch(e) {setError((e as Error).message);} finally {setBusy(false);}
  }

  async function renameCategory(event: FormEvent, id: string) {
    event.preventDefault();setBusy(true);setError('');setNotice('');
    try {
      await api(`/categories/${id}`,{method:'PATCH',body:JSON.stringify({name:renameName})});
      setRenaming(null);setRenameName('');await refresh();setNotice('Category renamed.');
    } catch(e) {setError((e as Error).message);} finally {setBusy(false);}
  }

  async function deleteCategory(id: string) {
    if (!window.confirm('Delete this category? Categories in use cannot be deleted.')) return;
    setBusy(true);setError('');setNotice('');
    try {
      await api(`/categories/${id}`,{method:'DELETE'});
      if (categoryId === id) setCategoryId('');
      await refresh();setNotice('Category deleted.');
    } catch(e) {setError((e as Error).message);} finally {setBusy(false);}
  }

  async function logout() {
  try {await api('/auth/logout',{method:'POST'});} catch {/* local state still reset */}
  setUser(null);setList([]);setCategories([]);setSummary(null);setMonthly(null);setTrend(null);
  resetForm();setError('');setNotice('');setTab('dashboard');
  setAuthMode('login');
  }

  if (checking) return <div className="min-h-screen flex items-center justify-center text-slate-600">Checking session…</div>;
  if (!user) return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_40%),#f5f8fc]">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl shadow-slate-200/70 border border-slate-100 p-7 md:p-9">
        <div className="flex items-center gap-3 mb-8"><div className="p-3 rounded-2xl bg-blue-600 text-white"><Wallet size={27}/></div><div><h1 className="text-xl font-extrabold">Expense Tracker</h1><p className="text-xs text-slate-500">Iteration 3 · Final Build v0.3</p></div></div>
        <h2 className="text-2xl font-bold">{authMode==='register'?'Create a new account':'Log in'}</h2>
        <p className="text-sm text-slate-500 mb-6">Track your income, expenses, and categories.</p>
        <form onSubmit={submitAuth} className="space-y-4">
          {authMode==='register'&&<label className="block text-sm font-semibold">Name<input required maxLength={100} value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} className="mt-2 block w-full rounded-xl border border-slate-200 p-3" placeholder="Your name"/></label>}
          <label className="block text-sm font-semibold">Email<input required type="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} className="mt-2 block w-full rounded-xl border border-slate-200 p-3" placeholder="you@example.com"/></label>
          <label className="block text-sm font-semibold">Password<input required type="password" minLength={authMode==='register'?12:1} value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} className="mt-2 block w-full rounded-xl border border-slate-200 p-3" placeholder="Minimum 12 characters"/></label>
          {error&&<p role="alert" className="text-sm text-rose-600 bg-rose-50 rounded-xl p-3">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5">{busy?'Loading...':authMode==='register'?'Create Account':'Log in'}</button>
        </form>
        <button onClick={()=>{setAuthMode(authMode==='register'?'login':'register');setError('');}} className="w-full mt-5 text-sm text-blue-700 font-semibold">{authMode==='register'?'Already have an account? Log in':'New user? Register'}</button>
        <p className="text-xs text-slate-400 mt-7 flex items-center gap-2"><ShieldCheck size={15}/> Local development only · Not for production</p>
      </div>
    </main>
  );

  return <div className="min-h-screen">
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="bg-blue-600 text-white p-2.5 rounded-xl"><Wallet size={24}/></div><div><h1 className="font-extrabold text-lg leading-tight">Expense Tracker</h1><p className="text-xs text-slate-500">Final Build · v0.3</p></div></div>
        <div className="flex items-center gap-4"><span className="text-sm text-slate-600 hidden sm:inline">{user.name}</span><button onClick={logout} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-rose-600"><LogOut size={17}/> Logout</button></div>
      </div>
    </header>
    <main className="max-w-6xl mx-auto px-5 py-8 space-y-6">
      <div><p className="text-sm text-slate-500">SDLC / Iteration 3</p><h2 className="text-3xl font-bold mt-1">Your Financial Overview</h2><p className="text-slate-500 text-sm mt-1">Monthly summary, category breakdown, and interactive analytics charts.</p></div>
      <nav className="flex gap-2" aria-label="Application tabs">
        {[{id:'dashboard',label:'Dashboard',icon:Landmark},{id:'categories',label:'Categories',icon:Tags}].map(item=><button key={item.id} type="button" onClick={()=>{setTab(item.id as Tab);setError('');setNotice('');}} className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold border ${tab===item.id?'bg-blue-600 border-blue-600 text-white':'bg-white border-slate-200 text-slate-700'}`}><item.icon size={17}/>{item.label}</button>)}
      </nav>
      {notice&&<div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 flex gap-2 items-center"><CheckCircle2 size={18}/>{notice}</div>}
      {error&&<div role="alert" className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3">{error}</div>}
      {tab==='dashboard'?<>
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-slate-200 p-4">
          <label className="text-sm font-semibold flex items-center gap-3">Select Month
            <input type="month" value={month} onChange={e=>setMonth(e.target.value || today().slice(0,7))} className="border border-slate-200 rounded-lg p-2"/>
          </label>
          <span className="text-sm text-slate-500">{loading?'Updating...':`${monthly?.transactionCount || 0} transactions this month`}</span>
        </section>
        <section className="grid md:grid-cols-3 gap-4">
          {[
            {label:'Monthly Balance',value:monthly?.balance,icon:Landmark,accent:'text-blue-700',bg:'bg-blue-100'},
            {label:'Monthly Income',value:monthly?.income,icon:ArrowUpRight,accent:'text-emerald-700',bg:'bg-emerald-100'},
            {label:'Monthly Expense',value:monthly?.expense,icon:ArrowDownRight,accent:'text-rose-700',bg:'bg-rose-100'},
          ].map(card=><div key={card.label} className="rounded-2xl bg-white border border-slate-200 p-6 flex items-start justify-between shadow-sm"><div><div className="text-slate-500 text-sm">{card.label}</div><p className={`text-3xl font-extrabold mt-3 ${card.accent}`}>{bdt(card.value||'0')}</p></div><div className={`p-3 rounded-xl ${card.bg} ${card.accent}`}><card.icon size={23}/></div></div>)}
        </section>
        <p className="text-xs text-slate-500">All-time balance: <b>{bdt(summary?.balance || '0')}</b> · Includes transactions outside this month.</p>
        <section aria-label="Financial analytics dashboard" className="grid lg:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><PieIcon size={20} className="text-blue-600"/><h3 className="font-bold text-lg">Category-Wise Expenses</h3></div>
            <p className="text-xs text-slate-500 mb-5">Expense distribution for the selected month</p>
            {expensePie.length > 0 ? <>
              <div role="img" aria-label="Pie chart of selected month's expense categories" className="w-full h-[265px]">
                <PieChart responsive style={{width:'100%',height:260}}>
                  <Pie data={expensePie} dataKey="value" nameKey="name" innerRadius={64} outerRadius={106} paddingAngle={3} strokeWidth={1}>
                    {expensePie.map((x,i) => <Cell key={x.name + i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(value) => bdt(Number(value || 0))}/>
                </PieChart>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 mt-1" aria-label="Expense category values">
                {expensePie.map((entry,i) => <div key={`${entry.name}-${i}`} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-2 min-w-0"><span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{backgroundColor:CHART_COLORS[i%CHART_COLORS.length]}}/><span className="truncate" title={entry.name}>{entry.name}</span></span>
                  <strong className="tabular-nums shrink-0">{bdt(entry.value)}</strong>
                </div>)}
              </div>
            </> : <div className="min-h-[260px] flex items-center justify-center text-center text-sm text-slate-500 bg-slate-50 rounded-xl px-5">No expenses this month. Add expenses to see the pie chart.</div>}
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2"><BarChart3 size={20} className="text-blue-600"/><h3 className="font-bold text-lg">Income vs Expense</h3></div>
              <label className="text-xs text-slate-600">Range <select value={trendRange} onChange={e=>setTrendRange(Number(e.target.value) as 3|6|12)} className="rounded-lg border border-slate-200 px-2 py-1.5 ml-1" aria-label="Trend range in months"><option value={3}>3 months</option><option value={6}>6 months</option><option value={12}>12 months</option></select></label>
            </div>
            <p className="text-xs text-slate-500 mb-5">Income vs expense comparison up to the selected month</p>
            {barData.length > 0 ? <>
              <div role="img" aria-label="Bar chart comparing monthly income and expenses" className="w-full h-[265px]">
                <BarChart responsive data={barData} style={{width:'100%',height:260}} margin={{top:8,right:8,bottom:4,left:0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                  <XAxis dataKey="month" tickFormatter={value => String(value).slice(5)} fontSize={11} tickLine={false}/>
                  <YAxis tickFormatter={value => Number(value).toLocaleString('en-US',{notation:'compact'})} width={45} fontSize={11} tickLine={false}/>
                  <Tooltip formatter={(value) => bdt(Number(value || 0))}/>
                  <Bar dataKey="income" name="Income" fill="#059669" radius={[4,4,0,0]} maxBarSize={32}/>
                  <Bar dataKey="expense" name="Expense" fill="#e11d48" radius={[4,4,0,0]} maxBarSize={32}/>
                </BarChart>
              </div>
              <div className="flex gap-5 text-xs mt-2 text-slate-600"><span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-600 mr-1"/> Income</span><span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-600 mr-1"/> Expense</span></div>
            </> : <div className="min-h-[260px] flex items-center justify-center text-sm text-slate-500">No trend data available</div>}
          </div>
        </section>
        <section className="grid lg:grid-cols-[390px_1fr] gap-5 items-start">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5"><div className="flex gap-2 items-center"><CirclePlus size={20} className="text-blue-600"/><h3 className="text-lg font-bold">{editing?'Edit Transaction':'New Transaction'}</h3></div>{editing&&<button onClick={resetForm} aria-label="Cancel edit"><X size={18}/></button>}</div>
            <form onSubmit={saveTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>{setKind('EXPENSE');setCategoryId('');}} className={`rounded-xl border py-2.5 text-sm font-bold ${kind==='EXPENSE'?'border-rose-200 bg-rose-50 text-rose-700':'border-slate-200 text-slate-500'}`}>Expense</button><button type="button" onClick={()=>{setKind('INCOME');setCategoryId('');}} className={`rounded-xl border py-2.5 text-sm font-bold ${kind==='INCOME'?'border-emerald-200 bg-emerald-50 text-emerald-700':'border-slate-200 text-slate-500'}`}>Income</button></div>
              <label className="block text-sm font-semibold">Amount (BDT)<input required type="text" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3"/></label>
              <label className="block text-sm font-semibold">Category<select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3"><option value="">Uncategorized</option>{kindCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <label className="block text-sm font-semibold">Date<input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3"/></label>
              <label className="block text-sm font-semibold">Description<textarea rows={2} maxLength={250} value={description} onChange={e=>setDescription(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 resize-y" placeholder="e.g. Lunch, Bus Fare"/></label>
              <button disabled={busy} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5">{busy?'Saving...':editing?'Update':'Save Transaction'}</button>
            </form>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 flex flex-wrap justify-between gap-3 items-center"><div className="flex gap-2 items-center"><ReceiptText size={20} className="text-blue-600"/><h3 className="font-bold text-lg">Transactions for Selected Month</h3></div><select aria-label="Filter by transaction type" className="border border-slate-200 rounded-lg p-2 text-sm" value={filterKind} onChange={e=>setFilterKind(e.target.value as KindFilter)}><option value="ALL">All types</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option></select></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[550px] text-left"><thead className="bg-slate-50 text-slate-500 text-xs"><tr><th className="p-4">Date / Detail</th><th className="p-4">Category</th><th className="p-4 text-right">Amount</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{list.map(t=><tr key={t.id} className="border-t border-slate-100"><td className="px-4 py-3"><div className="font-semibold text-sm">{t.description || (t.kind==='INCOME'?'Income':'Expense')}</div><div className="text-xs text-slate-500">{t.transactionDate}</div></td><td className="px-4 py-3 text-sm text-slate-600">{t.categoryName||'—'}</td><td className={`px-4 py-3 text-right text-sm font-bold ${t.kind==='INCOME'?'text-emerald-700':'text-rose-700'}`}>{t.kind==='INCOME'?'+':'−'}{bdt(t.amount)}</td><td className="px-4 py-3"><div className="flex items-center justify-end gap-2"><button title="Edit" onClick={()=>beginEdit(t)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"><Edit3 size={16}/></button><button disabled={busy} title="Delete" onClick={()=>void deleteTransaction(t.id)} className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg"><Trash2 size={16}/></button></div></td></tr>)}{list.length===0&&<tr><td colSpan={4} className="text-center p-12 text-slate-500">No transactions found for the selected filter this month.</td></tr>}</tbody></table></div>
            <div className="px-6 py-4 text-xs text-slate-400 border-t border-slate-100">Showing up to 100 matching transactions; summary covers the full month.</div>
          </div>
        </section>
        <section className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Monthly Category Summary</h3>
          {monthly?.categories.length ? <div className="grid sm:grid-cols-2 gap-3">{monthly.categories.map((entry,i)=><div key={`${entry.kind}-${entry.name}-${i}`} className="flex justify-between items-center gap-4 p-3 rounded-xl bg-slate-50"><div><p className="font-semibold text-sm">{entry.name}</p><p className="text-xs text-slate-500">{entry.kind==='INCOME'?'Income':'Expense'} · {entry.count}</p></div><span className={`font-bold ${entry.kind==='INCOME'?'text-emerald-700':'text-rose-700'}`}>{bdt(entry.total)}</span></div>)}</div> : <p className="text-slate-500 text-sm">No category summary for this month.</p>}
        </section>
      </> : <section className="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><CirclePlus size={20} className="text-blue-600"/><h3 className="font-bold text-lg">New Category</h3></div>
          <form onSubmit={createCategory} className="space-y-4">
            <label className="block text-sm font-semibold">Category Type<select value={newCategoryKind} onChange={e=>setNewCategoryKind(e.target.value as Kind)} className="mt-2 block w-full rounded-xl border border-slate-200 p-3"><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></label>
            <label className="block text-sm font-semibold">Category Name<input required minLength={2} maxLength={60} value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)} placeholder="e.g. Books" className="mt-2 block w-full rounded-xl border border-slate-200 p-3"/></label>
            <button disabled={busy} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3">Create Category</button>
          </form>
          <p className="mt-4 text-xs text-slate-500">Category type cannot be changed after creation.</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><Tags size={20} className="text-blue-600"/><h3 className="font-bold text-lg">Your Categories</h3><span className="text-xs text-slate-500 ml-auto">{categories.length} total</span></div>
          <div className="space-y-2">{categories.map(c=><div key={c.id} className="p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {renaming===c.id ? <form onSubmit={e=>void renameCategory(e,c.id)} className="flex flex-wrap items-center gap-2 flex-1"><input required minLength={2} maxLength={60} value={renameName} onChange={e=>setRenameName(e.target.value)} className="flex-1 min-w-28 p-2 rounded-lg border border-slate-200"/><button disabled={busy} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Save</button><button type="button" onClick={()=>setRenaming(null)} className="p-2" aria-label="Cancel rename"><X size={17}/></button></form> : <><div><p className="font-semibold text-sm">{c.name}</p><p className="text-xs text-slate-500">{c.kind==='INCOME'?'Income':'Expense'}</p></div><div className="flex items-center gap-2"><button title="Rename" onClick={()=>{setRenaming(c.id);setRenameName(c.name);}} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"><Edit3 size={17}/></button><button disabled={busy} title="Delete" onClick={()=>void deleteCategory(c.id)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 size={17}/></button></div></>}
          </div>)}{categories.length===0&&<p className="text-slate-500 text-sm">No categories yet.</p>}</div>
          <p className="mt-4 text-xs text-slate-500">To delete a category that has transactions, first move those transactions to another category.</p>
        </div>
      </section>}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 flex gap-3"><ShieldCheck size={23} className="text-blue-700 shrink-0"/><div><h4 className="font-bold text-sm">Reusable API-First Architecture</h4><p className="text-sm text-slate-600 mt-1">Frontend uses <code>/api/v1</code>. External SSO, Webhooks, and Production Deployment are not yet implemented.</p></div></div>
      <footer className="text-center text-xs text-slate-400 py-4">Expense Tracker · Iteration 3 Final Build · Educational release candidate</footer>
    </main>
  </div>;
}
