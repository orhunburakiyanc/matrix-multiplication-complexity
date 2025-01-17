import React, { useState } from 'react';
import * as math from 'mathjs'; // Math.js library
import numeric from 'numeric'; // Numeric.js library
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js library
import Matrix from 'matrix-js'; // Correct import of matrix-js library

// Generate random matrices
const generateMatrix = (size) => {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.floor(Math.random() * 100))
    );
};

// Vanilla JS Matrix Multiplication
const multiplyMatricesVanilla = (matrixA, matrixB) => {
    const size = matrixA.length;
    const result = Array.from({ length: size }, () => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
                result[i][j] += matrixA[i][k] * matrixB[k][j];
            }
        }
    }

    return result;
};

// Math.js Matrix Multiplication
const multiplyMatricesMathJS = (matrixA, matrixB) => {
    return math.multiply(matrixA, matrixB);
};

// Numeric.js Matrix Multiplication
const multiplyMatricesNumeric = (matrixA, matrixB) => {
    return numeric.dot(matrixA, matrixB);
};

// TensorFlow.js Matrix Multiplication (with WebGL backend)
const multiplyMatricesTensorFlow = async (matrixA, matrixB) => {
    try {
        await tf.setBackend('webgl'); // Set WebGL backend
        const tensorA = tf.tensor2d(matrixA);
        const tensorB = tf.tensor2d(matrixB);
        const result = await tf.matMul(tensorA, tensorB).array();
        tensorA.dispose();
        tensorB.dispose();
        return result;
    } catch (error) {
        console.error('TensorFlow.js error:', error);
        return null;
    }
};

// Matrix.js Matrix Multiplication
const multiplyMatricesMatrixJS = (matrixA, matrixB) => {
    const mA = new Matrix(matrixA);  // Matrix initialization
    const mB = new Matrix(matrixB);  // Matrix initialization
    return mA.mul(mB);  // Using `dot` for matrix multiplication
};

const MatrixMultiplier = () => {
    const [size, setSize] = useState('');
    const [matrixA, setMatrixA] = useState([]);
    const [matrixB, setMatrixB] = useState([]);
    const [repetitions, setRepetition] = useState(100);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false); // State to manage loading indicator

    const handleMultiply = async () => {
        setLoading(true); // Start loading spinner
        const libraries = [
            { name: 'Vanilla JS', func: multiplyMatricesVanilla },
            { name: 'Math.js', func: multiplyMatricesMathJS },
            { name: 'Numeric.js', func: multiplyMatricesNumeric },
            { name: 'TensorFlow.js', func: multiplyMatricesTensorFlow },
            { name: 'Matrix.js', func: multiplyMatricesMatrixJS }
        ];

        const timings = {};

        for (const library of libraries) {
            let start;
            let end;
            let avgTime = 0;
            if (library.name === 'TensorFlow.js') {
                for (let i = 0; i < 10; i++) {
                    await multiplyMatricesTensorFlow(matrixA, matrixB); // Warm-up for TensorFlow.js
                }
            }
            for (let i = 0; i < repetitions; i++) {
                start = performance.now();
                await library.func(matrixA, matrixB);
                end = performance.now();
                avgTime += end - start;
            }
            avgTime = (avgTime / repetitions).toFixed(4);
            timings[library.name] = avgTime;
        }

        setResults(timings);
        setLoading(false); // Stop loading spinner when done
    };

    return (
        <div>
            <div style={{ padding: "20px" }}>
                <h1>Matrix Multiplier Performance Comparison</h1>
                <label>
                    Repetitions:
                    <input
                        type="number"
                        value={repetitions}
                        onChange={(e) => setRepetition(parseInt(e.target.value, 10))}
                    />
                </label>
            </div>
            <div style={{ padding: "20px" }}>
                <label>
                    Matrix Size:
                    <input
                        type="number"
                        value={size}
                        onChange={(e) => {
                            const newSize = parseInt(e.target.value, 10);
                            setSize(newSize);
                            setMatrixA(generateMatrix(newSize));
                            setMatrixB(generateMatrix(newSize));
                            setResults(null);
                        }}
                        placeholder="Enter the matrix size"
                    />
                </label>
                <button onClick={handleMultiply}>Compare Performance</button>
            </div>

            {/* Show loading spinner if data is being processed */}
            {loading && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <div className="spinner" style={{ display: "inline-block", border: "8px solid #f3f3f3", borderTop: "8px solid #3498db", borderRadius: "50%", width: "50px", height: "50px", animation: "spin 1s linear infinite" }}></div>
                    <p>Calculating...</p>
                </div>
            )}

            {results && !loading && (
                <div style={{ padding: "20px" }}>
                    <h2>Performance Results (ms)</h2>
                    <ul style={{ listStyleType: 'none' }}>
                        {Object.entries(results).map(([library, time]) => (
                            <li key={library}>
                                {library}: {time} ms
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MatrixMultiplier;
