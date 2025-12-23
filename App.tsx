
import React, { useState, useEffect, useRef } from 'react';
import { SecurityAlert, SecurityAction } from './types';
import { INITIAL_ALERTS, ICONS } from './constants';
import { analyzeThreat } from './services/gemini';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { AlertTriangle, Activity, Eye, Shield, Check, X } from 'lucide-react';

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
    return newAction.id;
  };

  const updateActionStatus = (id: string, status: SecurityAction['status'], details?: string) => {
    setActions(prev => prev.map(action => 
      action.id === id ? { ...action, status, details: details || action.details } : action
    ));
  };

  const handleConfirmAction = (actionId: string, type: SecurityAction['type']) => {
    // Simulate execution of the previously suggested action
    const detailMap = {
      'LOCK': 'Account locked manually following AI recommendation.',
      'ROTATE': 'API keys rotated following AI recommendation.',
      'VOICE_CALL': 'Interdiction call confirmed and completed.',
      'ANALYSIS': 'Analysis accepted.'
    };
    updateActionStatus(actionId, 'EXECUTED', detailMap[type]);
  };

  const handleDenyAction = (actionId: string) => {
    updateActionStatus(actionId, 'FAILED', 'Threat dismissed by user. No action taken.');
  };

  const handleProcessAlert = async (alert: SecurityAlert) => {
    setIsAnalyzing(true);
    setAiResponse('');
    addAction('ANALYSIS', 'PENDING', `Starting deep reasoning for alert: ${alert.alert}`);
    
    try {
      const result = await analyzeThreat(alert);
      
      const displayText = result.text.split('[VOICE_SCRIPT]')[0].trim();
      setAiResponse(displayText);

      const probMatch = result.text.match(/Threat Probability[:\s]*(\d+)%/i) || displayText.match(/(\d+)%/);
      let extractedProb = 0;
      if (probMatch) {
        extractedProb = parseInt(probMatch[1]);
        setThreatLevel(extractedProb);
      }

      if (result.text.includes('[VOICE_SCRIPT]')) {
        const script = result.text.split('[VOICE_SCRIPT]')[1].trim();
        setVoiceQueue(prev => [...prev, script]);
      }

      if (result.functionCalls && result.functionCalls.length > 0) {
        for (const call of result.functionCalls) {
          if (call.name === 'lock_user_account') {
            addAction('LOCK', 'EXECUTED', `Account locked automatically. Reason: ${call.args.reason || 'Critical security threat'}`);
          } else if (call.name === 'rotate_security_keys') {
            addAction('ROTATE', 'EXECUTED', `API keys rotated for account ${call.args.account_id}`);
          } else if (call.name === 'trigger_elevenlabs_call') {
            // Medium severity uses voice call to verify with user
            addAction('VOICE_CALL', 'CONSULTING', `Outbound interdiction call initiated. Awaiting user voice/UI confirmation.`);
          }
        }
      } else if (extractedProb >= 50 && extractedProb <= 90) {
        addAction('LOCK', 'CONSULTING', 'Medium risk detected. Recommendation: Lock account. Awaiting user confirmation.');
      } else if (extractedProb > 90) {
        addAction('LOCK', 'EXECUTED', 'High risk detected (>90%). Automatic lock engaged for safety.');
      } else {
        addAction('ANALYSIS', 'EXECUTED', 'Analysis complete. Low risk detected, system remains in monitor mode.');
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
      <header className="border-b border-zinc-800 p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/30">
            {ICONS.Shield}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">DIGITAL BODYGUARD</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Security Engine Active
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-zinc-500">THREAT PROBABILITY</p>
            <p className={`text-sm font-bold transition-colors duration-500 ${threatLevel > 70 ? 'text-red-500' : threatLevel > 30 ? 'text-yellow-500' : 'text-emerald-500'}`}>
              {threatLevel}%
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 overflow-hidden">
            <h2 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4 uppercase">
              {ICONS.Activity} Risk Environment
            </h2>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { t: 0, v: 10 }, { t: 5, v: 25 }, { t: 10, v: 15 }, { t: 15, v: 45 }, { t: 20, v: 30 }, { t: 25, v: 80 }, { t: 30, v: threatLevel }
                ]}>
                  <Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.1} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4 uppercase">
              {ICONS.Alert} Manual Interdiction
            </h2>
            <div className="space-y-4">
              <textarea 
                value={customAlert}
                onChange={(e) => setCustomAlert(e.target.value)}
                className="w-full h-32 bg-black border border-zinc-800 rounded-lg p-3 text-xs mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-all"
                spellCheck={false}
              />
              <button 
                onClick={handleManualAlert}
                disabled={isAnalyzing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> PROCESSING...</>
                ) : (
                  'EVALUATE PAYLOAD'
                )}
              </button>
            </div>
          </section>

          {voiceQueue.length > 0 && (
            <section className="bg-blue-900/10 border border-blue-500/30 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-3 uppercase">
                {ICONS.Phone} Active Voice Interdiction
              </h2>
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 italic text-sm text-blue-100 flex gap-3">
                <span className="text-blue-400 font-bold shrink-0">AI:</span>
                "{voiceQueue[voiceQueue.length - 1]}"
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <section className="bg-[#050505] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden h-[500px] shadow-2xl">
            <div className="bg-zinc-900/80 p-3 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest ml-4">Terminal / Guard_Logic_Console</span>
              </div>
              {isAnalyzing && <span className="text-[10px] text-emerald-400 animate-pulse flex items-center gap-2">
                <Activity className="w-3 h-3" /> ANALYZING_STREAM
              </span>}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 mono text-xs">
              {actions.length === 0 && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center select-none">
                  <Eye className="w-12 h-12 mb-4" />
                  <p className="uppercase tracking-tighter">System Idle. Monitoring for telemetry ingestion.</p>
                </div>
              )}
              
              {actions.map(action => (
                <div key={action.id} className={`border-l-2 p-4 rounded-r-lg transition-all animate-in slide-in-from-left-2 ${
                  action.status === 'EXECUTED' ? 'border-emerald-500 bg-emerald-500/5' : 
                  action.status === 'FAILED' ? 'border-red-500 bg-red-500/5' :
                  action.status === 'CONSULTING' ? 'border-blue-500 bg-blue-500/10' :
                  'border-zinc-700 bg-zinc-800/20'
                }`}>
                  <div className="flex justify-between mb-2">
                    <span className="font-bold uppercase flex items-center gap-2">
                      {action.type === 'LOCK' && ICONS.Lock}
                      {action.type === 'ROTATE' && ICONS.Key}
                      {action.type === 'VOICE_CALL' && ICONS.Phone}
                      {action.type === 'ANALYSIS' && ICONS.Terminal}
                      {action.type} &bull; <span className={
                        action.status === 'EXECUTED' ? 'text-emerald-400' : 
                        action.status === 'CONSULTING' ? 'text-blue-400' :
                        action.status === 'FAILED' ? 'text-red-400' : 
                        'text-zinc-400'
                      }>{action.status}</span>
                    </span>
                    <span className="text-zinc-600 tabular-nums">{new Date(action.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">{action.details}</p>
                  
                  {action.status === 'CONSULTING' && (
                    <div className="mt-4 flex gap-3 animate-in fade-in zoom-in-95">
                      <button 
                        onClick={() => handleConfirmAction(action.id, action.type)}
                        className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Approve Action
                      </button>
                      <button 
                        onClick={() => handleDenyAction(action.id)}
                        className="bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Dismiss Threat
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {aiResponse && (
                <div className="bg-zinc-900/50 p-5 border border-emerald-500/20 rounded-xl text-zinc-100 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-emerald-500 font-bold mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Digital Bodyguard Report
                  </div>
                  <div className="space-y-4 leading-relaxed font-sans text-sm">
                    {aiResponse.split('\n').map((line, i) => {
                      if (line.startsWith('THREAT:') || line.startsWith('ACTION:') || line.startsWith('REASONING:')) {
                        const [label, ...rest] = line.split(':');
                        return (
                          <div key={i}>
                            <span className="text-emerald-500 font-bold mr-2">{label}:</span>
                            <span className="text-zinc-300">{rest.join(':')}</span>
                          </div>
                        );
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                </div>
              )}
              
              <div ref={logEndRef} />
            </div>
          </section>

          <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4 uppercase">
              {ICONS.Eye} Threat Ingestion Feed
            </h2>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className="group flex items-center justify-between p-4 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-emerald-500/30 transition-all cursor-pointer active:scale-[0.99]" onClick={() => handleProcessAlert(alert)}>
                  <div className="flex gap-4 items-center">
                    <div className={`p-3 rounded-xl transition-colors ${alert.attempts > 10 ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500'}`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200">{alert.alert}</h3>
                      <p className="text-xs text-zinc-500 font-mono uppercase tracking-tight">{alert.location} &bull; Origin: {alert.user_current_location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-600 tabular-nums">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <span className="text-[10px] uppercase font-bold text-emerald-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Analyze Now</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="p-4 border-t border-zinc-900 text-[10px] text-zinc-600 flex justify-between uppercase tracking-widest bg-black/50 backdrop-blur-sm">
        <div className="flex gap-6">
          <span>Digital Bodyguard OS v2.4.0</span>
          <span>Latency: 24ms</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span> Datadog Uplink</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span> Gemini 3 Flash Node</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
