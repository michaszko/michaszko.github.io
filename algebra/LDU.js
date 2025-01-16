function calculateLDU() {
    const isValidMatrix = (matrix) => {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (isNaN(matrix[i][j]) || !isFinite(matrix[i][j])) {
                    return false;
                }
            }
        }
        return true;
    };
    // Get matrix values from input
    const matrix = [
        [parseFloat(document.getElementById('a00').value), parseFloat(document.getElementById('a01').value), parseFloat(document.getElementById('a02').value)],
        [parseFloat(document.getElementById('a10').value), parseFloat(document.getElementById('a11').value), parseFloat(document.getElementById('a12').value)],
        [parseFloat(document.getElementById('a20').value), parseFloat(document.getElementById('a21').value), parseFloat(document.getElementById('a22').value)]
    ];

    // LDU decomposition
    let L = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    let D = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    let U = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

    // Decompose matrix into L, D, and U
    for (let i = 0; i < 3; i++) {
        for (let j = i; j < 3; j++) {
            U[i][j] = matrix[i][j];
            for (let k = 0; k < i; k++) {
                U[i][j] -= L[i][k] * U[k][j];
            }
        }
        for (let j = i + 1; j < 3; j++) {
            L[j][i] = matrix[j][i];
            for (let k = 0; k < i; k++) {
                L[j][i] -= L[j][k] * U[k][i];
            }
            L[j][i] /= U[i][i];
        }
        D[i][i] = U[i][i];
        for (let k = 0; k < 3; k++) {
            U[i][k] /= D[i][i];
        }
    }

    // Format L, D, and U matrices in LaTeX form
    const formatMatrix = (matrix) => {
        return `\\begin{bmatrix} ${formatNumber(matrix[0][0])} & ${formatNumber(matrix[0][1])} & ${formatNumber(matrix[0][2])} \\\\ 
                ${formatNumber(matrix[1][0])} & ${formatNumber(matrix[1][1])} & ${formatNumber(matrix[1][2])} \\\\ 
                ${formatNumber(matrix[2][0])} & ${formatNumber(matrix[2][1])} & ${formatNumber(matrix[2][2])} \\end{bmatrix}`;
    };

    // Helper function to format numbers with or without decimals
    const formatNumber = (num) => {
        return Number.isInteger(num) ? num : num.toFixed(2);
    };

    // Check for NaN or Infinity values
    if (!isValidMatrix(L) || !isValidMatrix(D) || !isValidMatrix(U)) {
        document.getElementById('output').innerHTML = `
<h3 style="text-align:center">Decomposition not possible. Try permuting rows.</h3>
`;
        return;
    }

    const LMatrix = formatMatrix(L);
    const DMatrix = formatMatrix(D);
    const UMatrix = formatMatrix(U);

    // Output LDU equation
    document.getElementById('output').innerHTML = `
        $$A = L \\times D \\times U$$
        $$L = ${LMatrix} \\quad D = ${DMatrix} \\quad U = ${UMatrix}$$
    `;

    // Refresh MathJax to render the new LaTeX
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}