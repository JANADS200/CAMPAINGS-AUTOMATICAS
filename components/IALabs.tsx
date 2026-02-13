
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { dbStore } from '../services/storageService';
import { BusinessInfo, StoredAsset, LabTaskState } from '../types';
import { 
  ImageIcon, 
  Video, 
  Zap, 
  Sparkles, 
  RefreshCcw, 
  X, 
  Eye, 
  ShieldAlert,
  Cpu,
  ExternalLink,
  Upload,
  CheckCircle2,
  Check,
  Activity,
  AlertTriangle,
  Loader2,
  BarChart4,
  Download
} from 'lucide-react';

interface IALabsProps {
  business: BusinessInfo;
  task: LabTaskState;
  setTask: React.Dispatch<React.SetStateAction<LabTaskState>>;
  onRun: (type: 'image_edit' | 'video_animator' | 'vision_heatmap', prompt: string, image: string | null, batchSize: number) => void;
}

const AIProgressBar = ({ progress, status }: { progress: number, status: string }) => (
  <div className="w-full space-y-4 animate-fadeIn">
    <div className="flex justify-between items-end">
      <div className="space-y-1">
        <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em] animate-pulse">Algoritmo Generativo Activo</p>
        <p className="text-xs font-bold text-white uppercase truncate max-w-[200px]">{status}</p>
      </div>
      <p className="text-2xl font-black text-white italic">{progress}%</p>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
      <div 
        className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

export const IALabs: React.FC<IALabsProps> = ({ business, task, setTask, onRun }) => {
  const [activeType, setActiveType] = useState<'image_edit' | 'video_animator' | 'vision_heatmap'>(task.type);
  const [prompt, setPrompt] = useState(task.prompt);
  const [image, setImage] = useState<string | null>(task.baseImage);
  const [batchSize, setBatchSize] = useState(1);
  const [previewAsset, setPreviewAsset] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<'none' | 'success' | 'fail'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTestKey = async () => {
    setTestResult('none');
    try {
      const ok = await gemini.testConnection();
      setTestResult(ok ? 'success' : 'fail');
    } catch { setTestResult('fail'); }
  };

  const processTask = async () => {
    if (activeType === 'vision_heatmap') {
      if (!image) return alert("Sube una imagen para analizar.");
      setTask(prev => ({ ...prev, status: 'generating', progress: 20, message: 'Analizando Oculometría IA...' }));
      try {
        const report = await gemini.analyzeHeatmap(image);
        setTask(prev => ({ ...prev, status: 'completed', progress: 100, message: 'Análisis Finalizado', visionReport: report }));
      } catch (e) {
        setTask(prev => ({ ...prev, status: 'error', message: 'Error de visión.' }));
      }
    } else {
      if (!prompt.trim() && !image) return alert("Instrucción requerida.");
      onRun(activeType, prompt, image, batchSize);
    }
  };

  const getMediaType = (data: string) => {
    if (data.startsWith('data:video') || data.includes('.mp4') || data.includes('blob:')) return 'video';
    return 'image';
  };

  const downloadAsset = (url: string) => {
    const isVideo = getMediaType(url) === 'video';
    const link = document.createElement('a');
    link.href = url;
    link.download = `Phoenix_Lab_${Date.now()}.${isVideo ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-32">
      {previewAsset && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6" onClick={() => setPreviewAsset(null)}>
          <div className="max-w-4xl w-full glass rounded-[3rem] overflow-hidden border border-white/10 relative" onClick={e => e.stopPropagation()}>
            <div className="absolute top-6 left-6 z-50 flex gap-3">
               <button onClick={() => setPreviewAsset(null)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-rose-500 transition-all backdrop-blur-md">
                 <X size={24} />
               </button>
               <button onClick={() => downloadAsset(previewAsset)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-all backdrop-blur-md">
                 <Download size={24} />
               </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              {getMediaType(previewAsset) === 'video' ? (
                <video src={previewAsset} controls autoPlay className="max-w-full max-h-full" />
              ) : (
                <img src={previewAsset} className="max-w-full max-h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 px-4">
        <div>
          <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">PHOENIX <span className="text-cyan-400">LABS</span></h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-2">Reactor de Creativos Generativos</p>
        </div>
        
        <button 
          onClick={handleTestKey}
          className={`px-8 py-4 rounded-3xl border flex items-center gap-4 transition-all ${
            testResult === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            testResult === 'fail' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
            'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
           {testResult === 'success' ? <Check size={20} /> : testResult === 'fail' ? <ShieldAlert size={20} /> : <Zap size={20} />}
           <span className="text-[10px] font-black uppercase tracking-widest">{testResult === 'success' ? 'LLAVE OK' : testResult === 'fail' ? 'ERROR API' : 'TEST RÁPIDO'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-4">
        <div className="lg:col-span-1 space-y-4">
          <button onClick={() => setActiveType('image_edit')} className={`w-full p-8 rounded-[2rem] text-left border flex items-center gap-4 transition-all ${activeType === 'image_edit' ? 'bg-cyan-50 text-slate-900 border-cyan-400 shadow-xl' : 'glass border-white/5 text-slate-400 hover:border-white/20'}`}>
            <ImageIcon size={24} />
            <div className="font-black uppercase text-xs">Imágenes Pro</div>
          </button>
          <button onClick={() => setActiveType('video_animator')} className={`w-full p-8 rounded-[2rem] text-left border flex items-center gap-4 transition-all ${activeType === 'video_animator' ? 'bg-rose-600 text-white border-rose-400 shadow-xl' : 'glass border-white/5 text-slate-400 hover:border-white/20'}`}>
            <Video size={24} />
            <div className="font-black uppercase text-xs">Video Veo 3.1</div>
          </button>
          <button onClick={() => setActiveType('vision_heatmap')} className={`w-full p-8 rounded-[2rem] text-left border flex items-center gap-4 transition-all ${activeType === 'vision_heatmap' ? 'bg-purple-600 text-white border-purple-400 shadow-xl' : 'glass border-white/5 text-slate-400 hover:border-white/20'}`}>
            <BarChart4 size={24} />
            <div className="font-black uppercase text-xs">Vision Heatmap</div>
          </button>
          
          {activeType !== 'vision_heatmap' && (
            <div className="p-8 glass rounded-[2.5rem] border border-white/5 bg-slate-900/20 space-y-6">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Configuración Lote</p>
              <div className="flex gap-2">
                  {[1, 2, 4].map(size => (
                    <button key={size} onClick={() => setBatchSize(size)} className={`flex-1 py-4 rounded-xl font-black text-xs border ${batchSize === size ? 'bg-cyan-500 border-cyan-400 text-slate-900' : 'bg-white/5 border-white/10 text-slate-500'}`}>{size}</button>
                  ))}
              </div>
            </div>
          )}

          {task.status === 'completed' && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] animate-fadeIn">
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={14} /> Tarea completada
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-8">
           <div className="glass rounded-[4rem] p-8 md:p-12 border border-white/10 space-y-10 bg-slate-900/40 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div 
                   onClick={() => task.status !== 'generating' && !image && fileInputRef.current?.click()}
                   className={`aspect-square rounded-[3rem] border-2 border-dashed border-white/5 bg-black/40 flex flex-col items-center justify-center cursor-pointer hover:bg-black/60 transition-all overflow-hidden group relative ${task.status === 'generating' ? 'cursor-not-allowed' : ''}`}
                 >
                    {image ? (
                      <>
                        <img src={image} className="w-full h-full object-cover" />
                        {task.status !== 'generating' && (
                          <div className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setImage(null); }}>
                            <X size={48} className="text-white" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center space-y-4 opacity-30 group-hover:opacity-100 transition-all">
                         <Upload size={48} className="mx-auto text-white" />
                         <p className="text-[10px] font-black text-white uppercase tracking-widest">Sube Imagen para Lab</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f){ const r=new FileReader(); r.onload=()=>setImage(r.result as string); r.readAsDataURL(f); } }} />
                 </div>

                 <div className="space-y-6">
                    {activeType === 'vision_heatmap' ? (
                       <div className="p-8 bg-purple-900/20 border border-purple-500/30 rounded-[2.5rem] space-y-4">
                          <h4 className="text-sm font-black text-white uppercase tracking-widest">NEUROMARKETING VISION</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">La IA analizará la jerarquía visual de tu anuncio para predecir el comportamiento del usuario.</p>
                       </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">COMANDO NEURONAL</label>
                        <textarea 
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)}
                            disabled={task.status === 'generating'}
                            placeholder="Describe la escena, iluminación y estilo..."
                            className="w-full h-48 p-8 rounded-[2.5rem] bg-black/40 border border-white/5 text-white font-bold outline-none focus:border-cyan-500 transition-all resize-none text-sm"
                        />
                      </div>
                    )}
                    {task.status === 'generating' && <AIProgressBar progress={task.progress} status={task.message} />}
                    <button 
                      onClick={processTask} 
                      disabled={task.status === 'generating'}
                      className={`w-full py-8 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center justify-center gap-6 transition-all hover:scale-[1.02] ${activeType === 'video_animator' ? 'bg-rose-600 text-white' : activeType === 'vision_heatmap' ? 'bg-purple-600 text-white' : 'bg-cyan-500 text-slate-900'} disabled:opacity-50`}
                    >
                      {task.status === 'generating' ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
                      {task.status === 'generating' ? 'PROCESANDO EN SEGUNDO PLANO...' : activeType === 'vision_heatmap' ? 'ANALIZAR OCULOMETRÍA' : 'INICIAR PROCESO'}
                    </button>
                 </div>
              </div>

              {task.visionReport && activeType === 'vision_heatmap' && (
                <div className="mt-8 p-10 bg-slate-950/80 rounded-[3rem] border border-purple-500/20 animate-fadeIn">
                   <div className="flex items-center gap-4 text-purple-400 mb-6">
                      <Cpu size={24} />
                      <h4 className="text-xl font-black uppercase tracking-tighter italic">REPORTE NEURAL DE VISIÓN</h4>
                   </div>
                   <div className="prose prose-invert max-w-none">
                      <p className="text-slate-300 font-medium leading-relaxed whitespace-pre-wrap italic">
                        {task.visionReport}
                      </p>
                   </div>
                </div>
              )}

              {(task.results.length > 0) && activeType !== 'vision_heatmap' && (
                <div className="pt-10 border-t border-white/5 space-y-6">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Resultados de Sesión</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {task.results.map((res, i) => (
                        <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-black group relative shadow-xl">
                           {getMediaType(res) === 'video' ? (
                             <video src={res} className="w-full h-full object-cover" muted loop autoPlay />
                           ) : (
                             <img src={res} className="w-full h-full object-cover" />
                           )}
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button onClick={() => setPreviewAsset(res)} className="p-4 bg-white rounded-2xl text-slate-900 hover:scale-110 transition-all shadow-2xl">
                                 <Eye size={20} />
                              </button>
                              <button onClick={() => downloadAsset(res)} className="p-4 bg-cyan-500 rounded-2xl text-slate-900 hover:scale-110 transition-all shadow-2xl">
                                 <Download size={20} />
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
