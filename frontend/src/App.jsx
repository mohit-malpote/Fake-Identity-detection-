import React, { useState, useRef } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  UploadCloud, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Scan, 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  Radio, 
  Eye, 
  RefreshCw,
  ExternalLink,
  Printer
} from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sensitivity, setSensitivity] = useState('standard');
  const fileInputRef = useRef(null);

  // Helper to handle image selection
  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, or JPEG).');
      return;
    }
    setError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Submit screening request to FastAPI backend
  const runScreening = async () => {
    if (!selectedFile) {
      setError('Please select or drop a document image first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('sensitivity', sensitivity);

    try {
      const response = await fetch('/api/screen', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Screening error:', err);
      setError(err.message || 'Failed to complete document screening. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Generate synthetic sample ID image for quick testing
  const loadSampleDocument = (type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 600, 380);
    if (type === 'authentic_passport') {
      bgGrad.addColorStop(0, '#0c2340');
      bgGrad.addColorStop(1, '#1d3557');
    } else if (type === 'forged_id') {
      bgGrad.addColorStop(0, '#1c1917');
      bgGrad.addColorStop(1, '#292524');
    } else {
      bgGrad.addColorStop(0, '#14213d');
      bgGrad.addColorStop(1, '#000000');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 380);

    // Border and security guilloche pattern simulation
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 360);
    
    // Header Bar
    ctx.fillStyle = type === 'forged_id' ? '#b91c1c' : '#0284c7';
    ctx.fillRect(15, 15, 570, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(
      type === 'authentic_passport' 
        ? 'REPUBLIC OF INDIA / PASSPORT' 
        : type === 'forged_id' 
          ? 'NATIONAL IDENTITY CARD (ALTERED)' 
          : 'INTERNATIONAL TRAVEL VISA',
      30, 48
    );

    // Simulated Biometric Photo Box
    ctx.fillStyle = '#334155';
    ctx.fillRect(35, 90, 140, 180);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 90, 140, 180);

    // Simulated Head & Shoulder Silhouette
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(105, 155, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(105, 235, 52, 35, 0, 0, Math.PI);
    ctx.fill();

    // Splicing artifact on forged ID
    if (type === 'forged_id') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.fillRect(35, 90, 140, 180);
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('[DIGITAL SPLICING]', 42, 260);
    }

    // Document Text Fields
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('FULL NAME', 205, 105);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(type === 'forged_id' ? 'SINGH, HARPREET [TAMPERED]' : 'SHARMA, ARJUN', 205, 126);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('DOCUMENT NUMBER', 205, 155);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(type === 'authentic_passport' ? 'Z8492019' : type === 'forged_id' ? 'IND99281734' : 'V-4819208', 205, 175);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('DATE OF BIRTH', 205, 205);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '14px monospace';
    ctx.fillText('18/05/1990', 205, 224);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('EXPIRY DATE', 380, 205);
    ctx.fillStyle = type === 'forged_id' ? '#f87171' : '#34d399';
    ctx.font = '14px monospace';
    ctx.fillText(type === 'forged_id' ? '12/04/2021 (EXPIRED)' : '28/09/2032', 380, 224);

    // Simulated Machine Readable Zone (MRZ)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(15, 290, 570, 75);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px monospace';
    ctx.fillText(
      type === 'authentic_passport'
        ? 'P<INDSHARMA<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<'
        : 'I<IND992817346<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      25, 320
    );
    ctx.fillText('Z8492019<5IND9005183M3209287<<<<<<<<<<<<<<<4', 25, 345);

    canvas.toBlob((blob) => {
      const file = new File([blob], `${type}.jpg`, { type: 'image/jpeg' });
      handleFileChange(file);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 soc-grid-bg flex flex-col">
      {/* Top Navigation Bar: Border Operations Center */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-cyan-950/80 border border-cyan-500/30 rounded-lg text-cyan-400 shadow-sm shadow-cyan-950">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wide text-white uppercase">
                AI Document Screening & Verification System
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 border border-cyan-800 text-cyan-300">
                SSB POLICE II (MHA)
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Problem ID: 26188</span>
              <span className="text-slate-600">•</span>
              <span>Checkpoint Screening Terminal 04</span>
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-950/60 border border-slate-800 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">ENGINE:</span>
            <span className="text-emerald-400 font-semibold">ONLINE (ELA + OCR)</span>
          </div>
          {/* Sensitivity Mode Selector */}
          <div className="hidden sm:flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] font-mono text-slate-400 px-2 uppercase">Sensitivity:</span>
            <button
              onClick={() => setSensitivity('standard')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                sensitivity === 'standard' 
                  ? 'bg-cyan-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setSensitivity('high')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                sensitivity === 'high' 
                  ? 'bg-red-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strict (Anti-Fraud)
            </button>
          </div>

          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
            title="Print Inspection Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Log</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Quick Sample Selector Banner */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-medium text-slate-300">Quick Test Samples (Instant Simulation):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => loadSampleDocument('authentic_passport')}
              className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Authentic Passport</span>
            </button>
            <button 
              onClick={() => loadSampleDocument('forged_id')}
              className="px-3 py-1 rounded-md bg-red-950/40 hover:bg-red-900/50 text-red-200 border border-red-800/50 transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Forged/Spliced ID</span>
            </button>
            <button 
              onClick={() => loadSampleDocument('travel_visa')}
              className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Travel Visa</span>
            </button>
          </div>
        </div>

        {/* Screening Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Upload & Original Document Panel */}
          <div className="lg:col-span-6 space-y-4">
            <div className="soc-card p-5 border border-slate-800/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Scan className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                    Document Input Terminal
                  </h2>
                </div>
                {selectedFile && (
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                )}
              </div>

              {/* Drag and Drop Zone / Preview */}
              {!previewUrl ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[280px] ${
                    isDragOver 
                      ? 'border-cyan-400 bg-cyan-950/20' 
                      : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                    accept="image/png, image/jpeg, image/jpg" 
                    className="hidden" 
                  />
                  <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-cyan-400">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-slate-200 text-sm mb-1">
                    Drop passport or identity document here
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mb-3">
                    Supports high-resolution PNG, JPG, or JPEG images of Passports, Visas, and National IDs.
                  </p>
                  <span className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700 font-mono">
                    Browse Local File
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black min-h-[280px] flex items-center justify-center group">
                    <img 
                      src={previewUrl} 
                      alt="Uploaded Document" 
                      className="max-h-[340px] w-auto object-contain mx-auto" 
                    />
                    {/* Animated Scanning Laser Line while processing */}
                    {loading && (
                      <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scan-line pointer-events-none" />
                    )}
                    <button 
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); setResult(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700 transition"
                      title="Clear image"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={runScreening}
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs tracking-wide uppercase transition shadow-md shadow-cyan-900/40 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Screening & Analyzing ELA...</span>
                        </>
                      ) : (
                        <>
                          <FileSearch className="w-4 h-4" />
                          <span>Run Document Screening</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                      title="Upload different image"
                    >
                      Change
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                      accept="image/png, image/jpeg, image/jpg" 
                      className="hidden" 
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Document Extraction Summary Cards */}
            {result && (
              <div className="soc-card p-5 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                      Module 1: Extracted Credential Fields (OCR)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Validated
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 font-mono text-[10px] block">DOCUMENT TYPE</span>
                    <span className="font-semibold text-slate-200">{result.document_type}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 font-mono text-[10px] block">DOCUMENT / ID NO.</span>
                    <span className="font-mono font-bold text-cyan-400">{result.id_number}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 col-span-2">
                    <span className="text-slate-500 font-mono text-[10px] block">FULL LEGAL NAME</span>
                    <span className="font-bold text-white text-sm">{result.full_name}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 font-mono text-[10px] block">DATE OF BIRTH</span>
                    <span className="font-mono text-slate-200">{result.date_of_birth}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 font-mono text-[10px] block">EXPIRY DATE</span>
                    <span className={`font-mono font-semibold ${result.validation_flags.includes('DOCUMENT_EXPIRED') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {result.expiry_date}
                    </span>
                  </div>
                </div>

                {/* Validation Notes List */}
                {result.notes && result.notes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
                      Security Engine Observations:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {result.notes.map((note, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: ELA Tampering Heatmap & Security Decision Panel */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Heatmap Analysis Display */}
            <div className="soc-card p-5 border border-slate-800/80 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                    Module 2: Error Level Analysis (ELA) Heatmap
                  </h2>
                </div>
                {result && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    result.tampering_detected 
                      ? 'bg-red-950 text-red-300 border border-red-800' 
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {result.tampering_detected ? 'ANOMALIES DETECTED' : 'UNIFORM COMPRESSION'}
                  </span>
                )}
              </div>

              {result?.ela_heatmap ? (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black min-h-[280px] flex items-center justify-center">
                    <img 
                      src={result.ela_heatmap} 
                      alt="Error Level Analysis Heatmap" 
                      className="max-h-[340px] w-auto object-contain mx-auto" 
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/75 backdrop-blur border border-slate-800 text-[10px] font-mono text-slate-300">
                      JPEG 90% Compression Difference
                    </div>
                  </div>

                  {/* ELA Statistical Metrics */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">MEAN ERR</span>
                      <span className="font-mono font-bold text-slate-200">{result.ela_metrics.mean_error}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">VARIANCE</span>
                      <span className="font-mono font-bold text-slate-200">{result.ela_metrics.variance}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">HIGH ERR %</span>
                      <span className={`font-mono font-bold ${result.ela_metrics.high_error_ratio > 3.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {result.ela_metrics.high_error_ratio}%
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">STD DEV</span>
                      <span className="font-mono font-bold text-slate-200">{result.ela_metrics.std_dev}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-800/80 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[280px] bg-slate-950/30 text-slate-500">
                  <Activity className="w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-xs max-w-sm">
                    No ELA data rendered yet. Upload a document and click "Run Document Screening" to generate the multi-layer error difference map.
                  </p>
                </div>
              )}
            </div>

            {/* Decision & Risk Assessment Panel */}
            {result && (
              <div className="soc-card p-5 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Checkpoint Security Assessment
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    RULESET: MHA-SSB-V1
                  </span>
                </div>

                {/* Risk Score Progress Gauge */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Tampering Risk Score:</span>
                    <span className={`font-mono font-extrabold text-sm ${
                      result.risk_score >= 65 ? 'text-red-400' : result.risk_score >= 35 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {result.risk_score}% ({result.risk_level} THREAT)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        result.risk_score >= 65 
                          ? 'bg-gradient-to-r from-amber-500 to-red-500' 
                          : result.risk_score >= 35 
                            ? 'bg-gradient-to-r from-emerald-500 to-amber-500' 
                            : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                      }`}
                      style={{ width: `${result.risk_score}%` }}
                    />
                  </div>
                </div>

                {/* Primary Clearance Status Badge */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  result.risk_level === 'HIGH' 
                    ? 'bg-red-950/30 border-red-800/80 text-red-200' 
                    : result.risk_level === 'MEDIUM' 
                      ? 'bg-amber-950/30 border-amber-800/80 text-amber-200' 
                      : 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {result.risk_level === 'HIGH' ? (
                      <ShieldAlert className="w-7 h-7 text-red-400 shrink-0" />
                    ) : result.risk_level === 'MEDIUM' ? (
                      <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                    )}
                    <div>
                      <span className="text-[10px] font-mono tracking-wider uppercase block text-slate-400">
                        OFFICER RECOMMENDATION
                      </span>
                      <span className="font-bold text-sm">
                        {result.verification_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Biometric Face Verification Tile */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Biometric Face Verification (Module 4):</span>
                  </div>
                  <span className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                    result.face_detected && result.faces_count === 1
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    {result.face_detected ? `1 Face Matched (${result.faces_count})` : 'No Face Detected'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer / Ministry Attribution */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-3.5 px-6 text-center text-xs text-slate-500 font-mono flex flex-wrap items-center justify-between gap-2">
        <div>
          Ministry of Home Affairs • Sashastra Seema Bal (SSB), Police II Division
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span>Problem Statement ID: 26188</span>
          <span>•</span>
          <span>Theme: Blockchain & Cybersecurity</span>
        </div>
      </footer>
    </div>
  );
}
