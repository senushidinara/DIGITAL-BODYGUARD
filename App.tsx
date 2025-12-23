
import React, { useState, useEffect, useRef } from 'react';
import { SecurityAlert, SecurityAction } from './types';
import { INITIAL_ALERTS, ICONS } from './constants';
import { analyzeThreat } from './services/gemini';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [actions, setActions] = useState<SecurityAction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customAlert, setCustomAlert] = useState('{"alert": "Brute force attack detected", "location": "Moscow, RU", "user_current_location": "New York, US", "attempts": 45}');
  const [threatLevel, setThreatLevel] = useState(0);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [voiceQueue, setVoiceQueue] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actions, isAnalyzing]);

  const addAction = (type: SecurityAction['type'], status: SecurityAction['status'], details: string) => {
    const newAction: SecurityAction = {
      id: `act_${Math.random().toString(36).substr(2, 9)}`,
      type,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    setActions(prev => [newAction, ...prev]);
  };

  const handleProcessAlert = async (alert: SecurityAlert) => {
    setIsAnalyzing(true);
    setAiResponse('');
    addAction('ANALYSIS', 'PENDING', `Starting deep reasoning for alert: ${alert.alert}`);
    
    try {
      const result = await analyzeThreat(alert);
      setAiResponse(result.text);

      // Extract threat probability from text using regex
      const probMatch = result.text.match(/Threat Probability[:\s]*(\d+)%/i);
      let extractedProb = 0;
      if (probMatch) {
        extractedProb = parseInt(probMatch[1]);
        setThreatLevel(extractedProb);
      }

      // Check for voice script
      if (result.text.includes('[VOICE_SCRIPT]')) {
        const script = result.text.split('[VOICE_SCRIPT]')[1].trim();
        setVoiceQueue(prev => [...prev, script]);
      }

      // Handle function calls
      if (result.functionCalls && result.functionCalls.length > 0) {
        for (const call of result.functionCalls) {
          if (call.name === 'lock_user_account') {
            addAction('LOCK', 'EXECUTED', `Account locked. Reason: ${call.args.reason || 'Security threat detected'}`);
          } else if (call.name === 'rotate_security_keys') {
            addAction('ROTATE', 'EXECUTED', `API keys rotated for account ${call.args.account_id}`);
          } else if (call.name === 'trigger_elevenlabs_call') {
            addAction('VOICE_CALL', 'EXECUTED', `ElevenLabs call triggered to secure channel.`);
          }
        }
      } else if (extractedProb > 50) {
        addAction('ANALYSIS', 'CONSULTING', 'Threat detected. Awaiting user input for medium severity risk.');
      } else {
        addAction('ANALYSIS', 'EXECUTED', 'Analysis complete. Threat monitored, no immediate action required.');
      }
    } catch (error) {
      console.error(error);
      addAction('ANALYSIS', 'FAILED', 'Security analysis engine encountered an error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAlert = () => {
    try {
      const parsed = JSON.parse(customAlert);
      const newAlert: SecurityAlert = {
        ...parsed,
        id: `evt_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      setAlerts(prev => [newAlert, ...prev]);
      handleProcessAlert(newAlert);
    } catch (e) {
      alert("Invalid JSON alert format");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-zinc-300">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/30">
            {ICONS.Shield}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">DIGITAL BODYGUARD</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Gemini 3 Flash Protection Active
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-zinc-500">THREAT STATUS</p>
            <p className={`text-sm font-bold ${threatLevel > 70 ? 'text-red-500' : 'text-emerald-500'}`}>
              {threatLevel > 70 ? 'CRITICAL RISK' : 'SYSTEMS CLEAR'}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Column: Security Feed & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Risk Visualization */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase">
                {ICONS.Activity} Risk Profile (Last 24h)
              </h2>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { t: 0, v: 10 }, { t: 5, v: 25 }, { t: 10, v: 15 }, { t: 15, v: 45 }, { t: 20, v: 30 }, { t: 25, v: 80 }, { t: 30, v: threatLevel }
                ]}>
                  <Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Alert Injection */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4 uppercase">
              {ICONS.Alert} Simulate Security Alert
            </h2>
            <div className="space-y-4">
              <textarea 
                value={customAlert}
                onChange={(e) => setCustomAlert(e.target.value)}
                className="w-full h-32 bg-black border border-zinc-800 rounded-lg p-3 text-xs mono text-emerald-400 focus:outline-none focus:border-emerald-500/50"
                spellCheck={false}
              />
              <button 
                onClick={handleManualAlert}
                disabled={isAnalyzing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> ANALYZING...</>
                ) : (
                  'INJECT ALERT TO GEMINI'
                )}
              </button>
            </div>
          </section>

          {/* Active Voice Calls Simulation */}
          {voiceQueue.length > 0 && (
            <section className="bg-blue-900/10 border border-blue-500/30 rounded-2xl p-5 animate-pulse">
              <h2 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-3 uppercase">
                {ICONS.Phone} Outbound Voice Call
              </h2>
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 italic text-sm text-blue-100">
                "{voiceQueue[voiceQueue.length - 1]}"
              </div>
              <p className="text-[10px] text-blue-400/60 mt-2 text-center uppercase tracking-widest">Calling User via ElevenLabs...</p>
            </section>
          )}
        </div>

        {/* Right Column: AI Reasoning & Action Logs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* AI Reasoning Terminal */}
          <section className="bg-[#050505] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden h-[500px]">
            <div className="bg-zinc-900/80 p-3 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest ml-4">Reasoning Engine / Session_Log_Primary</span>
              </div>
              {isAnalyzing && <span className="text-[10px] text-emerald-400 animate-pulse">LLM_THINKING_ACTIVE</span>}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 mono text-xs">
              {actions.length === 0 && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                  {ICONS.Eye}
                  <p className="mt-2 uppercase tracking-tighter">Standby Mode. Monitoring network traffic...</p>
                </div>
              )}
              
              {actions.map(action => (
                <div key={action.id} className={`border-l-2 p-3 ${
                  action.status === 'EXECUTED' ? 'border-emerald-500 bg-emerald-500/5' : 
                  action.status === 'FAILED' ? 'border-red-500 bg-red-500/5' :
                  'border-zinc-700 bg-zinc-800/20'
                }`}>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold uppercase flex items-center gap-2">
                      {action.type === 'LOCK' && ICONS.Lock}
                      {action.type === 'ROTATE' && ICONS.Key}
                      {action.type === 'VOICE_CALL' && ICONS.Phone}
                      {action.type === 'ANALYSIS' && ICONS.Terminal}
                      {action.type} [{action.status}]
                    </span>
                    <span className="text-zinc-600">{new Date(action.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-zinc-400">{action.details}</p>
                </div>
              ))}
              
              {aiResponse && (
                <div className="bg-emerald-950/20 p-4 border border-emerald-500/20 rounded-lg text-emerald-100 whitespace-pre-wrap">
                  <div className="text-emerald-500 font-bold mb-2 uppercase text-[10px] tracking-widest">Gemini reasoning output:</div>
                  {aiResponse}
                </div>
              )}
              
              <div ref={logEndRef} />
            </div>
          </section>

          {/* Recent History / Datadog Sink */}
          <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4 uppercase">
              {ICONS.Eye} Recent Activity Log
            </h2>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => handleProcessAlert(alert)}>
                  <div className="flex gap-4 items-center">
                    <div className={`p-2 rounded-full ${alert.attempts > 10 ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-500'}`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200">{alert.alert}</h3>
                      <p className="text-xs text-zinc-500">{alert.location} &bull; {alert.attempts} attempts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-600">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                    <button className="text-[10px] uppercase font-bold text-emerald-500 mt-1">Re-Analyze</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="p-4 border-t border-zinc-900 text-[10px] text-zinc-600 flex justify-between uppercase tracking-widest">
        <span>Digital Bodyguard v2.4.0</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Datadog Connected</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Gemini API Ready</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
