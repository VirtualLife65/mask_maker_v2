import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
    Music, UploadCloud, Loader2, XCircle, Guitar, Layers, PlayCircle, 
    PauseCircle, Trash2, Rewind, FastForward, Volume2, Upload, Download,
    Drum, Mic, Piano, Sparkles
} from 'lucide-react';

const stemDetails = {
    drums: { icon: <Drum className="h-5 w-5" />, color: "border-red-500", progressColor: 'rgb(239, 68, 68)' },
    bass: { icon: <Music className="h-5 w-5" />, color: "border-blue-500", progressColor: 'rgb(59, 130, 246)' },
    vocals: { icon: <Mic className="h-5 w-5" />, color: "border-yellow-500", progressColor: 'rgb(234, 179, 8)' },
    guitar: { icon: <Guitar className="h-5 w-5" />, color: "border-green-500", progressColor: 'rgb(34, 197, 94)' },
    piano: { icon: <Piano className="h-5 w-5" />, color: "border-purple-500", progressColor: 'rgb(168, 85, 247)' },
    other: { icon: <Sparkles className="h-5 w-5" />, color: "border-pink-500", progressColor: 'rgb(236, 72, 153)' },
};

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// --- Reusable Stem Player Component ---
const StemPlayer = ({ name, url, originalFileName }) => {
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const [WaveSurfer, setWaveSurfer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
    import('wavesurfer.js')
        .then(module => setWaveSurfer(() => module.default))
        .catch(e => console.error('Failed to load wavesurfer.js', e));
    }, []);

    useEffect(() => {
    if (!WaveSurfer || !waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgb(209, 213, 219)',
        progressColor: stemDetails[name]?.progressColor || 'rgb(168, 85, 247)',
        cursorColor: '#374151',
        responsive: true,
        height: 60,
        barWidth: 2,
        barRadius: 2,
    });

    wavesurfer.current.load(`http://127.0.0.1:8000/${url}`);
    
    wavesurfer.current.on('ready', () => {
        if (wavesurfer.current) {
        setDuration(wavesurfer.current.getDuration());
        wavesurfer.current.setVolume(volume);
        }
    });
    wavesurfer.current.on('audioprocess', (time) => setCurrentTime(time));
    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));
    wavesurfer.current.on('finish', () => setIsPlaying(false));

    return () => wavesurfer.current.destroy();
    }, [WaveSurfer, url, name]);

    const handlePlayPause = () => wavesurfer.current?.playPause();
    const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    wavesurfer.current?.setVolume(newVolume);
    };

    const handleDownload = async () => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/${url}`);
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `${originalFileName.split('.').slice(0, -1).join('.')}_${name}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
    } catch (err) {
        console.error("Error downloading file:", err);
    }
    };

    return (
    <div className={`p-4 rounded-lg border-l-4 bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${stemDetails[name]?.color || 'border-gray-400'}`}>
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-semibold">
            {stemDetails[name]?.icon}
            <span className="capitalize">{name}</span>
            </div>
            <button 
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-[#4ADEFF] transition-colors"
                title={`Download ${name} stem`}
            >
            <Download className="h-5 w-5" />
            </button>
        </div>
        <div ref={waveformRef} className="w-full cursor-pointer"></div>
        <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
            <button onClick={handlePlayPause} className="p-2 text-gray-600 hover:text-[#4ADEFF] transition-colors rounded-full hover:bg-gray-200">
            {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
            </div>
        </div>
        <div className="flex items-center gap-2 w-24">
            <Volume2 size={16} className="text-gray-500" />
            <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4ADEFF]"
            />
        </div>
        </div>
    </div>
    );
};

const App = () => {
    const [file, setFile] = useState(null);
    const [stems, setStems] = useState(null);
    const [chords, setChords] = useState(null);
    const [isSeparating, setIsSeparating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedModel, setSelectedModel] = useState('htdemucs');

    const mainWaveformRef = useRef(null);
    const mainWavesurfer = useRef(null);
    const [WaveSurfer, setWaveSurfer] = useState(null); 
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [currentChordIndex, setCurrentChordIndex] = useState(-1);
    const timelineRef = useRef(null);

    useEffect(() => {
        import('wavesurfer.js')
        .then(module => setWaveSurfer(() => module.default))
        .catch(e => console.error('Failed to load wavesurfer.js', e));
    }, []);

    useEffect(() => {
    if (!WaveSurfer || !file || !mainWaveformRef.current) return;

    if (mainWavesurfer.current) mainWavesurfer.current.destroy();

    const ctx = document.createElement('canvas').getContext('2d');
    const waveGradient = ctx.createLinearGradient(0, 0, 0, 100);
    waveGradient.addColorStop(0, 'rgba(74, 222, 255, 0.8)');
    waveGradient.addColorStop(0.5, 'rgba(73, 133, 250, 0.6)'); 
    waveGradient.addColorStop(1, 'rgba(73, 133, 250, 0.4)');
    const progressGradient = ctx.createLinearGradient(0, 0, 0, 100);
    progressGradient.addColorStop(0, 'rgba(73, 133, 250, 0.9)');
    progressGradient.addColorStop(0.5, 'rgba(74, 222, 255, 0.8)');
    progressGradient.addColorStop(1, 'rgba(73, 133, 250, 0.7)');

    mainWavesurfer.current = WaveSurfer.create({
        container: mainWaveformRef.current,
        waveColor: waveGradient,
        progressColor: progressGradient,
        cursorColor: '#374151',
        responsive: true,
        height: 100,
    });
    mainWavesurfer.current.load(URL.createObjectURL(file));
    mainWavesurfer.current.on('ready', () => {
        setDuration(mainWavesurfer.current.getDuration());
        mainWavesurfer.current.setVolume(volume);
    });
    mainWavesurfer.current.on('audioprocess', (time) => setCurrentTime(time));
    mainWavesurfer.current.on('seek', (progress) => setCurrentTime(progress * (mainWavesurfer.current?.getDuration() || 0)));
    mainWavesurfer.current.on('play', () => setIsPlaying(true));
    mainWavesurfer.current.on('pause', () => setIsPlaying(false));
    mainWavesurfer.current.on('finish', () => setIsPlaying(false));

    return () => mainWavesurfer.current.destroy();
    }, [file, WaveSurfer]);

    useEffect(() => {
        if (!chords || chords.length === 0) {
        setCurrentChordIndex(-1);
        return;
    }
    const index = chords.findIndex(c => currentTime >= c.start && currentTime < c.end);
    if (index !== currentChordIndex) {
        setCurrentChordIndex(index);
        if (timelineRef.current && index >= 0) {
            const activeChild = timelineRef.current.children[index];
            if (activeChild) {
            timelineRef.current.scrollTo({
                top: activeChild.offsetTop - timelineRef.current.clientHeight / 2 + activeChild.clientHeight / 2,
                behavior: 'smooth'
            });
            }
        }
        }
    }, [currentTime, chords, currentChordIndex]);

    const handlePlayPause = () => mainWavesurfer.current?.playPause();
    const handleSkip = (seconds) => mainWavesurfer.current?.skip(seconds);
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        mainWavesurfer.current?.setVolume(newVolume);
    };

    const clearFile = () => {
        setFile(null); setStems(null); setChords(null); setError(null);
        setCurrentTime(0); setDuration(0); setCurrentChordIndex(-1);
    };

    const handleSeparate = async () => {
    if (!file) return;
    setIsSeparating(true); setError(null); setStems(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', selectedModel);
        try {
        const response = await fetch('http://127.0.0.1:8000/separate', { method: 'POST', body: formData });
        if (response.ok) setStems((await response.json()).stems);
        else setError(`Separation failed: ${(await response.json()).detail || 'Unknown error'}`);
        } catch (err) {
        setError('Connection to the server failed.');
        } finally {
        setIsSeparating(false);
        }
    };

    const handleAnalyzeChords = async () => {
        if (!file) return;
        setIsAnalyzing(true); setError(null); setChords(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
        const response = await fetch('http://127.0.0.1:8000/chords', { method: 'POST', body: formData });
        if (response.ok) setChords((await response.json()).chords);
        else setError(`Chord analysis failed: ${(await response.json()).detail || 'Unknown error'}`);
        } catch (err) {
        setError('Connection to the server failed.');
        } finally {
        setIsAnalyzing(false);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length) {
        clearFile();
        setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: { 'audio/*': [] },
        multiple: false,
        disabled: isSeparating || isAnalyzing,
        noClick: true,
        noKeyboard: true,
    });

    const isLoading = isSeparating || isAnalyzing;
    const currentChord = currentChordIndex >= 0 ? chords[currentChordIndex] : null;
    const prevChord = currentChordIndex > 0 ? chords[currentChordIndex - 1] : null;
    const nextChord = currentChordIndex < chords?.length - 1 ? chords[currentChordIndex + 1] : null;

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 font-sans flex flex-col items-center justify-center p-4 sm:p-6">
            <img src="/src/assets/Logo.png" alt="Logo" className="h-20 w-auto"/>
            <div>
                <br />
            </div>
        <div className="w-full max-w-4xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4ADEFF] to-[#4985FA]">
                    Audio Analysis Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                    Upload your audio file to separate instruments and analyze chords in real-time.
                </p>
            </header>

            <main>
            <div {...getRootProps({ className: 'outline-none' })}>
                <input {...getInputProps()} />
                {file ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <p className="font-semibold text-gray-700 truncate pr-4">{file.name}</p>
                    <div className="flex items-center gap-2">
                        <button onClick={open} className="p-2 text-gray-500 hover:text-[#4ADEFF] transition-colors rounded-full hover:bg-gray-200" disabled={isLoading} title="Upload New File">
                        <Upload size={20} />
                        </button>
                        <button onClick={clearFile} className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-gray-200" disabled={isLoading} title="Remove File">
                        <Trash2 size={20} />
                        </button>
                    </div>
                    </div>
                    
                    <div className="p-4 flex items-center gap-4">
                    <span className="font-mono text-xs text-gray-500">{formatTime(currentTime)}</span>
                    <div ref={mainWaveformRef} className="w-full h-24 cursor-pointer"></div>
                    <span className="font-mono text-xs text-gray-500">{formatTime(duration)}</span>
                    </div>
                
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleSkip(-5)} title="Skip Backward 5s" className="p-2 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-200 disabled:opacity-50" disabled={isLoading}>
                            <Rewind size={24} />
                        </button>
                        <button onClick={handlePlayPause} className="flex items-center justify-center bg-[#4ADEFF] hover:bg-[#4985FA] text-white w-16 h-16 rounded-full transition-transform transform hover:scale-110 shadow-lg disabled:opacity-50" disabled={isLoading}>
                            {isPlaying ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
                        </button>
                        <button onClick={() => handleSkip(5)} title="Skip Forward 5s" className="p-2 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-200 disabled:opacity-50" disabled={isLoading}>
                            <FastForward size={24} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto max-w-xs">
                        <Volume2 size={20} className="text-gray-500" />
                        <input
                            type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4ADEFF] disabled:opacity-50" disabled={isLoading}
                        />
                    </div>
                    </div>
                </div>
                ) : (
                <div className={`w-full p-8 border-2 border-dashed rounded-lg text-center transition-colors duration-300 ease-in-out bg-white shadow-sm ${isLoading ? 'cursor-not-allowed bg-gray-50 border-gray-200' : isDragActive ? 'border-[#4ADEFF] bg-[#4ADEFF]/10' : 'border-gray-300 hover:border-[#4ADEFF] hover:bg-gray-50'}`}>
                <div className="flex flex-col items-center justify-center">
                    <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg text-gray-700">{isDragActive ? 'Drop the file here...' : 'Drag & drop an audio file, or'}</p>
                    <button onClick={open} className="mt-2 text-[#4ADEFF] font-semibold hover:underline">
                    Select Files
                    </button>
                    <p className="text-sm text-gray-500 mt-1">MP3, WAV, FLAC, etc.</p>
                    </div>
                </div>
                )}
            </div>
            
            <div className="mt-6 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-center mb-3 flex items-center justify-center"><Layers className="mr-2 h-5 w-5" /> Separation Model</h3>
                <div className="relative flex w-64 items-center rounded-full bg-gray-200 p-1">
                    <div className={`absolute top-1 left-1 h-9 w-[calc(50%-0.25rem)] rounded-full bg-gradient-to-r from-[#4ADEFF] to-[#4985FA] shadow-md transition-transform duration-300 ease-in-out ${selectedModel === 'htdemucs' ? 'translate-x-0' : 'translate-x-full'}`} />
                    <button onClick={() => !isLoading && setSelectedModel('htdemucs')} className={`relative z-10 w-1/2 py-2 text-center text-sm font-medium transition-colors ${selectedModel === 'htdemucs' ? 'text-white' : 'text-gray-700'}`} disabled={isLoading}>4 Stems</button>
                    <button onClick={() => !isLoading && setSelectedModel('htdemucs_6s')} className={`relative z-10 w-1/2 py-2 text-center text-sm font-medium transition-colors ${selectedModel === 'htdemucs_6s' ? 'text-white' : 'text-gray-700'}`} disabled={isLoading}>6 Stems</button>
                </div>
            </div>

            {file && !isLoading && (
                <div className="mt-8 text-center flex flex-col sm:flex-row gap-4 justify-center">
            <button
                    onClick={handleSeparate}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-[#4ADEFF] to-[#4985FA] hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-lg disabled:from-gray-300 disabled:to-gray-400"
                    disabled={isLoading}>
                    <Music className="mr-2 h-6 w-6"/>Separate Audio
                    </button>
                    <button
                    onClick={handleAnalyzeChords}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-[#4985FA] to-[#4ADEFF] hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-lg disabled:from-gray-300 disabled:to-gray-400"
                    disabled={isLoading}>                        
                    <Guitar className="mr-2 h-6 w-6"/>Analyze Chords
                    </button>
                </div>
            )}

            {isLoading && (
                <div className="text-center mt-8 flex items-center justify-center text-lg">
                <Loader2 className="animate-spin mr-3 h-6 w-6" />
                {isSeparating ? 'Separating audio...' : 'Analyzing chords...'}
                </div>
            )}

            {error && (
                <div className="mt-8 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg flex items-start shadow-sm">
                <XCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                <h3 className="font-bold">An error occurred</h3>
                <p className="text-sm">{error}</p>
                </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 gap-8 mt-8">
                {stems && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Music className="mr-2" />Separated Tracks
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(stems).map(([name, url]) => (
                        <StemPlayer key={name} name={name} url={url} originalFileName={file.name} />
                    ))}
                    </div>
                </div>
                )}

                {chords && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Music className="mr-2" />Chord Progression
                    </h2>
                    {chords.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 flex flex-col items-center justify-center p-4 rounded-lg bg-white border-l-4 border-[#4ADEFF] shadow-md h-full order-2 md:order-1 hover:shadow-xl">
                            <div className="flex items-center justify-around w-full text-center h-24">
                                <div className="w-1/4">
                                <div className={`text-2xl font-bold text-gray-400 transition-all duration-300 ${prevChord ? 'opacity-100' : 'opacity-0'}`}>{prevChord?.chord}</div>
                                </div>
                                <div className="w-1/2">
                                <div className={`relative text-5xl font-bold text-[#4ADEFF] transition-all duration-300 ${currentChord ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                    {currentChord?.chord || '...'}
                                </div>
                                </div>
                                <div className="w-1/4">
                                <div className={`text-2xl font-bold text-gray-400 transition-all duration-300 ${nextChord ? 'opacity-100' : 'opacity-0'}`}>{nextChord?.chord}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t w-full justify-center">
                            <button onClick={() => handleSkip(-5)} title="Skip Backward 5s" className="p-2 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-200" disabled={isLoading}><Rewind size={20} /></button>
                            <button onClick={handlePlayPause} className="p-3 bg-[#4ADEFF] text-white rounded-full hover:bg-[#4985FA] shadow-md" disabled={isLoading}>{isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}</button>
                            <button onClick={() => handleSkip(5)} title="Skip Forward 5s" className="p-2 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-200" disabled={isLoading}><FastForward size={20} /></button>
                            </div>
                        </div>
                        <div className="md:col-span-2 relative h-96 bg-white rounded-lg border-l-4 border-[#4985FA] shadow-md order-1 md:order-2 hover:shadow-xl">
                        <div ref={timelineRef} className="h-full w-full overflow-y-auto scroll-smooth snap-y snap-mandatory relative p-2">
                            {chords.map((chord, index) => {
                            const isActive = index === currentChordIndex;
                            return (
                                <div
                                key={index}
                                className={`h-16 flex items-center justify-between px-4 border-b border-gray-200 last:border-b-0 transition-all duration-300 snap-start rounded-md ${isActive ? 'bg-[#4ADEFF]/20 text-[#4ADEFF] font-bold' : 'hover:bg-[#4ADEFF]/10'}`}
                                >
                                <span className="font-mono text-lg">{chord.chord}</span>
                                <span className="text-xs text-gray-500 font-mono">{formatTime(chord.start)} - {formatTime(chord.end)}</span>
                                </div>
                            );
                            })}
                        </div>
                        </div>
                    </div>
                    ) : (
                    <p className="text-gray-500 text-center">No chords detected—audio may be non-musical or too noisy.</p>
                    )}
                </div>
                )}
            </div>
            </main>
        </div>
        </div>
    );
};

export default App;