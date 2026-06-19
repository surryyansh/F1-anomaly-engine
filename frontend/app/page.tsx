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

  const chartGridColor = isDarkMode ? "#1e293b" : "#e2e8f0";
  const chartTextColor = isDarkMode ? "#64748b" : "#94a3b8";
  const chartTooltipBg = isDarkMode ? "#0f172a" : "#ffffff";
  const chartTooltipBorder = isDarkMode ? "#1e293b" : "#e2e8f0";

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
      <main className={`min-h-screen p-8 transition-colors duration-500 ${isDarkMode ? (isAnomaly ? 'bg-[#1a0505] text-white' : 'bg-[#0a0a0f] text-white') : (isAnomaly ? 'bg-red-50 text-slate-900' : 'bg-slate-50 text-slate-900')}`}>
        
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Charts (RPM, Speed, Throttle, Brake) */}
          {/* Note: I've included the RPM chart as an example structure. Repeat this block for others */}
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
        </div>

        {/* Anomaly Log Table */}
        <div className="bg-white dark:bg-[#1a0f0f] border border-red-200 dark:border-red-900/50 p-6 rounded-2xl shadow-xl dark:shadow-[0_0_15px_rgba(220,38,38,0.15)] relative overflow-hidden transition-colors duration-500">
          <h2 className="text-xl font-orbitron text-red-600 dark:text-red-500">CRITICAL ANOMALY LOG</h2>
          <table className="w-full text-left border-collapse font-mono text-sm mt-4">
            <thead>
              <tr className="border-b border-slate-200 dark:border-red-900/30 text-slate-500">
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">RPM</th>
                <th className="p-3">SPEED</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((anomaly, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-red-950/30 text-slate-700 dark:text-gray-300">
                  <td className="p-3">{anomaly.time || "N/A"}</td>
                  <td className="p-3">{anomaly.RPM}</td>
                  <td className="p-3">{anomaly.Speed} km/h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}