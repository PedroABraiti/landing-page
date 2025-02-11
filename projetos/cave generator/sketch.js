// Objeto de configuração global
const config = {
    cols: 400,
    rows: 200,
    cellSize: 4,
    whiteNeighboursCount: 4,
    blackNeighboursCount: 4,
    chanceWhite: 50
};

let grid = []; // Armazena as células
let canvas;

function setup() {
    console.log('Setup sendo executado');
    canvas = createCanvas(config.cols * config.cellSize, config.rows * config.cellSize);
    canvas.parent('sketch-holder');
    
    initializeGrid();
    draw();
    noLoop();
}

function initializeGrid() {
    console.log('Inicializando grid com configurações:', config);
    
    // Inicializa a grid com valores aleatórios
    for (let i = 0; i < config.cols; i++) {
        grid[i] = [];
        for (let j = 0; j < config.rows; j++) {
            // Se estiver na borda, a célula é preta, caso contrário, valor aleatório
            if (i === 0 || i === config.cols - 1 || j === 0 || j === config.rows - 1) {
                grid[i][j] = 0; // Preto
            } else {
                // Define o valor aleatoriamente com base na porcentagem fornecida
                grid[i][j] = random(100) < config.chanceWhite ? 255 : 0;
            }
        }
    }
}

function applyRules() {
    console.log('Aplicando regras com configurações:', config);
    
    // Ajusta as células internas de acordo com os vizinhos
    let newGrid = JSON.parse(JSON.stringify(grid));

    for (let i = 1; i < config.cols - 1; i++) {
        for (let j = 1; j < config.rows - 1; j++) {
            let whiteCount = 0;
            let blackCount = 0;

            // Checa todos os 8 vizinhos ao redor
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x !== 0 || y !== 0) {
                        // Conta a quantidade de vizinhos brancos e pretos
                        if (grid[i + x][j + y] === 255) {
                            whiteCount++;
                        } else {
                            blackCount++;
                        }
                    }
                }
            }

            // Ajusta a célula com base nas regras
            if (whiteCount > config.whiteNeighboursCount) {
                newGrid[i][j] = 255; // Torna-se branca
            } else if (blackCount > config.blackNeighboursCount) {
                newGrid[i][j] = 0; // Torna-se preta
            }
        }
    }

    grid = newGrid; // Atualiza a grid com os novos valores
}

function draw() {
    background(0);
    for (let i = 0; i < config.cols; i++) {
        for (let j = 0; j < config.rows; j++) {
            fill(grid[i][j]);
            noStroke();
            rect(i * config.cellSize, j * config.cellSize, config.cellSize, config.cellSize);
        }
    }
}

function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        applyRules();
        draw();
    }
}

window.addEventListener('message', function(event) {
    if (event.data.type === 'updateVariable') {
        const value = event.data.value;
        const numericValue = isNaN(value) ? value : Number(value);
        const varName = event.data.variable;
        
        console.log('Atualizando variável:', varName, 'de', config[varName], 'para', numericValue);
        
        // Atualiza a configuração
        config[varName] = numericValue;
        
        console.log('Configuração atual:', config);
        
        // Se a variável cellSize foi alterada, precisa recriar o canvas
        if (varName === 'cellSize') {
            console.log('Redimensionando canvas para:', config.cols * config.cellSize, 'x', config.rows * config.cellSize);
            resizeCanvas(config.cols * config.cellSize, config.rows * config.cellSize);
        }
        
        // Reinicializa e redesenha
        initializeGrid();
        draw();
    }
    else if (event.data.type === 'restart') {
        // Apenas reinicializa a grid e redesenha com os valores atuais
        console.log('Reiniciando com configuração atual:', config);
        initializeGrid();
        draw();
    }
});