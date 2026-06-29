/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles, User, Mail, Lock, CheckCircle2, Camera, FileText, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { FullLogo } from '../../components/common/Logo';

const locationsData: Record<string, Record<string, string[]>> = {
  "Tamil Nadu": {
    "Chennai": ["Adyar", "Velachery", "Mylapore", "Nungambakkam"],
    "Coimbatore": ["Gandhipuram", "Peelamedu", "Singanallur"],
    "Madurai": ["Tallakulam", "K.Pudur", "Simmakkal"]
  },
  "Karnataka": {
    "Bengaluru": ["Indiranagar", "Koramangala", "Jayanagar", "Whitefield"],
    "Mysuru": ["Gokulam", "Vidyaranyapuram", "Jayalakshmipuram"]
  },
  "Maharashtra": {
    "Mumbai": ["Andheri", "Bandra", "Colaba", "Dadar"],
    "Pune": ["Kothrud", "Kalyani Nagar", "Hinjawadi"]
  }
};

export const Login: React.FC = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'citizen' | 'volunteer' | 'gov' | 'admin'>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Government / Admin register extra fields
  const [dept, setDept] = useState('PWD');
  const [designation, setDesignation] = useState('');
  const [empId, setEmpId] = useState('');
  const [ward, setWard] = useState('Ward 42');
  
  // Hierarchical location states
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [selectedDistrict, setSelectedDistrict] = useState('Chennai');
  const [selectedPlace, setSelectedPlace] = useState('Velachery');

  const [avatarUrl, setAvatarUrl] = useState('');
  const [idProofUrl, setIdProofUrl] = useState('');

  // Update dropdown values dynamically
  useEffect(() => {
    const districts = Object.keys(locationsData[selectedState] || {});
    if (districts.length > 0) {
      setSelectedDistrict(districts[0]);
    }
  }, [selectedState]);

  useEffect(() => {
    const places = locationsData[selectedState]?.[selectedDistrict] || [];
    if (places.length > 0) {
      setSelectedPlace(places[0]);
    }
  }, [selectedState, selectedDistrict]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdProofFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // Prepare optional payload
        const extra: any = {};
        if (role === 'gov' || role === 'admin') {
          if (!designation || !empId) {
            throw new Error('Please fill in your Official ID and Designation');
          }
          if (!idProofUrl) {
            throw new Error('Please upload your ID Proof document for audit compliance');
          }
          extra.department = dept;
          extra.designation = designation;
          extra.employee_id = empId;
          extra.ward_number = ward;
          extra.state = selectedState;
          extra.district = selectedDistrict;
          extra.place = selectedPlace;
          extra.id_proof_url = idProofUrl;
          extra.avatar_url = avatarUrl || undefined;
        }

        await signup(name, email, password, role, extra);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (eMail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(eMail, 'password');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-root" className="min-h-screen bg-white flex items-center justify-center p-4 relative font-sans">
      <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-md z-10 relative">
        <div className="text-center mb-8">
          <FullLogo horizontal={false} size={64} />
        </div>

        {error && (
          <div id="auth-error" className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-lg font-medium text-center">
            {error}
          </div>
        )}

        {/* Toggle Mode buttons */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 mb-6">
          <button
            id="toggle-login"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isLogin ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In Account
          </button>
          <button
            id="toggle-register"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isLogin ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Role selection tab for Register */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">I am joining as:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['citizen', 'volunteer', 'gov', 'admin'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        role === r 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      {r === 'gov' ? 'Gov Official' : r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          {/* Government & Admin registration details block */}
          {!isLogin && (role === 'gov' || role === 'admin') && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-4 mt-4"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                {role.toUpperCase()} JURISDICTION &amp; AUDIT SETUP
              </div>

              {/* Dynamic Location Dropdowns Hierarchy */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">State</label>
                  <select
                    value={selectedState}
                    onChange={e => setSelectedState(e.target.value)}
                    className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {Object.keys(locationsData).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">District / City</label>
                  <select
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {Object.keys(locationsData[selectedState] || {}).map(dt => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Place / Posting</label>
                  <select
                    value={selectedPlace}
                    onChange={e => setSelectedPlace(e.target.value)}
                    className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {(locationsData[selectedState]?.[selectedDistrict] || []).map(pl => (
                      <option key={pl} value={pl}>{pl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Department</label>
                  <select
                    value={dept}
                    onChange={e => setDept(e.target.value)}
                    className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PWD">PWD (Roads &amp; Transport)</option>
                    <option value="MetroWater">Metro Water Board</option>
                    <option value="Electricity">Electricity Board (TNEB)</option>
                    <option value="Corporation">Municipal Corporation</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    placeholder="e.g. Junior Engineer"
                    className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Employee ID / Code</label>
                  <input
                    type="text"
                    required
                    value={empId}
                    onChange={e => setEmpId(e.target.value)}
                    placeholder="e.g. EMP-9102"
                    className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Assigned Ward</label>
                  <input
                    type="text"
                    required
                    value={ward}
                    onChange={e => setWard(e.target.value)}
                    placeholder="e.g. Ward 42"
                    className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Photo & ID Proof Uploaders */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Official Photo Profile</label>
                  <div className="flex items-center gap-2">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <Camera className="w-4 h-4" />
                      </div>
                    )}
                    <label className="bg-white hover:bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-[10px] text-slate-600 font-semibold cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Photo
                      <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Official ID Proof Document</label>
                  <div className="flex items-center gap-2">
                    {idProofUrl ? (
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <label className="bg-white hover:bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-[10px] text-slate-600 font-semibold cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload ID
                      <input type="file" accept="image/*,application/pdf" onChange={handleIdProofFile} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {role === 'gov' && (
                <p className="text-[9px] text-amber-600 font-semibold leading-relaxed">
                  ⚠️ Alert: Your profile will remain in "Pending Audit" status until approved by a State Admin.
                </p>
              )}
            </motion.div>
          )}

          <button
            id="auth-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm mt-4 text-white cursor-pointer"
          >
            {loading ? 'Processing Session...' : isLogin ? 'Sign In Portal' : 'Register Community Profile'}
          </button>
        </form>

        {/* Quick Demo Accounts login list */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-3">Quick Access Demo Profiles:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button 
              id="quick-priya"
              onClick={() => handleQuickLogin('priya.rajan@gmail.com')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all hover:border-slate-300 cursor-pointer"
            >
              <p className="text-[10px] font-bold text-slate-800">Citizen</p>
              <p className="text-[8px] text-slate-500 truncate">Priya Rajan</p>
            </button>
            <button 
              id="quick-suresh"
              onClick={() => handleQuickLogin('suresh.kumar@gmail.com')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all hover:border-slate-300 cursor-pointer"
            >
              <p className="text-[10px] font-bold text-slate-800">Volunteer</p>
              <p className="text-[8px] text-slate-500 truncate">Suresh Kumar</p>
            </button>
            <button 
              id="quick-gov"
              onClick={() => handleQuickLogin('muthu.selvam@gov.in')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all hover:border-slate-300 cursor-pointer"
            >
              <p className="text-[10px] font-bold text-slate-800">Gov Official</p>
              <p className="text-[8px] text-slate-500 truncate">Eng. Muthu</p>
            </button>
            <button 
              id="quick-admin"
              onClick={() => handleQuickLogin('admin@communityhero.in')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all hover:border-slate-300 cursor-pointer"
            >
              <p className="text-[10px] font-bold text-slate-800">Admin</p>
              <p className="text-[8px] text-slate-500 truncate">Sys Administrator</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
