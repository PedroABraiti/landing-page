function make2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new Array(rows);
      for (let j = 0; j < arr[i].length; j++) {
        arr[i][j] = 0;
      }
    }
    return arr;
  }
  
  let grid;
  let w = 5;
  let cols, rows;
  
  let notTangible = [0]; // if the material is not tangible
  let isLiquid = [220];
  let isStatic = [0];
  
  let size = 1;
  
  let showMenu = false; // Controle do menu
  let menuOptions = ['Start', 'Options', 'Quit']; // Opções do menu
  
  function setup() {
    createCanvas(2000, 900);
    colorMode(HSB, 360, 255, 255); // hue, saturation, brightness
    cols = width / w;
    rows = height / w;
    grid = make2DArray(cols, rows);
  }
  
  window.addEventListener('wheel', function(event) {
    if (event.deltaY > 0) {
      size -= 1; // Scroll down, decrease the variable
    } else {
      size += 1; // Scroll up, increase the variable
    }
  
    size = constrain(size, 1, 5); // Limit the value between 1 and 5
  });
  
  function mouseDragged() {
    let mouseCol = floor(mouseX / w);
    let mouseRow = floor(mouseY / w);
  
    let matrix = size;
    let extent = floor(matrix / 2);
    
    if (mouseButton === LEFT) {
      for (let i = -extent; i <= extent; i++) {
        for (let j = -extent; j <= extent; j++) {
          let col = mouseCol + i;
          let row = mouseRow + j;
          if (notTangible.includes(grid[col][row])) {
            grid[col][row] = 60 + random(-25, 0); // sand
          }
        }
      }
    } else if (mouseButton === RIGHT) {
      for (let i = -extent; i <= extent; i++) {
        for (let j = -extent; j <= extent; j++) {
          let col = mouseCol + i;
          let row = mouseRow + j;
          grid[col][row] = 0;
        }
      }
    } else {
      for (let i = -extent; i <= extent; i++) {
        for (let j = -extent; j <= extent; j++) {
          let col = mouseCol + i;
          let row = mouseRow + j;
          if (notTangible.includes(grid[col][row])) {
            grid[col][row] = 220; // water
          }
        }
      }
    } 
  }
  
  let reservedGrid = make2DArray(cols, rows);
  let fps = 200; // Desired FPS
  let isPaused = false;
  let frameTime = 1000 / fps; // Time per frame in milliseconds
  let lastFrameTime = 0;
  
  function keyPressed() {
    if (key === ' ') {
      isPaused = !isPaused; // Alterna entre pausado e não pausado
    } else if (key === 'Escape') {
      showMenu = !showMenu; // Alterna a visibilidade do menu
    }
  }
  
  function drawMenu() {
    fill(255);
    rectMode(CENTER);
    rect(width / 2, height / 2, 300, 200); // Fundo do menu
  
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text('Menu', width / 2, height / 2 - 60);
  
    textSize(24);
    for (let i = 0; i < menuOptions.length; i++) {
      text(menuOptions[i], width / 2, height / 2 - 20 + i * 40);
    }
  }
  
  function draw() {
    // Limpa o fundo a cada frame e define noStroke
    background(0);
    noStroke();
  
    if (showMenu) {
      drawMenu(); // Desenha o menu se estiver visível
      return; // Sai da função draw se o menu estiver visível
    }
  
    // Desenha o grid
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (grid[i][j] > 0) {
          fill(grid[i][j], 255, 255);
          let x = i * w;
          let y = j * w;
          square(x, y, w);
        }
      }
    }
  
    if (!isPaused) {
      // Atualiza a lógica do jogo apenas quando não está pausado
      let currentTime = millis();
      if (currentTime - lastFrameTime >= frameTime) {
        lastFrameTime = currentTime; // Atualiza o tempo do último frame
  
        let nextGrid = make2DArray(cols, rows);
        reservedGrid = make2DArray(cols, rows); // Reset reserved grid
  
        for (let j = rows - 1; j >= 0; j--) { // Percorre de baixo para cima
          for (let i = 0; i < cols; i++) {
            let state = grid[i][j];
            let below = grid[i][j + 1];
            let moveR, moveL, belowR, belowL, upperR, upperL;
            if (i > 0) {
              moveL = grid[i - 1][j];
              if (j < rows - 1) {
                belowL = grid[i - 1][j + 1];
              }
              if (j > 0) {
                upperL = grid[i - 1][j - 1];
              }
            }
            if (i < cols - 1) {
              moveR = grid[i + 1][j];
              if (j < rows - 1) {
                belowR = grid[i + 1][j + 1];
              }
              if (j > 0) {
                upperR = grid[i + 1][j - 1];
              }
            }
            // SAND
            if (state > 0 && state !== 220) { // Movimento de sólidos (areia)
              if (notTangible.includes(below) && j < rows - 1 && !reservedGrid[i][j + 1]) {
                nextGrid[i][j + 1] = grid[i][j];
                reservedGrid[i][j + 1] = true; // Reserva a célula
                grid[i][j] = 0; // Limpa a célula original imediatamente
              } else if (!notTangible.includes(moveR) && !notTangible.includes(moveL)) {
                nextGrid[i][j] = grid[i][j];
                reservedGrid[i][j] = true;
              } else if (!notTangible.includes(moveR) && notTangible.includes(belowR) && notTangible.includes(belowL)) {
                nextGrid[i - 1][j + 1] = grid[i][j];
                reservedGrid[i - 1][j + 1] = true;
                grid[i][j] = 0; // Limpa a célula original
              } else if (!notTangible.includes(moveL) && notTangible.includes(belowL) && notTangible.includes(belowR)) {
                nextGrid[i + 1][j + 1] = grid[i][j];
                reservedGrid[i + 1][j + 1] = true;
                grid[i][j] = 0; // Limpa a célula original
              } else if (notTangible.includes(belowR) && notTangible.includes(belowL)) {
                let rn = random([-1, 1]);
                if (!reservedGrid[i + rn][j + 1]) {
                  nextGrid[i + rn][j + 1] = grid[i][j];
                  reservedGrid[i + rn][j + 1] = true;
                  grid[i][j] = 0; // Limpa a célula original
                } else if (!reservedGrid[i + (rn * -1)][j + 1]) {
                  nextGrid[i + (rn * -1)][j + 1] = grid[i][j];
                  reservedGrid[i + (rn * -1)][j + 1] = true;
                  grid[i][j] = 0; // Limpa a célula original
                } else {
                  nextGrid[i][j] = grid[i][j];
                  reservedGrid[i][j] = true;
                }
              } else if (notTangible.includes(belowL) && !reservedGrid[i - 1][j + 1]) {
                nextGrid[i - 1][j + 1] = grid[i][j];
                reservedGrid[i - 1][j + 1] = true;
                grid[i][j] = 0; // Limpa a célula original
              } else if (notTangible.includes(belowR) && !reservedGrid[i + 1][j + 1]) {
                nextGrid[i + 1][j + 1] = grid[i][j];
                reservedGrid[i + 1][j + 1] = true;
                grid[i][j] = 0; // Limpa a célula original
              } else {
                nextGrid[i][j] = grid[i][j];
              }
            } 
            // LIQUID
            else if (isLiquid.includes(state)) { // Movimento de líquidos (água)
              if (notTangible.includes(below) && j < rows - 1 && !reservedGrid[i][j + 1]) {
                nextGrid[i][j + 1] = grid[i][j];
                reservedGrid[i][j + 1] = true;
              } else if (!notTangible.includes(moveR) && !notTangible.includes(moveL)) {
                nextGrid[i][j] = grid[i][j];
              } else if (!notTangible.includes(moveR) && notTangible.includes(belowR) && notTangible.includes(belowL)) {
                nextGrid[i - 1][j + 1] = grid[i][j];
                reservedGrid[i - 1][j + 1] = true;
              } else if (!notTangible.includes(moveL) && notTangible.includes(belowL) && notTangible.includes(belowR)) {
                nextGrid[i + 1][j + 1] = grid[i][j];
                reservedGrid[i + 1][j + 1] = true;
              } else if (notTangible.includes(belowR) && notTangible.includes(belowL)) {
                let rn = random([-1, 1]);
                if (!reservedGrid[i + rn][j + 1]) {
                  nextGrid[i + rn][j + 1] = grid[i][j];
                  reservedGrid[i + rn][j + 1] = true;
                } else if (!reservedGrid[i + (rn * -1)][j + 1]) {
                  nextGrid[i + (rn * -1)][j + 1] = grid[i][j];
                  reservedGrid[i + (rn * -1)][j + 1] = true;
                } else {
                  nextGrid[i][j] = grid[i][j];
                }
              } else if (notTangible.includes(belowR) && !reservedGrid[i + 1][j + 1]) {
                nextGrid[i + 1][j + 1] = grid[i][j];
                reservedGrid[i + 1][j + 1] = true;
              } else if (notTangible.includes(belowL) && !reservedGrid[i - 1][j + 1]) {
                nextGrid[i - 1][j + 1] = grid[i][j];
                reservedGrid[i - 1][j + 1] = true;
              } else if (!notTangible.includes(upperR) && !notTangible.includes(upperL)) {
                nextGrid[i][j] = grid[i][j];
              } else if (notTangible.includes(moveR) && notTangible.includes(moveL)) {
                let rn = random([-1, 1]);
                if (!reservedGrid[i + rn][j]) {
                  nextGrid[i + rn][j] = grid[i][j];
                  reservedGrid[i + rn][j] = true;
                } else {
                  nextGrid[i][j] = grid[i][j];
                }
              } else if (notTangible.includes(moveR) && !reservedGrid[i + 1][j] && isStatic.includes(upperR)) {
                nextGrid[i + 1][j] = grid[i][j];
                reservedGrid[i + 1][j] = true;
              } else if (notTangible.includes(moveL) && !reservedGrid[i - 1][j] && isStatic.includes(upperL)) {
                nextGrid[i - 1][j] = grid[i][j];
                reservedGrid[i - 1][j] = true;
              } else {
                nextGrid[i][j] = grid[i][j];
              }
            }
          }
        }
        grid = nextGrid; // Atualiza o grid
      }
    }
  }
  