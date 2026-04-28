
import React, { useState, useMemo } from 'react';
import { CalculationResult } from '../types';
import { 
  calculateAbsoluteHumidity, 
  calculateMixingRatio, 
  calculateDewPoint, 
  calculateAVP,
  calculateDuctVelocity,
  calculateDuctPressureDrop,
  calculateBendLoss,
  estimateDuctNoise,
  calculateMixingRatioFromDP,
  calculateDehumCapacity
} from '../utils/calculations';
import { getOutdoorMoistureData, WeatherCondition } from '../services/geminiService';

type CalcMode = 'psychrometrics' | 'ducting' | 'moisture_load' | 'capacity';
type TargetType = 'rh' | 'dp' | 'abs';
type SystemType = 'open' | 'closed';
type LoadMode = 'measured' | 'manual';
type AmbientSource = 'current' | 'peak';

const Calculators: React.FC = () => {
  const [mode, setMode] = useState<CalcMode>('psychrometrics');
  
  // Psychrometric State
  const [temp, setTemp] = useState<string>('20');
  const [rh, setRh] = useState<string>('50');

  // Ducting State
  const [airflow, setAirflow] = useState<string>('1200');
  const [diameter, setDiameter] = useState<string>('250');
  const [length, setLength] = useState<string>('15');
  const [bends90, setBends90] = useState<string>('2');
  const [bends45, setBends45] = useState<string>('0');

  // Site Air Context
  const [outTemp, setOutTemp] = useState<string>('10');
  const [outRh, setOutRh] = useState<string>('80');
  const [inTemp, setInTemp] = useState<string>('20');
  const [inRh, setInRh] = useState<string>('65');
  
  // Advanced Ambient Selection
  const [ambientSource, setAmbientSource] = useState<AmbientSource>('current');
  const [cachedWeather, setCachedWeather] = useState<{current: WeatherCondition, peak: WeatherCondition} | null>(null);

  // Location Sync State
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [groundingUrl, setGroundingUrl] = useState<string | null>(null);

  // Capacity State
  const [roomArea, setRoomArea] = useState<string>('100');
  const [roomHeight, setRoomHeight] = useState<string>('3.0');
  const [airChanges, setAirChanges] = useState<string>('0.5'); 
  const [systemType, setSystemType] = useState<SystemType>('closed');
  const [loadMode, setLoadMode] = useState<LoadMode>('measured');
  const [manualLoad, setManualLoad] = useState<string>('500'); // g/h
  const [targetType, setTargetType] = useState<TargetType>('rh');
  const [targetValue, setTargetValue] = useState<string>('50');

  const fetchOutdoorData = async (loc?: string) => {
    const target = loc || locationSearch;
    if (!target && !loc) return;
    setIsSyncing(true);
    const data = await getOutdoorMoistureData(target);
    if (data) {
      setCachedWeather({
        current: data.current,
        peak: data.peakDesign
      });
      // Default to current but update values
      setOutTemp(data.current.temp.toString());
      setOutRh(data.current.rh.toString());
      setGroundingUrl(data.sourceUrl);
      if (data.locationName) setLocationSearch(data.locationName);
    }
    setIsSyncing(false);
  };

  const handleSourceToggle = (source: AmbientSource) => {
    setAmbientSource(source);
    if (cachedWeather) {
      const selected = source === 'current' ? cachedWeather.current : cachedWeather.peak;
      setOutTemp(selected.temp.toString());
      setOutRh(selected.rh.toString());
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsSyncing(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const locString = `${pos.coords.latitude}, ${pos.coords.longitude}`;
      await fetchOutdoorData(locString);
    }, () => setIsSyncing(false));
  };

  const psychResults = useMemo(() => {
    const t = parseFloat(temp);
    const h = parseFloat(rh);
    if (isNaN(t) || isNaN(h)) return null;

    return [
      { label: 'Dew Point', value: calculateDewPoint(t, h).toFixed(1), unit: '°C', color: 'text-amber-400' },
      { label: 'Mixing Ratio', value: calculateMixingRatio(t, h).toFixed(2), unit: 'g/kg', color: 'text-sky-400' },
      { label: 'Abs. Humidity', value: calculateAbsoluteHumidity(t, h).toFixed(2), unit: 'g/m³', color: 'text-emerald-400' },
      { label: 'Vapor Pressure', value: (calculateAVP(t, h) / 100).toFixed(2), unit: 'hPa', color: 'text-indigo-400' },
    ];
  }, [temp, rh]);

  const ductResults = useMemo(() => {
    const q = parseFloat(airflow);
    const d = parseFloat(diameter);
    const l = parseFloat(length);
    const b90 = parseInt(bends90) || 0;
    const b45 = parseInt(bends45) || 0;

    if (isNaN(q) || isNaN(d) || isNaN(l) || d <= 0) return null;

    const velocity = calculateDuctVelocity(q, d);
    const straightLoss = calculateDuctPressureDrop(q, d, l);
    const bendLoss = calculateBendLoss(velocity, b90, b45);
    const totalPressureDrop = straightLoss + bendLoss;
    const noise = estimateDuctNoise(velocity);

    return [
      { label: 'Air Velocity', value: velocity.toFixed(1), unit: 'm/s', color: velocity > 6 ? 'text-rose-400' : 'text-emerald-400' },
      { label: 'Total Pressure Drop', value: totalPressureDrop.toFixed(1), unit: 'Pa', color: 'text-sky-400' },
      { label: 'Est. Noise (Lw)', value: noise.toFixed(0), unit: 'dB(A)', color: 'text-amber-400' },
    ];
  }, [airflow, diameter, length, bends90, bends45]);

  const moistureLoadResults = useMemo(() => {
    const ot = parseFloat(outTemp);
    const or = parseFloat(outRh);
    const it = parseFloat(inTemp);
    const ir = parseFloat(inRh);

    if (isNaN(ot) || isNaN(or) || isNaN(it) || isNaN(ir)) return null;

    const outMR = calculateMixingRatio(ot, or);
    const inMR = calculateMixingRatio(it, ir);
    const deltaMR = inMR - outMR;
    const outAH = calculateAbsoluteHumidity(ot, or);
    const inAH = calculateAbsoluteHumidity(it, ir);
    const deltaAH = inAH - outAH;

    return [
      { 
        label: 'Current Moisture Load', 
        value: deltaMR.toFixed(2), 
        unit: 'g/kg', 
        color: deltaMR > 0 ? 'text-rose-400' : 'text-emerald-400',
        details: `Out: ${outMR.toFixed(2)} vs In: ${inMR.toFixed(2)}`
      },
      { 
        label: 'Volumetric Load', 
        value: deltaAH.toFixed(2), 
        unit: 'g/m³', 
        color: deltaAH > 0 ? 'text-rose-400' : 'text-emerald-400',
        details: `Out: ${outAH.toFixed(2)} vs In: ${inAH.toFixed(2)}`
      }
    ];
  }, [outTemp, outRh, inTemp, inRh]);

  const capacityResults = useMemo(() => {
    const area = parseFloat(roomArea);
    const height = parseFloat(roomHeight);
    const ach = parseFloat(airChanges);
    const manLoadVal = parseFloat(manualLoad);
    const targetVal = parseFloat(targetValue);
    const ot = parseFloat(outTemp);
    const or = parseFloat(outRh);
    const it = parseFloat(inTemp);
    const ir = parseFloat(inRh);

    if (isNaN(area) || isNaN(height) || isNaN(ach) || isNaN(manLoadVal) || isNaN(targetVal) || isNaN(ot) || isNaN(or) || isNaN(it) || isNaN(ir)) return null;

    const rho = 1.202;
    const volume = area * height;
    const ventAirflow = volume * ach;
    
    const ambientMR = calculateMixingRatio(ot, or);
    const indoorMR = calculateMixingRatio(it, ir);
    
    let targetMR = 0;
    if (targetType === 'rh') {
      targetMR = calculateMixingRatio(it, targetVal);
    } else if (targetType === 'dp') {
      targetMR = calculateMixingRatioFromDP(targetVal);
    } else if (targetType === 'abs') {
      targetMR = targetVal / rho; 
    }

    const ventLoadGh = ventAirflow * rho * Math.max(0, ambientMR - targetMR);
    const measuredInternalLoadGh = ventAirflow * rho * Math.max(0, indoorMR - ambientMR);
    
    const activeInternalLoad = loadMode === 'measured' ? measuredInternalLoadGh : manLoadVal;
    const totalNeedGh = activeInternalLoad + ventLoadGh;
    const totalNeedKgh = totalNeedGh / 1000;

    return [
      { 
        label: `Proposed Capacity @ ${it}°C`, 
        value: totalNeedKgh.toFixed(2), 
        unit: 'kg/h', 
        color: 'text-sky-400',
        details: `Removal Required: ${totalNeedGh.toFixed(0)} g/h`
      },
      { 
        label: `${ambientSource === 'peak' ? 'Peak Design' : 'Ambient'} Infiltration Load`, 
        value: ventLoadGh.toFixed(0), 
        unit: 'g/h', 
        color: 'text-indigo-400',
        details: `Flow: ${ventAirflow.toFixed(0)} m³/h | Ambient: ${ambientMR.toFixed(2)} g/kg`
      },
      {
        label: loadMode === 'measured' ? 'Measured Internal Load' : 'Manual Internal Load',
        value: activeInternalLoad.toFixed(0),
        unit: 'g/h',
        color: activeInternalLoad > 500 ? 'text-rose-400' : 'text-emerald-400',
        details: loadMode === 'measured' ? 'Derived from room vs ambient delta' : 'Static value used for proposal'
      }
    ];
  }, [roomArea, roomHeight, airChanges, manualLoad, targetType, targetValue, outTemp, outRh, inTemp, inRh, systemType, loadMode, ambientSource]);

  const currentResults: CalculationResult[] | null = 
    mode === 'psychrometrics' ? psychResults : 
    mode === 'ducting' ? ductResults : 
    mode === 'moisture_load' ? moistureLoadResults : 
    capacityResults;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Technician Tools</h2>
          <p className="text-slate-400 text-sm mt-1 font-light tracking-wide italic">"To measure is to know."</p>
        </div>
        
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-hide">
          {['psychrometrics', 'ducting', 'moisture_load', 'capacity'].map((m) => (
            <button 
              key={m}
              onClick={() => setMode(m as CalcMode)}
              className={`flex-1 min-w-[75px] py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                mode === m ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m === 'psychrometrics' ? 'Air' : m === 'ducting' ? 'Duct' : m === 'moisture_load' ? 'Load' : 'Needs'}
            </button>
          ))}
        </div>
      </header>

      <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 space-y-6 shadow-2xl relative overflow-hidden">
        {(mode === 'moisture_load' || mode === 'capacity') && (
          <div className="space-y-4 mb-4">
             <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-sky-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Site Location Data
                </h4>
                <button 
                  onClick={useCurrentLocation}
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-sky-400 transition-colors"
                  title="Use GPS"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                </button>
             </div>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={locationSearch} 
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Enter city or coordinates..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100"
                />
                <button 
                  onClick={() => fetchOutdoorData()}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-sky-600 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Fetch'}
                </button>
             </div>
             
             {cachedWeather && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
                    <button 
                      onClick={() => handleSourceToggle('current')}
                      className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${ambientSource === 'current' ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}
                    >
                      Current Weather
                    </button>
                    <button 
                      onClick={() => handleSourceToggle('peak')}
                      className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${ambientSource === 'peak' ? 'bg-amber-600 text-white shadow' : 'text-slate-500'}`}
                    >
                      Peak Summer Load
                    </button>
                  </div>
                </div>
             )}

             {groundingUrl && (
               <a href={groundingUrl} target="_blank" rel="noopener noreferrer" className="text-[8px] text-sky-400 underline uppercase tracking-tighter block mt-2">Source: Verified Grounding Data</a>
             )}
          </div>
        )}

        {mode === 'psychrometrics' && (
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute right-4 top-10 text-[10px] text-slate-500 font-bold">°C</span>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Temperature</span>
                <input type="number" value={temp} onChange={(e) => setTemp(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-4 text-xl font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40" />
              </label>
            </div>
            <div className="relative">
              <span className="absolute right-4 top-10 text-[10px] text-slate-500 font-bold">%</span>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Rel. Humidity</span>
                <input type="number" value={rh} onChange={(e) => setRh(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-4 text-xl font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40" />
              </label>
            </div>
          </div>
        )}

        {(mode === 'moisture_load' || mode === 'capacity') && (
          <div className="space-y-6">
            <div className={`space-y-3 border-t border-slate-800/50 pt-4 transition-all ${ambientSource === 'peak' ? 'bg-amber-950/5 rounded-2xl p-4' : ''}`}>
              <h4 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${ambientSource === 'peak' ? 'text-amber-500' : 'text-sky-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${ambientSource === 'peak' ? 'bg-amber-500 animate-pulse' : 'bg-sky-500'}`} /> 
                Outdoor {ambientSource === 'peak' ? 'Peak Design' : 'Ambient'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute right-3 top-10 text-[10px] text-slate-600 font-bold">°C</span>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Temp</span>
                    <input type="number" value={outTemp} onChange={(e) => setOutTemp(e.target.value)} className={`mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-lg font-mono text-slate-100 ${ambientSource === 'peak' ? 'border-amber-900/50' : ''}`} />
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute right-3 top-10 text-[10px] text-slate-600 font-bold">%</span>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">RH</span>
                    <input type="number" value={outRh} onChange={(e) => setOutRh(e.target.value)} className={`mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-lg font-mono text-slate-100 ${ambientSource === 'peak' ? 'border-amber-900/50' : ''}`} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-800/50 pt-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Indoor Condition
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute right-3 top-10 text-[10px] text-slate-600 font-bold">°C</span>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Temp</span>
                    <input type="number" value={inTemp} onChange={(e) => setInTemp(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-lg font-mono text-slate-100" />
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute right-3 top-10 text-[10px] text-slate-600 font-bold">%</span>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">RH</span>
                    <input type="number" value={inRh} onChange={(e) => setInRh(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-lg font-mono text-slate-100" />
                  </label>
                </div>
              </div>
            </div>

            {mode === 'capacity' && (
              <div className="space-y-6 border-t border-slate-800/50 pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Space Specifications
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute right-3 top-10 text-[10px] text-slate-600 font-bold">m²</span>
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Floor Area</span>
                      <input type="number" value={roomArea} onChange={(e) => setRoomArea(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-lg font-mono text-slate-100" />
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute right-3 top-10 text-[10px] text-slate-600 font-bold">m</span>
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Height</span>
                      <input type="number" value={roomHeight} onChange={(e) => setRoomHeight(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-lg font-mono text-slate-100" />
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                     <span className="absolute right-3 top-10 text-[10px] text-slate-600 font-bold">h⁻¹</span>
                     <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Vent (ACH)</span>
                      <input type="number" value={airChanges} step="0.1" onChange={(e) => setAirChanges(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-lg font-mono text-slate-100" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">System Logic</span>
                    <select value={systemType} onChange={(e) => setSystemType(e.target.value as SystemType)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-100">
                      <option value="closed">Closed / Recirc</option>
                      <option value="open">Open / Fresh</option>
                    </select>
                  </label>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 ml-1">Internal Moisture Load Choice</span>
                    <div className="grid grid-cols-2 gap-2 mt-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                      <button 
                        onClick={() => setLoadMode('measured')}
                        className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${loadMode === 'measured' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}
                      >
                        Measured
                      </button>
                      <button 
                        onClick={() => setLoadMode('manual')}
                        className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${loadMode === 'manual' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}
                      >
                        Manual
                      </button>
                    </div>
                  </label>

                  {loadMode === 'manual' && (
                    <div className="relative animate-in slide-in-from-top-2 duration-300">
                      <span className="absolute right-4 top-10 text-[10px] text-slate-600 font-bold">g/h</span>
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 ml-1">Manual Moisture Load</span>
                        <input type="number" value={manualLoad} onChange={(e) => setManualLoad(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-4 text-xl font-mono text-slate-100" />
                      </label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-4">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Target Type</span>
                    <select value={targetType} onChange={(e) => setTargetType(e.target.value as TargetType)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-100">
                      <option value="rh">Target RH (%)</option>
                      <option value="dp">Target DP (°C)</option>
                      <option value="abs">Target Abs (g/m³)</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Target Value</span>
                    <input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-lg font-mono text-slate-100" />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'ducting' && (
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute right-4 top-10 text-[10px] text-slate-500 font-bold">m³/h</span>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Process Airflow</span>
                <input type="number" value={airflow} onChange={(e) => setAirflow(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-4 text-xl font-mono text-slate-100" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute right-3 top-10 text-[10px] text-slate-500 font-bold">mm</span>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Duct Ø</span>
                  <input type="number" value={diameter} onChange={(e) => setDiameter(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-lg font-mono text-slate-100" />
                </label>
              </div>
              <div className="relative">
                <span className="absolute right-3 top-10 text-[10px] text-slate-500 font-bold">m</span>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Length</span>
                  <input type="number" value={length} onChange={(e) => setLength(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3 text-lg font-mono text-slate-100" />
                </label>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4">
        {currentResults?.map((res) => (
          <div key={res.label} className="bg-slate-800/40 border border-slate-800 p-5 rounded-3xl flex flex-col group transition-all hover:bg-slate-800/60 shadow-lg relative overflow-hidden">
            {res.label.includes('Proposed Capacity') && (
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{res.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-4xl font-mono font-bold tracking-tighter ${res.color}`}>{res.value}</span>
                  <span className="text-xs text-slate-500 font-medium">{res.unit}</span>
                </div>
              </div>
            </div>
            {res.details && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tight font-bold">{res.details}</p>
              </div>
            )}
          </div>
        ))}
      </section>

      {mode === 'capacity' && (
        <div className="p-6 bg-sky-950/20 border border-sky-900/40 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">Engineering Summary</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            Using <span className="text-amber-500 font-bold">{loadMode} load</span> and <span className="text-sky-400 font-bold">{ambientSource} conditions</span>, the removal required is <span className="text-white font-mono font-bold">{currentResults?.[0]?.details?.match(/\d+/)?.[0]} g/h</span>. 
            {ambientSource === 'peak' ? ' Dimensioning for the summer peak ensures performance under the most humid conditions.' : ' Dimensioning for current weather reflects immediate drying needs.'}
          </p>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
             <p className="text-[9px] text-slate-500 italic">"Always verify equipment capacity at the specified room temperature of {inTemp}°C."</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculators;
