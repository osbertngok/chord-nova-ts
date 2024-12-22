import {useState, useEffect, createContext, useContext} from 'react';
import './App.css';
import init, {ChordProgressionManager} from "./lib/cpg-wasm/cpg_wasm";

// Chord Progression Generation Context, providing a cached chord progression manager for performant chord progression generation.
interface CPGContextType {
    chordProgressionManager: ChordProgressionManager | undefined;
}

const CPGContext = createContext<CPGContextType | undefined>(undefined);

const ChordProgressionGeneratorComponent: React.FC = () => {
    const context = useContext(CPGContext);

    // Check if context is undefined (for safety)
    if (!context) {
        throw new Error("CPGComponent must be used within a CPGProvider");
    }

    const {chordProgressionManager} = context;


    const [config, setConfig] = useState<string>(JSON.stringify({
        numOfSequentialChords: 5,
        minNumOfPitches: 3,
        maxNumOfPitches: 4,
        minPitch: 40,
        maxPitch: 76,
        minThickness: 0.0,
        maxThickness: 50.0,
        minRoot: 0,
        maxRoot: 11,
        minGeometryCenter: 0.0,
        maxGeometryCenter: 70.0,
        minPitchClassSetSize: 3,
        maxPitchClassSetSize: 4,
        minCOFSpan: 0,
        maxCOFSpan: 12,
    }, null, 2)); // Default value
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleGoClick = async () => {
        setLoading(true);
        setProgress(0);
        setResult('');

        // Simulate progress
        const interval = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    clearInterval(interval);
                    return 100;
                }
                return Math.min(oldProgress + 20, 100);
            });
        }, 400);
        if (!chordProgressionManager) {
            console.error("CPG module is not initialized yet.");
        } else if (!chordProgressionManager.loadConfig(JSON.parse(config))) {
            console.error("Cannot load configuration " + config);
        } else {
            const processedResult: string = chordProgressionManager.calculateChordProgression(); // TODO: make this async
            setResult(processedResult);
            setLoading(false);
            clearInterval(interval);
            setProgress(100);
        }
    };

    return (
        <div className="App">
            <h1>Chord Nova <sub>α</sub></h1>
            <textarea
                rows={4}
                cols={50}
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                placeholder="Enter your configuration here..."
            />
            <br/>
            <button onClick={handleGoClick} disabled={loading}>
                {loading ? 'Processing...' : 'Go'}
            </button>
            <br/>
            <div style={{margin: '10px 0', width: '100%', background: '#eee'}}>
                <div
                    style={{
                        width: `${progress}%`,
                        height: '20px',
                        background: 'green',
                        transition: 'width 0.4s',
                    }}
                />
            </div>
            <textarea
                rows={4}
                cols={50}
                value={result}
                readOnly
                placeholder="Result will appear here..."
            />
        </div>
    );
};

const App = () => {
    const [cpm, setCpm] = useState<ChordProgressionManager | undefined>(undefined);

    useEffect(() => {
        const runWasm = async () => {
            await init(); // Initialize the WASM module
            setCpm(new ChordProgressionManager())
        };

        runWasm();
    }, []);


    return (
        <CPGContext.Provider value={{chordProgressionManager: cpm}}>
            <ChordProgressionGeneratorComponent></ChordProgressionGeneratorComponent>
        </CPGContext.Provider>
    )
};

export default App;