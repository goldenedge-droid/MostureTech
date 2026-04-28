
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { Lesson, Module } from '../types';
import { generateLessonSpeech } from '../services/geminiService';

const COURSE_DATA: Module[] = [
  {
    id: 'm1',
    title: "1. The Physics of Air",
    level: "Beginner",
    lessons: [
      {
        id: 'm1-l1',
        title: "Properties of Air & Water Vapor",
        category: "Theory",
        level: "Beginner",
        duration: "15 min",
        type: 'lesson',
        content: `THE COMPOSITION OF AIR
Air is a mixture of gases, primarily Nitrogen (78%) and Oxygen (21%). However, for dehumidification, the most important component is Water Vapor. Even though it usually makes up less than 1% of the weight of air, it dictates weather, comfort, and material preservation.

DALTON'S LAW
The total pressure of air is the sum of the partial pressures of its gases. 
P_total = P_nitrogen + P_oxygen + ... + P_water_vapor.
The "Partial Vapor Pressure" (P_v) is the pressure exerted specifically by the water molecules. This pressure drives moisture movement. Moisture always moves from high vapor pressure to low vapor pressure.

SATURATION
Air can only hold a limited amount of water vapor at a given temperature. When this limit is reached, the air is "Saturated" (100% RH).
• Warm air has a high capacity (large sponge).
• Cold air has a low capacity (small sponge).

ABSOLUTE HUMIDITY (x)
The actual weight of water in the air, usually expressed in g/kg (grams of water per kilogram of dry air). This value does NOT change when you simply heat the air.`,
        quiz: {
          question: "According to Dalton's Law and the principle of vapor pressure, in which direction does moisture naturally travel?",
          options: [
            "From low pressure to high pressure",
            "From high vapor pressure to low vapor pressure",
            "It moves randomly regardless of pressure",
            "It only moves downwards due to gravity"
          ],
          correctIndex: 1
        }
      },
      {
        id: 'm1-l2',
        title: "Relative Humidity & Dew Point",
        category: "Theory",
        level: "Beginner",
        duration: "20 min",
        type: 'lesson',
        content: `RELATIVE HUMIDITY (RH)
RH is the ratio of the actual water vapor pressure to the saturation vapor pressure at that temperature.
Formula: RH = (P_v / P_sat) × 100%

Key Concept: If you heat air, P_sat increases (capacity increases), so RH drops. The actual water content (g/kg) stays the same.

THE DEW POINT (DP)
If you cool air, its capacity to hold water decreases. Eventually, you reach a temperature where the air is fully saturated (100% RH). This temperature is the Dew Point.
Cooling below the Dew Point forces water to condense (change from gas to liquid).

PRACTICAL RULE:
• To dry a material, the air surrounding it must have a lower vapor pressure than the material.
• To prevent condensation on a cold surface (e.g., a beer tank or cold pipe), the air's Dew Point must be lower than the surface temperature.`,
        quiz: {
          question: "If you heat up a room without adding or removing water, what happens to the Relative Humidity (RH) and the Dew Point (DP)?",
          options: [
            "RH increases, DP increases",
            "RH stays the same, DP drops",
            "RH decreases, DP stays the same",
            "RH decreases, DP decreases"
          ],
          correctIndex: 2
        }
      }
    ]
  },
  {
    id: 'm2',
    title: "2. Methods of Dehumidification",
    level: "Beginner",
    lessons: [
      {
        id: 'm2-l1',
        title: "Heating vs. Cooling vs. Sorption",
        category: "Methods",
        level: "Beginner",
        duration: "25 min",
        type: 'lesson',
        content: `There are three main ways to control humidity.

1. HEATING & VENTILATION
Technique: Raise the temperature of the air. This lowers the RH.
Application: Residential homes in winter.
Limitation: It doesn't remove moisture; it just increases the air's thirst. It depends entirely on the outdoor weather. In humid summers, this method fails completely.

2. COOLING (CONDENSATION)
Technique: Run air over a cold coil (refrigerant). Cool the air below its Dew Point so water condenses into a drain pan.
Application: Residential basements, swimming pools, warm industrial areas.
Limitation: Efficiency drops drastically below 15°C (60°F). If the coil is below 0°C, ice forms, stopping the process.

3. SORPTION (DESICCANT)
Technique: Use a material (desiccant) that naturally attracts water molecules due to vapor pressure differences.
Application: Industrial processes, pharma, cold storage, archives.
Benefit: Works equally well at -20°C as at +20°C. Can achieve very low humidity (<10% RH).`,
        quiz: {
          question: "Which dehumidification method is most effective for an unheated storage facility in winter (e.g., +2°C)?",
          options: [
            "Heating (Ventilation)",
            "Condensation (Refrigerant dehumidifier)",
            "Sorption (Desiccant dehumidifier)",
            "Cooling with Glycol"
          ],
          correctIndex: 2
        }
      },
      {
        id: 'm2-l2',
        title: "The Desiccant Rotor Principle",
        category: "Technology",
        level: "Beginner",
        duration: "20 min",
        type: 'lesson',
        content: `THE HONEYCOMB ROTOR
Invented by Carl Munters in the 1950s. The heart of a desiccant dehumidifier is a slowly rotating wheel (rotor) with a honeycomb structure. This structure provides a massive surface area coated with silica gel or lithium chloride.

THE TWO AIR STREAMS:
1. Process Air (Drying): The humid air is pulled through the rotor. The desiccant adsorbs the moisture. The air leaves dry and slightly warmer (due to the heat of adsorption).
2. Reactivation Air (Regeneration): To use the rotor indefinitely, we must empty it of water. A smaller air stream is heated (90-140°C) and passed through a sector of the wheel. This hot air drives the moisture out of the desiccant and exhausts it outside (wet air out).

CONTINUOUS CYCLE
The rotor slowly turns between these two sectors, providing a continuous drying process without liquid water drains.`,
        quiz: {
          question: "What is the purpose of the 'Reactivation' airstream in a desiccant dehumidifier?",
          options: [
            "To cool down the rotor",
            "To remove the trapped moisture from the rotor and exhaust it outside",
            "To mix with the dry air to adjust temperature",
            "To filter dust from the process air"
          ],
          correctIndex: 1
        }
      }
    ]
  },
  {
    id: 'm3',
    title: "3. The Mollier Diagram",
    level: "Intermediate",
    lessons: [
      {
        id: 'm3-l1',
        title: "Navigating the Chart",
        category: "Psychrometrics",
        level: "Intermediate",
        duration: "30 min",
        type: 'lesson',
        content: `The Mollier Diagram (or Psychrometric Chart) is the map of air.

AXES:
• X-Axis (Bottom/Top): Mixing Ratio / Absolute Humidity (x). Unit: g/kg. The actual water weight.
• Y-Axis (Right/Left): Temperature (t). Unit: °C.

KEY CURVES:
• Relative Humidity (RH): Curved lines sweeping up from left to right. The bottom curve is usually 10% RH, the top curve is 100% RH (Saturation line).
• Enthalpy (h): Diagonal lines. Represents total energy (heat + chemical energy of water).

READING A POINT:
If you know Temp (20°C) and RH (50%), you can find the point on the chart.
• Go horizontally to the right scale to find x (approx 7.3 g/kg).
• Go horizontally to the left to hit the 100% RH line to find Dew Point (approx 9.3°C).`,
        quiz: {
          question: "On a standard Mollier diagram, if you move perfectly horizontally to the left (cooling), which value remains constant?",
          options: [
            "Relative Humidity (RH)",
            "Enthalpy (h)",
            "Mixing Ratio (x) / Absolute Humidity",
            "Saturation Pressure"
          ],
          correctIndex: 2
        }
      },
      {
        id: 'm3-lab',
        title: "Lab: Process Tracing",
        category: "Laboratory",
        level: "Intermediate",
        duration: "15 min",
        type: 'lab',
        content: "We will trace a Desiccant Dehumidification process. Process air enters at 20°C / 60% RH. It passes through the rotor.",
        labData: {
          scenario: "Rotor Output Prediction",
          readings: [
            { label: "Inlet Temp", value: "20°C" },
            { label: "Inlet RH", value: "60%" },
            { label: "Inlet Water", value: "8.7 g/kg" },
            { label: "Rotor Efficiency", value: "High" }
          ]
        },
        quiz: {
          question: "In an adiabatic adsorption process (desiccant rotor), the air loses moisture (g/kg drops). What happens to the temperature?",
          options: [
            "It drops significantly (Cooling)",
            "It stays exactly the same",
            "It rises (Heat of Adsorption + Latent to Sensible conversion)",
            "It fluctuates randomly"
          ],
          correctIndex: 2
        }
      }
    ]
  },
  {
    id: 'm4',
    title: "4. Moisture Load Calculations",
    level: "Advanced",
    lessons: [
      {
        id: 'm4-l1',
        title: "Sources of Moisture",
        category: "Engineering",
        level: "Advanced",
        duration: "25 min",
        type: 'lesson',
        content: `To dimension a dehumidifier, we must sum up all moisture loads (W_total).
W_total = W_ventilation + W_infiltration + W_people + W_permeation + W_product

1. VENTILATION / INFILTRATION (Usually the largest load)
Fresh air brings moisture.
Formula: W = Q * rho * (x_out - x_in)
• Q = Airflow (m³/h)
• rho = Density (~1.2 kg/m³)
• x_out = Outdoor water content (g/kg)
• x_in = Desired indoor water content (g/kg)

2. PEOPLE
• At rest: ~40 g/h per person.
• Active work: ~100-200 g/h per person.

3. PERMEATION
Moisture diffusing through walls/floor. Relevant for cold stores or very dry rooms.
Formula: W = A * K * (P_v_out - P_v_in)

4. OPEN WATER SURFACES
Evaporation from pools or tanks. Depends on air velocity and vapor pressure difference.`,
        quiz: {
          question: "For a standard warehouse keeping 50% RH, which is typically the single largest source of moisture load?",
          options: [
            "Diffusion through walls",
            "Personnel breathing",
            "Ventilation/Infiltration of outdoor air",
            "Forklift traffic"
          ],
          correctIndex: 2
        }
      },
      {
        id: 'm4-case',
        title: "Case: Sizing a Warehouse",
        category: "Case Study",
        level: "Advanced",
        duration: "30 min",
        type: 'case',
        content: `SCENARIO:
A steel storage warehouse (Volume 2000 m³) needs to be kept at 50% RH to prevent rust.
Outdoor design: 25°C / 70% RH (x = 14 g/kg).
Indoor target: 20°C / 50% RH (x = 7.3 g/kg).
Ventilation rate: 0.5 air changes per hour (ACH).
Internal load: None (no people, no open water).

Calculate the required capacity.`,
        labData: {
          scenario: "Warehouse Calculation",
          readings: [
            { label: "Volume", value: "2000 m³" },
            { label: "ACH", value: "0.5 /h" },
            { label: "Delta x", value: "6.7 g/kg" },
            { label: "Density", value: "1.2 kg/m³" }
          ]
        },
        quiz: {
          question: "Calculate the ventilation load (W). Flow = 1000 m³/h. Delta X = 6.7 g/kg. Density = 1.2.",
          options: [
            "~ 4.0 kg/h",
            "~ 8.0 kg/h",
            "~ 12.5 kg/h",
            "~ 24.0 kg/h"
          ],
          correctIndex: 1
        }
      }
    ]
  },
  {
    id: 'm5',
    title: "5. Applications",
    level: "Advanced",
    lessons: [
      {
        id: 'm5-l1',
        title: "Corrosion & Mould Prevention",
        category: "Applications",
        level: "Advanced",
        duration: "20 min",
        type: 'lesson',
        content: `CORROSION (RUST)
Iron and steel rust rapidly in high humidity. 
The "Vernon Curve" shows that the corrosion rate accelerates drastically above 60% RH.
• Rule of Thumb: Keep RH below 50% to stop rust almost completely.
• For military storage (mothballing): 45-50% RH is the standard.

MOULD & BACTERIA
Microorganisms need water to reproduce.
• Rule of Thumb: Mould generally cannot grow below 70% RH.
• Keeping a basement or archive below 60% RH is a safe buffer to prevent all mould growth.

ELECTRONICS
High humidity causes corrosion on circuit boards. Low humidity (below 30%) causes Static Electricity (ESD).
• Target: Usually 40-50% RH is ideal for electronics manufacturing.`,
        quiz: {
          question: "What is the widely accepted Relative Humidity limit to effectively stop the corrosion of steel?",
          options: [
            "Below 10% RH",
            "Below 50% RH",
            "Below 70% RH",
            "Below 90% RH"
          ],
          correctIndex: 1
        }
      }
    ]
  }
];

interface AcademyProps {
  completedLessons: string[];
  setCompletedLessons: React.Dispatch<React.SetStateAction<string[]>>;
}

const Academy: React.FC<AcademyProps> = ({ completedLessons, setCompletedLessons }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'none' | 'correct' | 'wrong'>('none');
  
  // TTS State
  const [isReading, setIsReading] = useState(false);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => stopAudio(); // Cleanup on unmount
  }, []);

  const handleLessonClick = (lesson: Lesson) => {
    stopAudio();
    setSelectedLesson(lesson);
    setQuizStarted(false);
    setSelectedOption(null);
    setQuizResult('none');
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsReading(false);
  };

  const playLessonAudio = async () => {
    if (isReading) {
      stopAudio();
      return;
    }

    if (!selectedLesson) return;

    setIsPreparingAudio(true);
    const audioBuffer = await generateLessonSpeech(selectedLesson.content);
    setIsPreparingAudio(false);

    if (audioBuffer) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const source = audioCtxRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtxRef.current.destination);
      source.onended = () => setIsReading(false);
      
      audioSourceRef.current = source;
      source.start();
      setIsReading(true);
    }
  };

  const handleQuizSubmit = () => {
    if (selectedOption === selectedLesson?.quiz.correctIndex) {
      setQuizResult('correct');
      if (selectedLesson && !completedLessons.includes(selectedLesson.id)) {
        setCompletedLessons(prev => [...prev, selectedLesson.id]);
      }
    } else {
      setQuizResult('wrong');
    }
  };

  if (selectedLesson) {
    const isLab = selectedLesson.type === 'lab';
    const isCase = selectedLesson.type === 'case';

    return (
      <div className="flex flex-col h-full bg-slate-950 animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-slate-800 flex items-center gap-4 bg-slate-900/50 backdrop-blur-md">
          <button onClick={() => { stopAudio(); setSelectedLesson(null); }} className="p-2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isLab ? 'text-emerald-500' : isCase ? 'text-amber-500' : 'text-sky-500'}`}>
              {selectedLesson.category}
            </span>
            <h3 className="text-lg font-bold text-slate-100 leading-tight">{selectedLesson.title}</h3>
          </div>
          
          {/* TTS Speaker Toggle */}
          <button 
            onClick={playLessonAudio}
            disabled={isPreparingAudio}
            className={`p-3 rounded-xl transition-all relative ${
              isReading ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 
              isPreparingAudio ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isReading ? (
              <ICONS.Stop className="w-5 h-5" />
            ) : (
              <ICONS.Speaker className={`w-5 h-5 ${isPreparingAudio ? 'animate-pulse' : ''}`} />
            )}
            {isReading && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-sky-400 rounded-full animate-ping" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!quizStarted ? (
            <div className="space-y-6 pb-12">
              <div className="flex gap-4 items-center">
                <div className={`px-3 py-1 rounded-full text-[10px] font-mono border ${
                  isLab ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 
                  isCase ? 'bg-amber-950/30 text-amber-400 border-amber-900/50' :
                  'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {selectedLesson.type.toUpperCase()}
                </div>
                <div className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-mono text-slate-400 border border-slate-700">{selectedLesson.duration}</div>
              </div>

              {isLab && selectedLesson.labData && (
                <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-lg">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <ICONS.Calculator className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Site Readings</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedLesson.labData.readings.map((r, i) => (
                      <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">{r.label}</p>
                        <p className="text-sm font-mono text-emerald-400">{r.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isCase && selectedLesson.labData && (
                <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-lg">
                   <div className="flex items-center gap-2 text-amber-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Case Parameters</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedLesson.labData.readings.map((r, i) => (
                      <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">{r.label}</p>
                        <p className="text-sm font-mono text-amber-400">{r.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg font-light tracking-wide">
                  {selectedLesson.content}
                </div>
              </div>

              <button 
                onClick={() => { stopAudio(); setQuizStarted(true); }}
                className={`w-full py-5 text-white rounded-2xl font-bold flex items-center justify-center gap-2 mt-8 shadow-2xl active:scale-95 transition-all ${
                   isLab ? 'bg-emerald-600 shadow-emerald-900/40' : 
                   isCase ? 'bg-amber-600 shadow-amber-900/40' : 
                   'bg-sky-600 shadow-sky-900/40'
                }`}
              >
                {isLab ? 'Submit Lab Analysis' : isCase ? 'Solve Engineering Case' : 'Validate Knowledge'}
                <ICONS.ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-12">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${
                  isLab ? 'bg-emerald-500/20 border-emerald-500/50' : 
                  isCase ? 'bg-amber-500/20 border-amber-500/50' :
                  'bg-sky-500/20 border-sky-500/50'
                }`}>
                  <ICONS.Tutor className={`w-6 h-6 ${isLab ? 'text-emerald-400' : isCase ? 'text-amber-400' : 'text-sky-400'}`} />
                </div>
                <h4 className="text-xl font-bold text-slate-100 mb-6 leading-snug">{selectedLesson.quiz.question}</h4>
                <div className="space-y-4">
                  {selectedLesson.quiz.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      disabled={quizResult !== 'none'}
                      className={`w-full p-4 text-left rounded-xl border transition-all text-sm font-medium ${
                        selectedOption === idx 
                          ? 'border-sky-500 bg-sky-500/10 text-sky-400' 
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {quizResult === 'none' && (
                  <button
                    disabled={selectedOption === null}
                    onClick={handleQuizSubmit}
                    className="w-full mt-8 py-4 bg-sky-600 text-white rounded-2xl font-bold disabled:opacity-50 transition-all shadow-lg active:scale-95"
                  >
                    Confirm Technical Decision
                  </button>
                )}

                {quizResult === 'correct' && (
                  <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <p className="text-emerald-400 font-bold mb-4">PROFICIENCY VALIDATED.<br/>Certification Status: UPDATED.</p>
                    <button
                      onClick={() => setSelectedLesson(null)}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold active:scale-95 transition-transform"
                    >
                      Proceed on Path
                    </button>
                  </div>
                )}

                {quizResult === 'wrong' && (
                  <div className="mt-8 p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center">
                    <p className="text-rose-400 font-bold mb-4">ERROR DETECTED.<br/>Physical principles violated. Review handbook content.</p>
                    <button
                      onClick={() => {setQuizResult('none'); setSelectedOption(null);}}
                      className="w-full py-3 bg-slate-700 text-white rounded-xl font-bold active:scale-95 transition-transform"
                    >
                      Recalibrate (Retry)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">The Academy</h2>
        <p className="text-slate-400 text-sm mt-1 font-light">The Official Dehumidification Handbook.</p>
      </header>

      <div className="space-y-6">
        {COURSE_DATA.map((mod) => (
          <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-slate-700/50">
            <div className="p-5 flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center border ${
                  mod.level === 'Beginner' ? 'border-sky-900/50' : mod.level === 'Advanced' ? 'border-amber-900/50' : 'border-emerald-900/50'
                }`}>
                  {mod.level === 'Beginner' ? <ICONS.Droplet className="w-5 h-5 text-sky-500" /> : <ICONS.Calculator className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 leading-tight">{mod.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      mod.level === 'Beginner' ? 'border-sky-900/50 bg-sky-950/30 text-sky-400' : 
                      mod.level === 'Advanced' ? 'border-amber-900/50 bg-amber-950/30 text-amber-400' :
                      'border-emerald-900/50 bg-emerald-950/30 text-emerald-400'
                    }`}>
                      {mod.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 space-y-3">
              {mod.lessons.map((lesson) => (
                <button 
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  className="w-full text-left p-4 rounded-xl bg-slate-800/40 border border-slate-800/60 flex items-center justify-between group hover:border-sky-500/30 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                      completedLessons.includes(lesson.id) ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-slate-700'
                    }`}>
                      {completedLessons.includes(lesson.id) && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold tracking-tight ${completedLessons.includes(lesson.id) ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-200'}`}>
                        {lesson.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className={`text-[8px] font-mono px-1 rounded uppercase tracking-tighter ${
                           lesson.type === 'lab' ? 'bg-emerald-900/30 text-emerald-500' : 
                           lesson.type === 'case' ? 'bg-amber-900/30 text-amber-500' : 
                           'bg-slate-700 text-slate-400'
                         }`}>
                           {lesson.category}
                         </span>
                         <span className="text-[8px] text-slate-500 font-mono">{lesson.duration}</span>
                      </div>
                    </div>
                  </div>
                  <ICONS.ArrowRight className={`w-3 h-3 transition-colors ${completedLessons.includes(lesson.id) ? 'text-emerald-500' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Academy;
