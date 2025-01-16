// Function to solve the system of linear equations and plot the lines
function solveAndPlot() {
    // Get user input
    const a11 = parseFloat(document.getElementById('a11').value);
    const a12 = parseFloat(document.getElementById('a12').value);
    const a21 = parseFloat(document.getElementById('a21').value);
    const a22 = parseFloat(document.getElementById('a22').value);
    const b1 = parseFloat(document.getElementById('b1').value);
    const b2 = parseFloat(document.getElementById('b2').value);

    // Create the matrix A and vector b
    const A = [[a11, a12], [a21, a22]];
    const b = [b1, b2];

    // Calculate intersection point (x1, x2) using Cramer's Rule
    const detA = a11 * a22 - a12 * a21;
    if (detA === 0) {
        alert("The matrix A is singular, the system has no unique solution.");
        return;
    }
    const x1 = (b1 * a22 - b2 * a12) / detA;
    const x2 = (a11 * b2 - a21 * b1) / detA;

    // Define the lines corresponding to the equations
    const line1 = (x) => (b1 - a11 * x) / a12;
    const line2 = (x) => (b2 - a21 * x) / a22;

    // Generate data points for the lines
    const xValues = [-10, 10];
    const line1Points = xValues.map(x => line1(x));
    const line2Points = xValues.map(x => line2(x));

    // Create the chart using Chart.js
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [
                {
                    label: 'Line 1',
                    data: line1Points,
                    borderColor: 'blue',
                    fill: false,
                },
                {
                    label: 'Line 2',
                    data: line2Points,
                    borderColor: 'green',
                    fill: false,
                },
                {
                    label: 'Intersection Point',
                    data: [{ x: x1, y: x2 }],
                    borderColor: 'red',
                    backgroundColor: 'red',
                    pointRadius: 5,
                    type: 'scatter',
                },
            ],
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                },
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}