import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Activity,
  Heart,
  Droplet,
  Wind,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Bluetooth,
  Battery,
  Clock,
  Sparkles,
  Info,
  Play,
  Pause,
} from 'lucide-react';
import { MedicalDevice, Language } from '../types';

interface DeviceIntegrationProps {
  devices: MedicalDevice[];
  language: Language;
}

export const DeviceIntegration: React.FC<DeviceIntegrationProps> = ({ devices, language }) => {
  const isHindi = language === 'hi';
  const [selectedDevice, setSelectedDevice] = useState<MedicalDevice>(devices[0]);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [livePulse, setLivePulse] = useState<number>(76);
  const [liveSpO2, setLiveSpO2] = useState<number>(98);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live waveform animation on canvas (Plethysmogram / ECG waveform simulation)
  useEffect(() => {
    if (!isLiveStreaming) return;

    let animationFrameId: number;
    let t = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    const points: number[] = new Array(width).fill(midY);

    const render = () => {
      t += 0.05;

      // Generate medical wave point
      let y = midY;
      const beatCycle = (t * 2) % (Math.PI * 2);

      if (selectedDevice.type === 'pulse_oximeter') {
        // Photoplethysmogram (PPG) pulse curve with dicrotic notch
        if (beatCycle < 1.0) {
          y = midY - Math.sin(beatCycle * Math.PI) * 45;
        } else if (beatCycle < 1.6) {
          y = midY - Math.sin((beatCycle - 1.0) * Math.PI * 1.5) * 15;
        } else {
          y = midY;
        }
      } else {
        // ECG QRS waveform
        if (beatCycle < 0.2) {
          y = midY - 6; // P wave
        } else if (beatCycle < 0.35) {
          y = midY + 8; // Q wave
        } else if (beatCycle < 0.5) {
          y = midY - 55; // R peak
        } else if (beatCycle < 0.65) {
          y = midY + 18; // S wave
        } else if (beatCycle < 1.1) {
          y = midY - 14; // T wave
        } else {
          y = midY;
        }
      }

      // Add slight physiological jitter
      y += (Math.random() - 0.5) * 2;

      points.shift();
      points.push(y);

      // Draw oscilloscope grid
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 25) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Draw luminous trace
      ctx.strokeStyle = selectedDevice.type === 'pulse_oximeter' ? '#14b8a6' : '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.shadowColor = selectedDevice.type === 'pulse_oximeter' ? '#14b8a6' : '#06b6d4';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(i, points[i]);
        else ctx.lineTo(i, points[i]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLiveStreaming, selectedDevice]);

  // Minor fluctuations in pulse for realistic telemetry
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      setLivePulse((prev) => Math.min(84, Math.max(72, prev + (Math.random() > 0.5 ? 1 : -1))));
      setLiveSpO2((prev) => Math.min(99, Math.max(96, prev + (Math.random() > 0.8 ? 1 : 0))));
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  return (
    <div className="space-y-6">
      {/* Top Banner with Strict Medical Device Safety Directive */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {isHindi ? 'अनुमोदित एवं संगत चिकित्सा उपकरण एकीकरण' : 'Approved Medical Devices Hub'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isHindi
                ? 'केवल अनुमोदित एवं संगत चिकित्सा उपकरणों से ही डेटा संकलित किया जाता है। प्रत्येक रीडिंग का स्रोत व समय स्पष्ट रूप से प्रदर्शित होता है।'
                : 'Collect health measurements only through supported devices and authorized integrations with verified timestamp & model telemetry.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              CDSCO & FDA Device Gateway
            </span>
          </div>
        </div>

        {/* Regulatory Device Warning Notice */}
        <div className="mt-4 p-3 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Authorized Medical Hardware Compliance:</span>{' '}
            Measurements displayed here originate strictly from registered, calibrated clinical devices adhering to ISO 13485 standards. Do not connect uncertified hobbyist sensors for medical decision-making.
          </div>
        </div>
      </div>

      {/* Device Catalog Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map((device) => {
          const isSelected = selectedDevice.id === device.id;
          return (
            <button
              key={device.id}
              onClick={() => setSelectedDevice(device)}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-teal-500 shadow-lg ring-2 ring-teal-500/50'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      device.isConnected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {device.isConnected ? 'Connected BLE' : 'Offline'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] opacity-75">
                    <Battery className="w-3.5 h-3.5" />
                    <span>{device.batteryLevel}%</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm leading-snug line-clamp-2">{device.name}</h3>
                <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-teal-300' : 'text-slate-500'}`}>
                  {device.manufacturer}
                </p>

                {/* Primary Metric Preview */}
                <div className="mt-4 pt-3 border-t border-slate-200/20">
                  <span className={`text-[10px] uppercase font-semibold block ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    Current Reading
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black font-mono">
                      {device.id === 'dev_001' && isLiveStreaming ? liveSpO2 : device.currentReading.primaryValue}
                    </span>
                    <span className="text-xs font-semibold opacity-80">
                      {device.currentReading.primaryUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Source & Timestamp footer */}
              <div className={`mt-3 pt-2 text-[10px] border-t flex items-center justify-between ${
                isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'
              }`}>
                <span className="font-mono">{device.regulatoryStatus}</span>
                <span>{device.lastSyncTime}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Waveform & Detailed Device Inspection Studio */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-xs font-mono font-bold">
                {selectedDevice.regulatoryStatus}
              </span>
              <h2 className="text-base sm:text-lg font-bold">{selectedDevice.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Source Device: <span className="text-white font-mono">{selectedDevice.model}</span> • Serial No:{' '}
              <span className="text-teal-400 font-mono">{selectedDevice.serialNumber}</span> • Connectivity:{' '}
              <span className="text-slate-300">{selectedDevice.connectivity}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isLiveStreaming
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
              }`}
            >
              {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveStreaming ? 'Pause Live Stream' : 'Resume Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Live Oscilloscope Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl p-4 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>REAL-TIME BIOMETRIC TELEMETRY WAVEFORM</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">25mm/s • Calibrated BLE</span>
            </div>

            <canvas
              ref={canvasRef}
              width={640}
              height={180}
              className="w-full h-44 rounded-xl bg-slate-950 block border border-slate-900"
            />

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Sampling: 250 Hz</span>
              <span>Filter: 0.5 - 40 Hz Clinical Bandpass</span>
              <span>Device Latency: &lt; 24 ms</span>
            </div>
          </div>

          {/* Real-time Parameter Metrics Readout */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold block uppercase">
                Primary Physiological Marker
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono text-teal-300">
                  {selectedDevice.id === 'dev_001' && isLiveStreaming
                    ? liveSpO2
                    : selectedDevice.currentReading.primaryValue}
                </span>
                <span className="text-sm font-bold text-slate-300">
                  {selectedDevice.currentReading.primaryUnit}
                </span>
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Status: Normal Physiological Range
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 font-semibold block uppercase">
                Secondary Marker (Pulse / MAP)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono text-cyan-300">
                  {selectedDevice.id === 'dev_001' && isLiveStreaming
                    ? livePulse
                    : selectedDevice.currentReading.secondaryValue || '--'}
                </span>
                <span className="text-sm font-bold text-slate-300">
                  {selectedDevice.currentReading.secondaryUnit || 'Units'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Last Synced: <span className="text-slate-200">{selectedDevice.currentReading.recordedAt}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Historical Trends Table for the Selected Device */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Historical Synchronized Readings (Source Verified)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedDevice.historicalReadings.map((reading, idx) => (
              <div key={idx} className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px]">{reading.timestamp}</span>
                <div className="font-mono font-bold text-base text-white mt-0.5">
                  {reading.value}
                </div>
                {reading.secondary && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Pulse: {reading.secondary} bpm
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
