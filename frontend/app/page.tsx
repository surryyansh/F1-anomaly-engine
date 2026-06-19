"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PitWallDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [isAnomaly, setIsAnomaly] = useState(false);
  const [status, setStatus] = useState("Connecting to Pit Wall...");
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 1. WebSocket Effect: Live Feed
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/live-feed");
    ws.onopen = () => setStatus("CONNECTED: LIVE TELEMETRY");
    ws.onclose = () => setStatus("OFFLINE: CONNECTION LOST");

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      setIsAnomaly(parsedData.anomaly);
      
      setData((prev) => {
        const newData = [...prev, parsedData];
        return newData.length > 50 ? newData.slice(newData.length - 50) : newData;
      });

      if (parsedData.anomaly === true) {
        setAnomalies((prev) => {
          const newAnomaly = { time: new Date().toLocaleTimeString(), ...parsedData };
          return [newAnomaly, ...prev].slice(0, 50); 
        });
      }
    };
    return () => ws.close();
  }, []);

  // 2. Database Effect: Fetch History on Load
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/anomalies")
      .then((res) => res.json())
      .then((historicalData) => {
        if (Array.isArray(historicalData)) {
          setAnomalies(historicalData);
        }
      })
      .catch((err) => console.error("Could not fetch DB history:", err));
  }, []);

  // Dynamic Chart Colors based on Theme
  const chartGridColor = isDarkMode ? "#1e293b" : "#e2e8f0";
  const chartTextColor = isDarkMode ? "#64748b" : "#94a3b8";
  const chartTooltipBg = isDarkMode ? "#0f172a" : "#ffffff";
  const chartTooltipBorder = isDarkMode ? "#1e293b" : "#e2e8f0";

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
      <main className={`min-h-screen p-8 transition-colors duration-500 ${isDarkMode ? (isAnomaly ? 'bg-[#1a0505] text-white' : 'bg-[#0a0a0f] text-white') : (isAnomaly ? 'bg-red-50 text-slate-900' : 'bg-slate-50 text-slate-900')}`}>
        
        {/* HEADER */}
        <header className="mb-8 border-b border-slate-200 dark:border-slate-800/50 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-cyan-600 dark:text-cyan-400 tracking-wider dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
              MERCEDES-AMG F1 PIT WALL
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 font-mono text-sm mt-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status.includes('OFFLINE') ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              {status}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center gap-3 group">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">LIGHT</span>
              <div className="relative inline-flex h-6 w-12 items-center rounded-full bg-slate-300 dark:bg-slate-700 transition-colors shadow-inner">
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">DARK</span>
            </button>

            <div className={`px-6 py-2 rounded-full font-bold tracking-widest text-sm transition-all duration-300 ${isAnomaly ? 'bg-red-600 text-white shadow-lg dark:shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse' : 'bg-white dark:bg-slate-900/80 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-emerald-900/50 shadow-sm dark:shadow-[0_0_10px_rgba(52,211,153,0.1)]'}`}>
              {isAnomaly ? 'CRITICAL ANOMALY' : 'SYSTEMS NOMINAL'}
            </div>
          </div>
        </header>

        {/* 2x2 CHART GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* RPM Chart */}
          <div className="bg-white dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-lg dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors duration-500">
            <h2 className="text-lg font-orbitron tracking-widest mb-4 text-blue-600 dark:text-blue-400">ENGINE SPEED (RPM)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis hide />
                  <YAxis domain={['auto', 'auto']} stroke={chartTextColor} tick={{fontFamily: 'monospace', fontSize: 12}} />
                  <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: isDarkMode ? '#fff' : '#000', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="RPM" stroke="#3B82F6" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Speed Chart */}
          <div className="bg-white dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-lg dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors duration-500">
            <h2 className="text-lg font-orbitron tracking-widest mb-4 text-purple-600 dark:text-purple-400">VEHICLE SPEED (KM/H)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis hide />
                  <YAxis domain={[0, 350]} stroke={chartTextColor} tick={{fontFamily: 'monospace', fontSize: 12}} />
                  <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: isDarkMode ? '#fff' : '#000', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="Speed" stroke="#A855F7" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Throttle Chart */}
          <div className="bg-white dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-lg dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors duration-500">
            <h2 className="text-lg font-orbitron tracking-widest mb-4 text-emerald-600 dark:text-emerald-400">THROTTLE (%)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis hide />
                  <YAxis domain={[0, 100]} stroke={chartTextColor} tick={{fontFamily: 'monospace', fontSize: 12}} />
                  <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: isDarkMode ? '#fff' : '#000', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="Throttle" stroke="#10B981" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Brake Chart */}
          <div className="bg-white dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-lg dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors duration-500">
            <h2 className="text-lg font-orbitron tracking-widest mb-4 text-rose-600 dark:text-rose-400">BRAKE (ON/OFF)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis hide />
                  <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(val) => val === 1 ? 'ON' : 'OFF'} stroke={chartTextColor} tick={{fontFamily: 'monospace', fontSize: 12}} />
                  <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: isDarkMode ? '#fff' : '#000', borderRadius: '8px' }} />
                  <Line type="stepAfter" dataKey={(row) => row.Brake ? 1 : 0} stroke="#F43F5E" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* 🚨 CRITICAL ANOMALY LOG 🚨 */}
        <div className="bg-white dark:bg-[#1a0f0f] border border-red-200 dark:border-red-900/50 p-6 rounded-2xl shadow-xl dark:shadow-[0_0_15px_rgba(220,38,38,0.15)] relative overflow-hidden transition-colors duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600 dark:from-red-900 dark:via-red-500 dark:to-red-900"></div>
          
          <h2 className="text-xl font-orbitron tracking-widest mb-6 text-red-600 dark:text-red-500 flex items-center gap-3 dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] mt-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            CRITICAL ANOMALY LOG
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-sm tracking-wide">
              <thead>
                <tr className="border-b border-slate-200 dark:border-red-900/30 text-slate-500">
                  <th className="p-3 font-semibold">TIMESTAMP</th>
                  <th className="p-3 font-semibold">RPM</th>
                  <th className="p-3 font-semibold">SPEED</th>
                  <th className="p-3 font-semibold">THROTTLE</th>
                  <th className="p-3 font-semibold">BRAKE</th>
                  <th className="p-3 font-semibold">GEAR</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((anomaly, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-red-950/30 hover:bg-slate-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-gray-300 transition-colors">
                    <td className="p-3 text-red-600 dark:text-red-400 font-bold">{anomaly.time || "N/A"}</td>
                    <td className="p-3">{anomaly.RPM}</td>
                    <td className="p-3">{anomaly.Speed} km/h</td>
                    <td className="p-3">{anomaly.Throttle}%</td>
                    <td className="p-3">
                      <span className={anomaly.Brake ? "text-rose-600 dark:text-rose-400 font-bold dark:drop-shadow-[0_0_3px_rgba(244,63,94,0.8)]" : "text-slate-400 dark:text-gray-600"}>
                        {anomaly.Brake ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="p-3">Gear {anomaly.nGear}</td>
                  </tr>
                ))}
                
                {anomalies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-emerald-500/30 italic">
                      No anomalies detected. Systems nominal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}