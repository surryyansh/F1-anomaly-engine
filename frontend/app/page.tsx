"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PitWallDashboard() {
  // State for the sliding window of telemetry data
  const [data, setData] = useState<any[]>([]);
  // State to trigger the UI red-alert
  const [isAnomaly, setIsAnomaly] = useState(false);
  // Connection status indicator
  const [status, setStatus] = useState("Connecting to Pit Wall...");

  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    // 1. Establish the WebSocket connection to your FastAPI backend
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/live-feed");

    ws.onopen = () => {
      setStatus("CONNECTED: LIVE TELEMETRY");
    };

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      
      // Update the red alert state dynamically
      setIsAnomaly(parsedData.anomaly);
      
      // 1. Update the live charts
      setData((prev) => {
        const newData = [...prev, parsedData];
        return newData.length > 50 ? newData.slice(newData.length - 50) : newData;
      });

      // 2. Catch and log anomalies
      if (parsedData.anomaly === true) {
        setAnomalies((prev) => {
          const newAnomaly = {
            time: new Date().toLocaleTimeString(), // Stamp the exact local time
            ...parsedData
          };
          // Add to the top of the list, keep only the latest 50 to prevent lag
          return [newAnomaly, ...prev].slice(0, 50); 
        });
      }
    };

    ws.onclose = () => {
      setStatus("OFFLINE: CONNECTION LOST");
    };

    // Cleanup the WebSocket when the component unmounts
    return () => ws.close();
  }, []);

  return (
    // The background dynamically turns dark red if an anomaly is detected
    <main className={`min-h-screen p-8 transition-colors duration-500 ${isAnomaly ? 'bg-[#1a0505]' : 'bg-[#0a0a0f]'} text-white`}>
      
      {/* HEADER */}
      <header className="mb-8 border-b border-gray-800/50 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-cyan-400 tracking-wider drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            MERCEDES-AMG F1 PIT WALL
          </h1>
          <p className="text-emerald-400 font-mono text-sm mt-2 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status.includes('OFFLINE') ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'}`}></span>
            {status}
          </p>
        </div>
        
        {/* Dynamic Alert Badge */}
        <div className={`px-6 py-2 rounded-full font-bold tracking-widest transition-all duration-300 ${isAnomaly ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse' : 'bg-slate-900/80 text-emerald-400 border border-emerald-900/50 shadow-[0_0_10px_rgba(52,211,153,0.1)]'}`}>
          {isAnomaly ? 'CRITICAL ANOMALY' : 'SYSTEMS NOMINAL'}
        </div>
      </header>

      {/* 2x2 CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* RPM Chart */}
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-4 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <h2 className="text-lg font-orbitron tracking-widest mb-4 text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">ENGINE SPEED (RPM)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis hide />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fontFamily: 'monospace'}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="RPM" stroke="#3B82F6" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Speed Chart */}
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-4 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <h2 className="text-lg font-orbitron tracking-widest mb-4 text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">VEHICLE SPEED (KM/H)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis hide />
                <YAxis domain={[0, 350]} stroke="#64748b" tick={{fontFamily: 'monospace'}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="Speed" stroke="#A855F7" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Throttle Chart */}
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-4 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <h2 className="text-lg font-orbitron tracking-widest mb-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">THROTTLE (%)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis hide />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{fontFamily: 'monospace'}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="Throttle" stroke="#10B981" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brake Chart */}
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-4 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <h2 className="text-lg font-orbitron tracking-widest mb-4 text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">BRAKE (ON/OFF)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis hide />
                <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(val) => val === 1 ? 'ON' : 'OFF'} stroke="#64748b" tick={{fontFamily: 'monospace'}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontFamily: 'monospace' }} />
                <Line type="stepAfter" dataKey={(row) => row.Brake ? 1 : 0} stroke="#F43F5E" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div> {/* <-- End of 2x2 Grid */}

      {/* 🚨 CRITICAL ANOMALY LOG (Stretches across full bottom) 🚨 */}
      <div className="bg-[#1a0f0f] border border-red-900/50 p-4 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.15)] relative overflow-hidden">
        {/* Red gradient top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900"></div>
        
        <h2 className="text-xl font-orbitron tracking-widest mb-4 text-red-500 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] mt-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
          CRITICAL ANOMALY LOG
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-sm tracking-wide">
            <thead>
              <tr className="border-b border-red-900/30 text-gray-500">
                <th className="p-3 font-normal">TIMESTAMP</th>
                <th className="p-3 font-normal">RPM</th>
                <th className="p-3 font-normal">SPEED</th>
                <th className="p-3 font-normal">THROTTLE</th>
                <th className="p-3 font-normal">BRAKE</th>
                <th className="p-3 font-normal">GEAR</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((anomaly, i) => (
                <tr key={i} className="border-b border-red-950/30 hover:bg-red-900/20 text-gray-300 transition-colors">
                  <td className="p-3 text-red-400 font-bold">{anomaly.time}</td>
                  <td className="p-3">{anomaly.RPM}</td>
                  <td className="p-3">{anomaly.Speed} km/h</td>
                  <td className="p-3">{anomaly.Throttle}%</td>
                  <td className="p-3">
                    <span className={anomaly.Brake ? "text-rose-400 font-bold drop-shadow-[0_0_3px_rgba(244,63,94,0.8)]" : "text-gray-600"}>
                      {anomaly.Brake ? 'ON' : 'OFF'}
                    </span>
                  </td>
                  <td className="p-3">Gear {anomaly.nGear}</td>
                </tr>
              ))}
              
              {/* Empty State */}
              {anomalies.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-emerald-500/30 italic">
                    No anomalies detected. Systems nominal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}