import { useMemo, useState, useEffect } from "react";
import { 
  Save, RotateCcw, Plus, Trash2, PencilLine, Image as ImageIcon, 
  Users, Trophy, Phone, CalendarRange, Upload, Eye, Rocket, Undo2, 
  ChevronUp, ChevronDown, Home, HelpCircle, Mail, MapPin, Sparkles,
  User, Activity, Check, XCircle, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { defaultSiteContent } from "../data/siteContent";
import { discardDraftSiteContent, publishDraftSiteContent, resetSiteContent, saveDraftSiteContent, setPreviewMode } from "../utils/siteContentStore";

const GRADIENT_PRESETS = [
  { name: "🦄 Lavender Gloom", gradient: "from-purple-500 via-indigo-500 to-blue-600", glow: "rgba(99, 102, 241, 0.4)" },
  { name: "🔥 Amber Ember", gradient: "from-amber-500 via-orange-500 to-red-600", glow: "rgba(249, 115, 22, 0.4)" },
  { name: "🌊 Cyan Wave", gradient: "from-cyan-500 via-blue-500 to-teal-600", glow: "rgba(6, 182, 212, 0.4)" },
  { name: "🍀 Emerald Aurora", gradient: "from-emerald-500 via-teal-500 to-green-600", glow: "rgba(16, 185, 129, 0.4)" },
  { name: "🍓 Neon Sunset", gradient: "from-pink-500 via-rose-500 to-red-600", glow: "rgba(244, 63, 94, 0.4)" },
  { name: "👑 Golden Palace", gradient: "from-yellow-400 via-amber-500 to-orange-600", glow: "rgba(245, 158, 11, 0.4)" }
];

const cardClass = "bg-[#0b0b16] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-xl";
const sectionTitleClass = "text-base md:text-lg font-display font-black text-white flex items-center gap-2.5 border-b border-white/[0.06] pb-3";
const inputClass = "w-full bg-white/[0.02] border border-white/[0.06] focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all font-medium";
const subCardClass = "bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] rounded-2xl p-5 space-y-4 relative transition-all group";
const ensureArray = (value) => (Array.isArray(value) ? value : []);

export default function SiteContentManager({ initialData, initialPreviewMode, onDraftSaved, onPublished }) {
  const [content, setContent] = useState(initialData);
  const [previewMode, setPreviewModeState] = useState(initialPreviewMode);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Custom Confirmation Dialog Modal State
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: 'Confirm Action',
    message: '',
    onConfirm: null
  });
  const [scrollToId, setScrollToId] = useState(null);

  useEffect(() => {
    if (scrollToId) {
      const el = document.getElementById(scrollToId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setScrollToId(null);
      } else {
        const timer = setTimeout(() => {
          const retryEl = document.getElementById(scrollToId);
          if (retryEl) {
            retryEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          setScrollToId(null);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [scrollToId, content]);

  const triggerConfirm = (message, onConfirm, title = 'Confirm Action') => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const update = (path, value) => {
    setContent((prev) => {
      const next = structuredClone(prev);
      let curr = next;
      for (let i = 0; i < path.length - 1; i += 1) curr = curr[path[i]];
      curr[path[path.length - 1]] = value;
      return next;
    });
  };

  const addItem = (path, item) => {
    setContent((prev) => {
      const next = structuredClone(prev);
      let curr = next;
      for (let i = 0; i < path.length; i += 1) curr = curr[path[i]];
      curr.push(item);
      return next;
    });
  };

  const removeItem = (path, index) => {
    setContent((prev) => {
      const next = structuredClone(prev);
      let curr = next;
      for (let i = 0; i < path.length; i += 1) curr = curr[path[i]];
      curr.splice(index, 1);
      return next;
    });
  };

  const moveItem = (path, index, direction) => {
    setContent((prev) => {
      const next = structuredClone(prev);
      let curr = next;
      for (let i = 0; i < path.length; i += 1) curr = curr[path[i]];
      const targetIndex = index + direction;
      if (targetIndex >= 0 && targetIndex < curr.length) {
        const temp = curr[index];
        curr[index] = curr[targetIndex];
        curr[targetIndex] = temp;
      }
      return next;
    });
  };

  const fileToDataUrl = async (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (path, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return showToast("Please upload an image file.", "error");
    if (file.size > 3 * 1024 * 1024) return showToast("Image is too large. Keep it under 3MB.", "error");
    const dataUrl = await fileToDataUrl(file);
    update(path, dataUrl);
  };

  // Local helper component to upload, reupload or delete photos for coordinators
  const PhotoManager = ({ path, photoVal }) => {
    return (
      <div className="flex items-center gap-2 w-full font-body">
        {photoVal ? (
          <div className="flex gap-2 w-full">
            <label className="flex-1 px-3.5 py-2.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-300 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs font-bold">
              <Upload className="w-3.5 h-3.5" /> Reupload Photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(path, e.target.files?.[0])} />
            </label>
            <button
              type="button"
              onClick={() => update(path, "")}
              className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Photo
            </button>
          </div>
        ) : (
          <label className="w-full px-3.5 py-2.5 bg-white/[0.02] border border-dashed border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 text-gray-400 hover:text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all text-xs font-semibold">
            <Upload className="w-3.5 h-3.5 text-gray-500" /> Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(path, e.target.files?.[0])} />
          </label>
        )}
      </div>
    );
  };

  const UploadButton = ({ path, labelText = "Upload Image" }) => (
    <label className="px-4 py-3 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-bold w-full md:w-auto">
      <Upload className="w-4 h-4" /> {labelText}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(path, e.target.files?.[0])} />
    </label>
  );

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await saveDraftSiteContent(content);
      onDraftSaved(content, previewMode);
      showToast("Draft saved to Supabase.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save draft.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    triggerConfirm(
      "Are you sure you want to publish this draft to the live website?",
      async () => {
        setSaving(true);
        try {
          await saveDraftSiteContent(content);
          await publishDraftSiteContent();
          onPublished(content, previewMode);
          showToast("Draft published to live website in Supabase!", "success");
        } catch (err) {
          console.error(err);
          showToast("Failed to publish content.", "error");
        } finally {
          setSaving(false);
        }
      },
      "Publish Site Draft"
    );
  };

  const handleDiscardDraft = () => {
    triggerConfirm(
      "Discard current draft and reload last published content?",
      async () => {
        setSaving(true);
        try {
          const published = await discardDraftSiteContent();
          const contentToUse = published || defaultSiteContent;
          setContent(contentToUse);
          onDraftSaved(contentToUse, previewMode);
          showToast("Draft discarded. Reloaded published content.", "success");
        } catch (err) {
          console.error(err);
          showToast("Failed to discard draft.", "error");
        } finally {
          setSaving(false);
        }
      },
      "Discard Draft Changes"
    );
  };

  const handleReset = () => {
    triggerConfirm(
      "Reset all website content to default values? This will overwrite existing configs.",
      async () => {
        setSaving(true);
        try {
          await resetSiteContent();
          setContent(defaultSiteContent);
          onPublished(defaultSiteContent, false);
          showToast("All website content reset to default values in Supabase.", "success");
        } catch (err) {
          console.error(err);
          showToast("Failed to reset content.", "error");
        } finally {
          setSaving(false);
        }
      },
      "Reset All Website Data"
    );
  };

  const togglePreview = async () => {
    const next = !previewMode;
    setSaving(true);
    try {
      await setPreviewMode(next);
      setPreviewModeState(next);
      onDraftSaved(content, next);
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle preview mode.", "error");
    } finally {
      setSaving(false);
    }
  };

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview & Dates", icon: CalendarRange },
      { id: "pickBattle", label: "Pick Your Battle", icon: Trophy },
      { id: "sports", label: "Sports Registrations", icon: PencilLine },
      { id: "accommodation", label: "Accommodation Settings", icon: Home },
      { id: "gallery", label: "Photo Gallery", icon: ImageIcon },
      { id: "contact", label: "Contact Info", icon: Phone },
      { id: "coordinators", label: "Coordinators", icon: Users },
    ],
    []
  );

  return (
    <div className="space-y-8 font-body">
      
      {/* ================= CONTROLLER BOX ================= */}
      <div className="bg-gradient-to-r from-[#0d0d1a] to-[#07070f] border border-white/[0.06] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative z-10">
          <div>
            <h3 className="text-xl font-display font-black tracking-wide text-white">Admin Content Studio</h3>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Design, draft, rearrange, and publish dynamic content instantly across GCEK Daksha.</p>
          </div>
          <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
            <button disabled={saving} onClick={handleSaveDraft} className="flex-1 lg:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/10">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Draft"}
            </button>
            <button disabled={saving} onClick={handlePublish} className="flex-1 lg:flex-none px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-500/10">
              <Rocket className="w-4 h-4" /> {saving ? "Publishing..." : "Publish Live"}
            </button>
            <button disabled={saving} onClick={handleDiscardDraft} className="flex-1 lg:flex-none px-4 py-2.5 bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/20 disabled:opacity-50 text-amber-300 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              <Undo2 className="w-4 h-4" /> Discard
            </button>
            <button disabled={saving} onClick={togglePreview} className={`flex-1 lg:flex-none px-4 py-2.5 text-white rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors ${previewMode ? "bg-fuchsia-600 hover:bg-fuchsia-700 shadow-lg shadow-fuchsia-500/10" : "bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]"}`}>
              <Eye className="w-4 h-4" /> {previewMode ? "Preview Mode: ON" : "Preview Mode: OFF"}
            </button>
            <button disabled={saving} onClick={handleReset} className="flex-1 lg:flex-none px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50 text-red-400 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/[0.06] pt-6 relative z-20">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold border transition-all flex items-center gap-2 ${
                  active 
                    ? "bg-purple-600/15 border-purple-500/30 text-purple-300 shadow-md shadow-purple-500/5 font-bold" 
                    : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                <TabIcon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-gray-500'}`} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW & HERO DATES ================= */}
      {activeTab === "overview" && (
        <div className={cardClass}>
          <h3 className={sectionTitleClass}>
            <CalendarRange className="w-5 h-5 text-purple-400" /> Hero Dates and Landing Page Statistics
          </h3>
          
          <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase text-purple-300/80 tracking-wider">Daksha Event Dates</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block">Start Date Banner Text</label>
                <input className={inputClass} value={content.heroDates.startDate} onChange={(e) => update(["heroDates", "startDate"], e.target.value)} placeholder="e.g. 21st March 2026" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block">End Date Banner Text</label>
                <input className={inputClass} value={content.heroDates.endDate} onChange={(e) => update(["heroDates", "endDate"], e.target.value)} placeholder="e.g. 23rd March 2026" />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase text-blue-300/80 tracking-wider">Fast Facts Metrics Counters</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block">Total Events</label>
                <input className={inputClass} value={content.homeStats.events} onChange={(e) => update(["homeStats", "events"], e.target.value)} placeholder="e.g. 9" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block">Total Athletes</label>
                <input className={inputClass} value={content.homeStats.athletes} onChange={(e) => update(["homeStats", "athletes"], e.target.value)} placeholder="e.g. 800+" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block">Festival Duration</label>
                <input className={inputClass} value={content.homeStats.duration} onChange={(e) => update(["homeStats", "duration"], e.target.value)} placeholder="e.g. 3 Days" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block">Sports Arenas</label>
                <input className={inputClass} value={content.homeStats.arena} onChange={(e) => update(["homeStats", "arena"], e.target.value)} placeholder="e.g. 1" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PICK YOUR BATTLE SPORTS ================= */}
      {activeTab === "pickBattle" && (
        <div className={cardClass}>
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <h3 className="text-base md:text-lg font-display font-black text-white flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-blue-400" /> Pick Your Battle Sports Display
            </h3>
            <button 
              onClick={() => {
                const newId = `battle-${Date.now()}`;
                addItem(["pickYourBattleSports"], { id: newId, name: "New Sport", emoji: "🏆", players: "11v11" });
                setScrollToId(newId);
              }} 
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Sport
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ensureArray(content.pickYourBattleSports).map((sport, i) => (
              <div id={sport.id} key={sport.id} className={subCardClass}>
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button 
                    disabled={i === 0} 
                    onClick={() => moveItem(["pickYourBattleSports"], i, -1)}
                    className="p-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-30 rounded-lg text-gray-400 hover:text-white"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    disabled={i === content.pickYourBattleSports.length - 1} 
                    onClick={() => moveItem(["pickYourBattleSports"], i, 1)}
                    className="p-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-30 rounded-lg text-gray-400 hover:text-white"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => removeItem(["pickYourBattleSports"], i)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400"
                    title="Remove Sport"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4 pr-16">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                    Sport Entry #{i + 1}
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Sport Title</label>
                      <input className={inputClass} value={sport.name} onChange={(e) => update(["pickYourBattleSports", i, "name"], e.target.value)} placeholder="Title" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Emoji</label>
                      <input className={inputClass} value={sport.emoji} onChange={(e) => update(["pickYourBattleSports", i, "emoji"], e.target.value)} placeholder="Emoji" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Player Breakdown Size</label>
                    <input className={inputClass} value={sport.players} onChange={(e) => update(["pickYourBattleSports", i, "players"], e.target.value)} placeholder="e.g. 11v11 or Singles/Doubles" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: SPORTS REGISTRATIONS & FEES ================= */}
      {activeTab === "sports" && (
        <div className={cardClass}>
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <h3 className="text-base md:text-lg font-display font-black text-white flex items-center gap-2.5">
              <PencilLine className="w-5 h-5 text-emerald-400" /> Sports Registrations, Fees & QR Codes
            </h3>
            <button 
              onClick={() => {
                const newId = `sport-${Date.now()}`;
                addItem(["registration", "sports"], { id: newId, name: "New Sport", teamSize: 1, fee: 0, icon: "🏅", description: "", qrCode: "" });
                setScrollToId(newId);
              }} 
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Sport
            </button>
          </div>

          <div className="space-y-4">
            {ensureArray(content.registration.sports).map((sport, i) => (
              <div id={sport.id} key={sport.id} className={subCardClass}>
                
                {/* Control utility buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button 
                    disabled={i === 0} 
                    onClick={() => moveItem(["registration", "sports"], i, -1)}
                    className="p-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-30 rounded-lg text-gray-400 hover:text-white"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    disabled={i === content.registration.sports.length - 1} 
                    onClick={() => moveItem(["registration", "sports"], i, 1)}
                    className="p-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-30 rounded-lg text-gray-400 hover:text-white"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => removeItem(["registration", "sports"], i)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400"
                    title="Delete Sport"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Sport Config #{i + 1}
                    </span>
                    <span className="text-sm font-bold text-white">{sport.name || "Unnamed Sport"}</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    
                    {/* Input configuration */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Sport Name *</label>
                        <input className={inputClass} value={sport.name} onChange={(e) => update(["registration", "sports", i, "name"], e.target.value)} placeholder="e.g. Volleyball" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Emoji / Icon Symbol</label>
                        <input className={inputClass} value={sport.icon || ""} onChange={(e) => update(["registration", "sports", i, "icon"], e.target.value)} placeholder="e.g. 🏐" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Team Size *</label>
                        <input className={inputClass} type="number" value={sport.teamSize} onChange={(e) => update(["registration", "sports", i, "teamSize"], Number(e.target.value || 0))} placeholder="Max players per team" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Registration Fee (₹) *</label>
                        <input className={inputClass} type="number" value={sport.fee} onChange={(e) => update(["registration", "sports", i, "fee"], Number(e.target.value || 0))} placeholder="Entry fee amount" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Description & Guidelines</label>
                        <input className={inputClass} value={sport.description || ""} onChange={(e) => update(["registration", "sports", i, "description"], e.target.value)} placeholder="Brief rule book link or description..." />
                      </div>
                    </div>

                    {/* QR Code and Uploader */}
                    <div className="lg:col-span-4 bg-black/45 border border-white/[0.04] p-4 rounded-xl space-y-3.5 flex flex-col justify-between h-full min-h-[220px]">
                      <div>
                        <label className="text-[10px] text-gray-400 font-bold uppercase mb-1.5 block">Payment QR Code *</label>
                        <div className="flex gap-2">
                          <input className={`${inputClass} text-xs py-2`} value={sport.qrCode || ""} onChange={(e) => update(["registration", "sports", i, "qrCode"], e.target.value)} placeholder="QR Code image source..." />
                          <UploadButton path={["registration", "sports", i, "qrCode"]} labelText="Upload" />
                        </div>
                      </div>

                      {/* Instant QR Visual Display */}
                      <div className="h-28 rounded-lg bg-[#07070f] border border-white/[0.04] flex items-center justify-center overflow-hidden">
                        {sport.qrCode ? (
                          <div className="relative group w-full h-full flex items-center justify-center">
                            <img src={sport.qrCode} alt="Payment QR" className="max-h-full max-w-full object-contain p-1" />
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[9px] text-white font-semibold">Image Uploaded</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-[10px] text-gray-600 space-y-1">
                            <HelpCircle className="w-5 h-5 mx-auto text-gray-700 animate-pulse" />
                            <p>No QR Code Set</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: ACCOMMODATION SETTINGS ================= */}
      {activeTab === "accommodation" && (
        <div className={cardClass}>
          <h3 className={sectionTitleClass}>
            <Home className="w-5 h-5 text-purple-400" /> Accommodation Booking & Hostel Charges
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Input Values */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase text-purple-300/80 tracking-wider">Hostel Boarding Fee</h4>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block">Accommodation Charge Per Person (₹) *</label>
                  <input 
                    className={inputClass} 
                    type="number" 
                    value={content.registration.accommodationCharge} 
                    onChange={(e) => update(["registration", "accommodationCharge"], Number(e.target.value || 0))} 
                    placeholder="e.g. 150" 
                  />
                  <p className="text-[10px] text-gray-500 mt-1.5">This price represents the cost per student per day for utilizing GCEK hostels.</p>
                </div>
              </div>

              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase text-blue-300/80 tracking-wider">Support Contact</h4>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block">Official WhatsApp Support Link / Number</label>
                  <input 
                    className={inputClass} 
                    value={content.registration.supportWhatsapp} 
                    onChange={(e) => update(["registration", "supportWhatsapp"], e.target.value)} 
                    placeholder="e.g. https://wa.me/919999999999" 
                  />
                  <p className="text-[10px] text-gray-500 mt-1.5">Direct chat links for accommodating participants seeking quick answers.</p>
                </div>
              </div>
            </div>

            {/* QR Code and Uploader */}
            <div className="lg:col-span-4 bg-black/45 border border-white/[0.04] p-6 rounded-3xl space-y-4 flex flex-col justify-between min-h-[300px]">
              <div>
                <h4 className="text-xs font-bold uppercase text-purple-300/80 tracking-wider mb-2">Accommodation QR Code</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed mb-4">Upload the official UPI merchant banner for participants making hostel reservations.</p>
                
                <div className="flex gap-2">
                  <input 
                    className={`${inputClass} text-xs py-2`} 
                    value={content.registration.accommodationQrCode} 
                    onChange={(e) => update(["registration", "accommodationQrCode"], e.target.value)} 
                    placeholder="QR image url..." 
                  />
                  <UploadButton path={["registration", "accommodationQrCode"]} labelText="Upload" />
                </div>
              </div>

              {/* QR Preview Display */}
              <div className="h-44 rounded-2xl bg-[#07070f] border border-white/[0.04] flex items-center justify-center overflow-hidden">
                {content.registration.accommodationQrCode ? (
                  <div className="relative group w-full h-full flex items-center justify-center">
                    <img src={content.registration.accommodationQrCode} alt="Accommodation QR" className="max-h-full max-w-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-white font-bold">Live Banner Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-600 space-y-1">
                    <HelpCircle className="w-6 h-6 mx-auto text-gray-700 animate-pulse" />
                    <p>No Accommodation QR Set</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= TAB 5: PHOTO GALLERY ================= */}
      {activeTab === "gallery" && (
        <div className={cardClass}>
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <h3 className="text-base md:text-lg font-display font-black text-white flex items-center gap-2.5">
              <ImageIcon className="w-5 h-5 text-pink-400" /> Interactive Photo Gallery Sections
            </h3>
            <button 
              onClick={() => {
                const newId = `gsec-${Date.now()}`;
                addItem(["gallery", "sections"], { id: newId, sport: "New Section", emoji: "📸", gradient: "from-purple-500 via-fuchsia-500 to-indigo-600", glow: "rgba(147, 51, 234, 0.4)", images: [] });
                setScrollToId(newId);
              }} 
              className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>

          <div className="space-y-6">
            {ensureArray(content.gallery.sections).map((section, si) => (
              <div id={section.id} key={section.id} className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.05] relative space-y-4">
                
                {/* Section utility controls */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button 
                    disabled={si === 0} 
                    onClick={() => moveItem(["gallery", "sections"], si, -1)}
                    className="p-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-30 rounded-lg text-gray-400 hover:text-white"
                    title="Move Up Section"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    disabled={si === content.gallery.sections.length - 1} 
                    onClick={() => moveItem(["gallery", "sections"], si, 1)}
                    className="p-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-30 rounded-lg text-gray-400 hover:text-white"
                    title="Move Down Section"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => {
                      const newId = `gimg-${Date.now()}`;
                      addItem(["gallery", "sections", si, "images"], { id: newId, url: "", title: "New Image", likes: 0 });
                      setScrollToId(newId);
                    }} 
                    className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Image
                  </button>
                  <button 
                    onClick={() => removeItem(["gallery", "sections"], si)} 
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400"
                    title="Delete Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-[10px] font-bold text-pink-300 uppercase tracking-wider">
                      Section #{si + 1}
                    </span>
                    <span className="text-sm font-bold text-white">{section.sport || "Unnamed Section"}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Section Title *</label>
                      <input className={inputClass} value={section.sport} onChange={(e) => update(["gallery", "sections", si, "sport"], e.target.value)} placeholder="e.g. Football" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Emoji Badge</label>
                      <input className={inputClass} value={section.emoji} onChange={(e) => update(["gallery", "sections", si, "emoji"], e.target.value)} placeholder="e.g. ⚽" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">CSS Gradient Code</label>
                      <input className={inputClass} value={section.gradient} onChange={(e) => update(["gallery", "sections", si, "gradient"], e.target.value)} placeholder="from-... via-..." />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Glow Drop-shadow Code</label>
                      <input className={inputClass} value={section.glow} onChange={(e) => update(["gallery", "sections", si, "glow"], e.target.value)} placeholder="rgba(...)" />
                    </div>
                  </div>

                  {/* Premium Designer Preset Picker */}
                  <div className="bg-black/35 p-4 rounded-xl border border-white/[0.04] space-y-2">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Click to Apply Pro Gradient & Shadow Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {GRADIENT_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            update(["gallery", "sections", si, "gradient"], preset.gradient);
                            update(["gallery", "sections", si, "glow"], preset.glow);
                          }}
                          className="px-2.5 py-1.5 bg-white/[0.02] hover:bg-purple-600/10 border border-white/[0.06] hover:border-purple-500/40 text-[10px] font-bold text-gray-300 hover:text-purple-200 rounded-lg transition-all"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Images Nested CRUD */}
                  <div className="space-y-3.5 pt-3 border-t border-white/[0.04]">
                    <p className="text-xs font-semibold text-gray-400">Photos Inside This Section ({ensureArray(section.images).length} Total)</p>
                    
                    {ensureArray(section.images).map((img, ii) => (
                      <div id={img.id} key={img.id} className="p-4 bg-black/30 border border-white/[0.04] hover:border-white/[0.06] rounded-xl relative transition-all group/img flex flex-col md:flex-row gap-4 items-start md:items-center">
                        
                        {/* Move controls */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 md:relative md:top-auto md:right-auto">
                          <button 
                            disabled={ii === 0} 
                            onClick={() => moveItem(["gallery", "sections", si, "images"], ii, -1)}
                            className="p-1 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-20 rounded text-gray-400 hover:text-white"
                            title="Move Up Image"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            disabled={ii === section.images.length - 1} 
                            onClick={() => moveItem(["gallery", "sections", si, "images"], ii, 1)}
                            className="p-1 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-20 rounded text-gray-400 hover:text-white"
                            title="Move Down Image"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => removeItem(["gallery", "sections", si, "images"], ii)} 
                            className="p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-400"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Thumbnail view */}
                        <div className="w-14 h-14 bg-black/50 border border-white/[0.05] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {img.url ? (
                            <img src={img.url} alt="Gallery view" className="object-cover w-full h-full" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-600 animate-pulse" />
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 flex-1 w-full">
                          <div className="col-span-2 flex gap-2 items-center">
                            <input className={`${inputClass} text-xs py-2`} value={img.url} onChange={(e) => update(["gallery", "sections", si, "images", ii, "url"], e.target.value)} placeholder="Image Path/URL" />
                            <UploadButton path={["gallery", "sections", si, "images", ii, "url"]} labelText="Upload" />
                          </div>
                          <div>
                            <input className={`${inputClass} text-xs py-2`} value={img.title} onChange={(e) => update(["gallery", "sections", si, "images", ii, "title"], e.target.value)} placeholder="Title / Caption" />
                          </div>
                          <div>
                            <input className={`${inputClass} text-xs py-2 font-mono`} type="number" value={img.likes} onChange={(e) => update(["gallery", "sections", si, "images", ii, "likes"], Number(e.target.value || 0))} placeholder="Like counter" />
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: CONTACT INFORMATION ================= */}
      {activeTab === "contact" && (
        <div className={cardClass}>
          <h3 className={sectionTitleClass}>
            <Phone className="w-5 h-5 text-cyan-400" /> Get In Touch & Social Portals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block flex items-center gap-1">
                <Mail className="w-3 h-3 text-cyan-400" /> Support Email
              </label>
              <input className={inputClass} value={content.contact.general.email} onChange={(e) => update(["contact", "general", "email"], e.target.value)} placeholder="Email Address" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block flex items-center gap-1">
                <Phone className="w-3 h-3 text-cyan-400" /> Telephone Support
              </label>
              <input className={inputClass} value={content.contact.general.phone} onChange={(e) => update(["contact", "general", "phone"], e.target.value)} placeholder="Phone Number" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> College Physical Address
              </label>
              <input className={inputClass} value={content.contact.general.address} onChange={(e) => update(["contact", "general", "address"], e.target.value)} placeholder="Address coordinates..." />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: COORDINATORS COMMITTEE ================= */}
      {activeTab === "coordinators" && (
        <div className="space-y-6">
          
          {/* 1. Faculty Advisors */}
          <div className={cardClass}>
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
              <h3 className="text-base md:text-lg font-display font-black text-white flex items-center gap-2.5">
                <Users className="w-5 h-5 text-amber-400" /> Faculty Advisors & Conveners
              </h3>
              <button 
              onClick={() => {
                const newId = `faculty-${Date.now()}`;
                addItem(["contact", "teachersCommittee"], { id: newId, name: "New Faculty Advisor", role: "Convener", phone: "", email: "", photo: "" });
                setScrollToId(newId);
              }}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Advisor
            </button>
          </div>

          <div className="space-y-4">
            {ensureArray(content.contact.teachersCommittee).map((p, i) => (
              <div id={p.id || `faculty-${i}`} key={p.id || `faculty-${i}`} className="p-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] rounded-2xl relative flex flex-col md:flex-row gap-4 items-start md:items-center">
                  
                  {/* Controls */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 md:relative md:top-auto md:right-auto">
                    <button 
                      disabled={i === 0} 
                      onClick={() => moveItem(["contact", "teachersCommittee"], i, -1)}
                      className="p-1 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-20 rounded text-gray-400 hover:text-white"
                      title="Move Up Advisor"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      disabled={i === content.contact.teachersCommittee.length - 1} 
                      onClick={() => moveItem(["contact", "teachersCommittee"], i, 1)}
                      className="p-1 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-20 rounded text-gray-400 hover:text-white"
                      title="Move Down Advisor"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => removeItem(["contact", "teachersCommittee"], i)} 
                      className="p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-400"
                      title="Delete Advisor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Visual Portrait */}
                  <div className="w-14 h-14 bg-black/40 border border-white/[0.06] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                    {p.photo || p.image ? (
                      <img src={p.photo || p.image} alt="Portrait" className="object-cover w-full h-full" />
                    ) : (
                      <User className="w-6 h-6 text-gray-600" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 flex-1 w-full items-center">
                    <div>
                      <input className={`${inputClass} text-xs py-2`} value={p.name || ""} onChange={(e) => update(["contact", "teachersCommittee", i, "name"], e.target.value)} placeholder="Full Name *" />
                    </div>
                    <div>
                      <input className={`${inputClass} text-xs py-2`} value={p.role || ""} onChange={(e) => update(["contact", "teachersCommittee", i, "role"], e.target.value)} placeholder="Designation *" />
                    </div>
                    <div>
                      <input className={`${inputClass} text-xs py-2`} value={p.phone || ""} onChange={(e) => update(["contact", "teachersCommittee", i, "phone"], e.target.value)} placeholder="WhatsApp / Call" />
                    </div>
                    <div>
                      <input className={`${inputClass} text-xs py-2`} value={p.email || ""} onChange={(e) => update(["contact", "teachersCommittee", i, "email"], e.target.value)} placeholder="Email Address" />
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 bg-black/20 p-2 rounded-xl border border-white/[0.03]">
                      <PhotoManager path={["contact", "teachersCommittee", i, "photo"]} photoVal={p.photo || p.image} />
                      <input className="w-full bg-transparent border-0 text-[9px] text-gray-600 font-mono focus:outline-none placeholder:text-gray-700 truncate px-1" value={p.photo || p.image || ""} onChange={(e) => update(["contact", "teachersCommittee", i, "photo"], e.target.value)} placeholder="Or paste image link here..." />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* 2. Student Leads */}
          <div className={cardClass}>
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
              <h3 className="text-base md:text-lg font-display font-black text-white flex items-center gap-2.5">
                <Users className="w-5 h-5 text-cyan-400" /> Student Coordinators & Leads
              </h3>
              <button 
              onClick={() => {
                const newId = `student-${Date.now()}`;
                addItem(["contact", "studentCommittee"], { id: newId, name: "New Student Coordinator", role: "Secretary", phone: "", email: "", photo: "" });
                setScrollToId(newId);
              }}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>

          <div className="space-y-4">
            {ensureArray(content.contact.studentCommittee).map((p, i) => (
              <div id={p.id || `student-${i}`} key={p.id || `student-${i}`} className="p-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] rounded-2xl relative flex flex-col md:flex-row gap-4 items-start md:items-center">
                  
                  {/* Controls */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 md:relative md:top-auto md:right-auto">
                    <button 
                      disabled={i === 0} 
                      onClick={() => moveItem(["contact", "studentCommittee"], i, -1)}
                      className="p-1 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-20 rounded text-gray-400 hover:text-white"
                      title="Move Up Student"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      disabled={i === content.contact.studentCommittee.length - 1} 
                      onClick={() => moveItem(["contact", "studentCommittee"], i, 1)}
                      className="p-1 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] disabled:opacity-20 rounded text-gray-400 hover:text-white"
                      title="Move Down Student"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => removeItem(["contact", "studentCommittee"], i)} 
                      className="p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-400"
                      title="Delete Student"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Visual Portrait */}
                  <div className="w-14 h-14 bg-black/40 border border-white/[0.06] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                    {p.photo || p.image ? (
                      <img src={p.photo || p.image} alt="Portrait" className="object-cover w-full h-full" />
                    ) : (
                      <User className="w-6 h-6 text-gray-600" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 flex-1 w-full items-center">
                    <div>
                      <input className={`${inputClass} text-xs py-2`} value={p.name || ""} onChange={(e) => update(["contact", "studentCommittee", i, "name"], e.target.value)} placeholder="Full Name *" />
                    </div>
                    <div>
                      <input className={`${inputClass} text-xs py-2`} value={p.role || ""} onChange={(e) => update(["contact", "studentCommittee", i, "role"], e.target.value)} placeholder="e.g. Sports Captain *" />
                    </div>
                    <div>
                      <input className={`${inputClass} text-xs py-2`} value={p.phone || ""} onChange={(e) => update(["contact", "studentCommittee", i, "phone"], e.target.value)} placeholder="WhatsApp / Call" />
                    </div>
                    <div>
                      <input className={`${inputClass} text-xs py-2`} value={p.email || ""} onChange={(e) => update(["contact", "studentCommittee", i, "email"], e.target.value)} placeholder="Email Address" />
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 bg-black/20 p-2 rounded-xl border border-white/[0.03]">
                      <PhotoManager path={["contact", "studentCommittee", i, "photo"]} photoVal={p.photo || p.image} />
                      <input className="w-full bg-transparent border-0 text-[9px] text-gray-600 font-mono focus:outline-none placeholder:text-gray-700 truncate px-1" value={p.photo || p.image || ""} onChange={(e) => update(["contact", "studentCommittee", i, "photo"], e.target.value)} placeholder="Or paste image link here..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= STUNNING CUSTOM CONFIRMATION DIALOG ================= */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-[#0a0a14] border border-white/[0.08] max-w-sm w-full rounded-3xl shadow-2xl p-6 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent blur-2xl rounded-full pointer-events-none" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-amber-400" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white font-display">{confirmModal.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed px-2">{confirmModal.message}</p>
                </div>

                <div className="flex items-center gap-3 w-full pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                    className="flex-1 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmModal.onConfirm}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-amber-500/10"
                  >
                    Yes, Proceed
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= PREMIUM FLOATING TOAST NOTIFICATION ================= */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[120] max-w-sm w-full p-4 rounded-2xl bg-[#0a0a14] border border-white/[0.08] shadow-2xl flex items-center gap-3 overflow-hidden"
          >
            {toast.type === 'success' ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
            ) : toast.type === 'error' ? (
              <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold font-display">{toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Failed' : 'Notification'}</p>
              <p className="text-xs font-semibold text-white truncate mt-0.5">{toast.message}</p>
            </div>
            
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="p-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] rounded-lg text-gray-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
