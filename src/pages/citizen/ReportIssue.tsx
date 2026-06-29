/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/aiService';
import { issueService } from '../../services/issueService';
import { Camera, RefreshCw, Send, CheckCircle, Compass, Sparkles, MapPin, AlertTriangle, Smartphone, Video, Trash2, Plus, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

const resizeImageBase64 = (base64Str: string, maxDimension = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress as JPEG at 80% quality
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export const ReportIssue: React.FC = () => {
  const { refreshUser } = useAuth();
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Native hardware-only capture control states
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [aiImage, setAiImage] = useState<string>('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const extractVideoFrame = (videoBase64: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoBase64;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      
      video.onloadeddata = () => {
        video.currentTime = 0.5; // seek past first frame
      };
      
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve('');
          }
        } catch (e) {
          console.error('Video frame draw error:', e);
          resolve('');
        }
      };
      
      video.onerror = () => {
        resolve('');
      };
      
      video.load();
    });
  };

// Form Fields (filled by Gemini)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'road' | 'water' | 'lighting' | 'waste' | 'drainage' | 'other'>('road');
  const [severity, setSeverity] = useState(3);

  // Geo / Compass parameters
  const [lat, setLat] = useState(13.0015);
  const [lng, setLng] = useState(80.2440);
  const [bearing, setBearing] = useState(180);
  const [address, setAddress] = useState('Phoenix Market City entrance gate, Velachery Main Road, Chennai');
  const [reportState, setReportState] = useState('Tamil Nadu');
  const [reportDistrict, setReportDistrict] = useState('Chennai');
  const [reportArea, setReportArea] = useState('Velachery');
  const [reportWard, setReportWard] = useState('Ward 42');
  const [gpsTracking, setGpsTracking] = useState(false);

  const lastGeocodedCoords = useRef<{ lat: number; lng: number } | null>(null);
  const geocodeTimeoutRef = useRef<any>(null);

  const reverseGeocode = async (latitude: number, longitude: number): Promise<{
    address: string;
    state: string;
    district: string;
    area: string;
    ward: string;
  }> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MunicipalCivicApp/1.0 (babasekar.in@gmail.com)'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const addrObj = data.address;
          const state = addrObj.state || 'Tamil Nadu';
          const district = addrObj.city || addrObj.town || addrObj.district || addrObj.county || 'Chennai';
          const area = addrObj.suburb || addrObj.neighbourhood || addrObj.city_district || addrObj.village || 'Velachery';
          const postcode = addrObj.postcode || '';
          
          const address = data.display_name || `${area}, ${district}, ${state}`;
          
          let ward = 'Ward 42';
          if (postcode && /^\d+$/.test(postcode)) {
            const lastTwo = parseInt(postcode.slice(-2));
            if (!isNaN(lastTwo) && lastTwo > 0) {
              ward = `Ward ${lastTwo}`;
            }
          } else {
            const hash = area.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            ward = `Ward ${(hash % 150) + 1}`;
          }

          return {
            address,
            state,
            district,
            area,
            ward
          };
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
    
    return {
      address: `Near ${latitude.toFixed(5)}, ${longitude.toFixed(5)}, Velachery, Chennai`,
      state: 'Tamil Nadu',
      district: 'Chennai',
      area: 'Velachery',
      ward: 'Ward 42'
    };
  };

  const updateLocationDetails = (latitude: number, longitude: number) => {
    if (lastGeocodedCoords.current) {
      const distLat = Math.abs(lastGeocodedCoords.current.lat - latitude);
      const distLng = Math.abs(lastGeocodedCoords.current.lng - longitude);
      if (distLat < 0.0002 && distLng < 0.0002) {
        return;
      }
    }

    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    geocodeTimeoutRef.current = setTimeout(async () => {
      lastGeocodedCoords.current = { lat: latitude, lng: longitude };
      const geoResult = await reverseGeocode(latitude, longitude);
      setAddress(geoResult.address);
      setReportState(geoResult.state);
      setReportDistrict(geoResult.district);
      setReportArea(geoResult.area);
      setReportWard(geoResult.ward);
    }, 1200);
  };

  // Live geolocated coordinate and device orientation heading degree watch hook
  useEffect(() => {
    let geoWatchId: number | null = null;
    setGpsTracking(true);

    // Watch position in real-time immediately to prompt permission and track pre-capture
    if (navigator.geolocation) {
      geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          setLat(currentLat);
          setLng(currentLng);
          updateLocationDetails(currentLat, currentLng);
        },
        (err) => {
          console.warn('Live location permission or tracking failed:', err);
        },
        { enableHighAccuracy: true }
      );
    }

    // Capture device compass angle degree in real-time
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const heading = (e as any).webkitCompassHeading || (360 - (e.alpha || 0));
      if (heading !== undefined && heading !== null && !isNaN(heading)) {
        setBearing(Math.round(heading));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(geoWatchId);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
      setGpsTracking(false);
    };
  }, []);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnalyzing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        // Compress/resize the image to make it extremely fast on mobile
        const base64String = await resizeImageBase64(rawBase64, 1024);
        
        setMediaList(prev => {
          if (prev.length >= 5) return prev;
          const newList = [...prev, base64String];
          setPhoto(JSON.stringify(newList));
          setActiveMediaIndex(newList.length - 1);
          if (newList.length === 1) {
            setAiImage(base64String);
            triggerAiAnalysis(base64String);
          }
          return newList;
        });
        setMediaType('image');
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleVideoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnalyzing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setMediaList([base64String]);
        setPhoto(JSON.stringify([base64String]));
        setMediaType('video');
        setActiveMediaIndex(0);
        
        // Extract first frame for AI scanning
        const frame = await extractVideoFrame(base64String);
        if (frame) {
          const compressedFrame = await resizeImageBase64(frame, 1024);
          setAiImage(compressedFrame);
          triggerAiAnalysis(compressedFrame);
        } else {
          setAiImage(base64String);
          triggerAiAnalysis(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removeCapturedPhoto = (indexToRemove: number) => {
    setMediaList(prev => {
      const newList = prev.filter((_, idx) => idx !== indexToRemove);
      if (newList.length === 0) {
        setPhoto(null);
        setMediaType(null);
        setAiImage('');
        setAnalyzed(false);
      } else {
        setPhoto(JSON.stringify(newList));
        const newActiveIndex = Math.max(0, indexToRemove - 1);
        setActiveMediaIndex(newActiveIndex);
        if (indexToRemove === 0) {
          setAiImage(newList[0]);
          triggerAiAnalysis(newList[0]);
        }
      }
      return newList;
    });
  };

  const triggerAiAnalysis = async (imageBase64: string) => {
    setAnalyzing(true);
    setAnalyzed(false);
    try {
      const analysis = await aiService.categorizeImage(imageBase64);
      setTitle(analysis.title);
      setDescription(analysis.description);
      setCategory(analysis.category as any);
      setSeverity(analysis.severity);
      setAnalyzed(true);
    } catch (e) {
      console.error('Error during AI analysis', e);
      // Fallback details if Gemini fails or offline
      setTitle('Pothole on Local Street');
      setDescription('Large hazard pothole causing road obstruction. Dangerous for evening traffic.');
      setCategory('road');
      setSeverity(4);
      setAnalyzed(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return;

    setLoading(true);
    setVerifying(true);
    setValidationError(null);

    try {
      // 1. Verify Report Image, Category & Fake Prevention using Gemini AI on the analyzed frame/photo
      const check = await aiService.verifyReport(aiImage || photo, category, title, description);
      
      if (!check.isRealIssue) {
        setValidationError(`Fake Report Warning: ${check.reason}`);
        setVerifying(false);
        setLoading(false);
        return;
      }

      if (!check.categoryMatched) {
        setValidationError(`Category Mismatch: ${check.reason}`);
        setVerifying(false);
        setLoading(false);
        return;
      }

      // 2. Submit the verified issue report
      await issueService.reportIssue({
        photo_url: photo,
        lat,
        lng,
        bearing,
        category,
        severity,
        title,
        description,
        address,
        state: reportState,
        district: reportDistrict,
        area: reportArea,
        ward: reportWard
      });
      setSuccess(true);
      await refreshUser();
    } catch (err) {
      console.error(err);
      setValidationError('Failed to file issue report due to connection or server issues');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const resetForm = () => {
    setPhoto(null);
    setMediaList([]);
    setMediaType(null);
    setActiveMediaIndex(0);
    setAiImage('');
    setAnalyzed(false);
    setSuccess(false);
    setValidationError(null);
    setTitle('');
    setDescription('');
    setCategory('road');
    setSeverity(3);
  };

  return (
    <>
      {/* DESKTOP SCREEN NOTICE */}
      <div className="hidden md:flex flex-col items-center justify-center text-center p-8 space-y-6 max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
          <Smartphone className="w-8 h-8 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Mobile Device Required</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            To ensure genuine hyperlocal telemetry (on-ground GPS coordinate verification, compass bearing alignment, and live proof validation), civic issue reporting is exclusively restricted to mobile devices.
          </p>
        </div>
        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl w-full text-[11px] font-bold text-indigo-700 tracking-wider">
          PLEASE OPEN ON A MOBILE PORTAL
        </div>
      </div>

      {/* MOBILE CONTENT ONLY */}
      <div id="report-root" className="md:hidden block max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Camera className="w-5 h-5 text-indigo-600" />
            Capture & File Local Civic Issue
          </h2>
          <p className="text-[10px] text-slate-400">Gemini will auto-classify your photo/video, GPS location, and compass alignment</p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 text-center space-y-4 border border-emerald-100 bg-emerald-50/50 rounded-2xl"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-slate-800 uppercase">Civic Report Filed Successfully!</h3>
                <p className="text-xs text-slate-500">Your report has been logged into the regional municipal ward ledger.</p>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl max-w-xs mx-auto flex items-center justify-center gap-2 shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-slate-700">+10 XP Civic Points Awarded!</span>
              </div>
              <button
                id="report-again"
                onClick={resetForm}
                className="px-6 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow hover:bg-indigo-500 transition-colors"
              >
                Report Another Issue
              </button>
            </motion.div>
          ) : (
            <motion.div key="report-form" className="space-y-6">
              {/* Photo / Video Capture widget */}
              {!photo || mediaList.length === 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Photo Mode Button */}
                    <div 
                      id="btn-photo-capture"
                      onClick={() => photoInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all min-h-[200px]"
                    >
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 shadow-sm">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Camera (Photo Mode)</h4>
                        <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                          Capture live, on-ground proof. Supports up to 5 pictures.
                        </p>
                      </div>
                      <span className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider shadow-sm transition-colors">
                        Capture Photo
                      </span>
                    </div>

                    {/* Video Mode Button */}
                    <div 
                      id="btn-video-capture"
                      onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-rose-400 hover:bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all min-h-[200px]"
                    >
                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100 shadow-sm">
                        <Video className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Video Mode</h4>
                        <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                          Record a video concern to show live motion proof.
                        </p>
                      </div>
                      <span className="text-[10px] bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider shadow-sm transition-colors">
                        Record Video
                      </span>
                    </div>
                  </div>

                  {/* Hidden inputs forcing native camera/camcorder on mobile with capture="environment" */}
                  <input 
                    type="file"
                    ref={photoInputRef}
                    onChange={handlePhotoCapture}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                  <input 
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoCapture}
                    accept="video/*"
                    capture="environment"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Hidden inputs for adding additional images or reshooting video */}
                  <input 
                    type="file"
                    ref={photoInputRef}
                    onChange={handlePhotoCapture}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                  <input 
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoCapture}
                    accept="video/*"
                    capture="environment"
                    className="hidden"
                  />

                  {/* Media Frame/Preview Box */}
                  <div className="h-64 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-inner flex items-center justify-center">
                    {mediaType === 'video' ? (
                      <video 
                        src={mediaList[0]} 
                        controls 
                        className="w-full h-full object-cover animate-fade-in" 
                        playsInline
                      />
                    ) : (
                      <img 
                        src={mediaList[activeMediaIndex]} 
                        alt="Issue preview" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                    
                    {analyzing && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10">
                        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                        <p className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                          GEMINI COGNITIVE SCANNING...
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs">AI is analyzing pixels to index category, severity, title, and initial descriptions</p>
                      </div>
                    )}

                    {!analyzing && (
                      <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                        {mediaType === 'image' ? (
                          <button
                            type="button"
                            onClick={() => removeCapturedPhoto(activeMediaIndex)}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow backdrop-blur transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Photo
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="bg-slate-900/80 hover:bg-slate-950 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow backdrop-blur transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reshoot Video
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Carousel list or indicator */}
                  {mediaType === 'image' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {mediaList.map((m, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setActiveMediaIndex(idx)}
                            className={`w-14 h-14 rounded-lg overflow-hidden cursor-pointer relative border-2 transition-all shrink-0 ${
                              activeMediaIndex === idx ? 'border-indigo-600 scale-105 shadow-md' : 'border-slate-200'
                            }`}
                          >
                            <img src={m} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[7px] font-black px-1 rounded">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}

                        {mediaList.length < 5 && !analyzing && (
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-5/50 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shrink-0"
                          >
                            <Plus className="w-5 h-5" />
                            <span className="text-[7px] font-bold uppercase mt-0.5">Add</span>
                          </button>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Photos Captured: {mediaList.length} / 5
                        </span>
                        {mediaList.length > 1 && (
                          <span className="text-[9px] font-bold text-indigo-600 uppercase">
                            First photo is analyzed by Gemini
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {mediaType === 'video' && (
                    <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>Video successfully captured. Play to review or tap <strong>Reshoot</strong> to record again.</span>
                      </div>
                    </div>
                  )}

                  {/* Scanned/Populated details */}
                  {analyzed && (
                    <motion.form
                      id="submit-report-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSubmitReport}
                      className="space-y-4"
                    >
                    {validationError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2.5"
                      >
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-wider text-rose-900">Gemini Verification Block</p>
                          <p className="text-[11px] font-medium leading-relaxed">{validationError}</p>
                        </div>
                      </motion.div>
                    )}

                    <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                      <p className="text-[10px] font-bold text-indigo-800 leading-normal uppercase">
                        AI AUTODETECT COMPLETED. Review details below prior to ledger commit.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Auto-Indexed Title</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Identified Category</label>
                        <select
                          value={category}
                          onChange={e => setCategory(e.target.value as any)}
                          className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                        >
                          <option value="road">Road / Pothole</option>
                          <option value="water">Water Leak</option>
                          <option value="lighting">Street Light</option>
                          <option value="waste">Waste / Garbage Dumping</option>
                          <option value="drainage">Drainage / Sewer</option>
                          <option value="other">Other Civic Issue</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">AI Severity rating: {severity}/5</label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={severity}
                          onChange={e => setSeverity(parseInt(e.target.value))}
                          className="flex-1 accent-indigo-600"
                        />
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded font-bold border border-amber-100">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Severity {severity}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Auto-Generated Issue Description</label>
                      <textarea
                        rows={3}
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* GPS Coordinates and compass simulation metadata */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-indigo-500" />
                        Live Geo & Compass Alignment metadata
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2 border border-slate-100 rounded">
                          <p className="text-[9px] text-slate-400">Lat Coordinates</p>
                          <input
                            type="number"
                            step="any"
                            value={lat}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              setLat(val);
                              if (!isNaN(val)) updateLocationDetails(val, lng);
                            }}
                            className="font-bold text-slate-800 focus:outline-none w-full mt-0.5"
                          />
                        </div>
                        <div className="bg-white p-2 border border-slate-100 rounded">
                          <p className="text-[9px] text-slate-400">Lng Coordinates</p>
                          <input
                            type="number"
                            step="any"
                            value={lng}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              setLng(val);
                              if (!isNaN(val)) updateLocationDetails(lat, val);
                            }}
                            className="font-bold text-slate-800 focus:outline-none w-full mt-0.5"
                          />
                        </div>
                        <div className="bg-white p-2 border border-slate-100 rounded">
                          <p className="text-[9px] text-slate-400">Compass Bearing</p>
                          <input
                            type="number"
                            value={bearing}
                            onChange={e => setBearing(parseInt(e.target.value))}
                            className="font-bold text-slate-800 focus:outline-none w-full mt-0.5"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Determined Address Location</label>
                        <div className="relative mt-1">
                          <MapPin className="absolute left-2 top-2.5 w-3.5 h-3.5 text-indigo-500" />
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-100 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      id="report-submit"
                      type="submit"
                      disabled={loading || verifying}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-bold py-2.5 rounded-lg text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      {verifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Verifying report with Gemini...
                        </>
                      ) : loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Committing Report to Ward Ledger...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Commit Civic Report to Ledger
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};
