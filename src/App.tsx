import React, { useState } from 'react';
import './App.css';

export class WASMConfig {
    numOfSequentialChords: number;

    constructor(numOfSequentialChords: number) {
        this.numOfSequentialChords = numOfSequentialChords;
    }

    static fromString(jsonString: string): WASMConfig | null {
        try {
            const parsed = JSON.parse(jsonString);
            if (typeof parsed === 'object' && parsed !== null && typeof parsed.numOfSequentialChords === 'number') {
                return new WASMConfig(parsed.numOfSequentialChords);
            }
            console.error('Parsed object does not match WASMConfig structure');
            return null;
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return null;
        }
    }
}

// Placeholder for the WASM function
const mockWasmFunctionAsync = (input: WASMConfig): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Processed: ${input.numOfSequentialChords}`);
        }, 2000);
    });
};

const App = () => {
    const [config, setConfig] = useState<string>(JSON.stringify({ numOfSequentialChords: 10 }, null, 2)); // Default value
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
        // Parse config
        const conf : WASMConfig | null = WASMConfig.fromString(config);
        if (conf === null) {
            // make a toast? For now just console.log
            console.log(config + " is not a valid WASM config");
        } else {
            // Call the WASM function
            const processedResult = await mockWasmFunctionAsync(conf);
            setResult(processedResult);
            setLoading(false);
            clearInterval(interval);
            setProgress(100);
        }
    };

    return (
        <div className="App">
            <h1>Chord Nova <sub>Alpha</sub></h1>
            <textarea
                rows={4}
                cols={50}
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                placeholder="Enter your configuration here..."
            />
            <br />
            <button onClick={handleGoClick} disabled={loading}>
                {loading ? 'Processing...' : 'Go'}
            </button>
            <br />
            <div style={{ margin: '10px 0', width: '100%', background: '#eee' }}>
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

export default App;