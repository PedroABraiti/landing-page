async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        const projects = await response.json();
        
        Object.keys(projects).forEach(category => {
            const container = document.getElementById(category);
            container.innerHTML = '';
            
            projects[category].forEach(project => {
                const projectCard = createProjectCard(project);
                container.appendChild(projectCard);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    let projectContent = '';
    if (project.tipo === 'pagina') {
        const controls = project.variaveis ? createVariableControls(project) : '';
        
        projectContent = `
            <div class="project-content">
                <h3>${project.titulo}</h3>
                <p>${project.descricao}</p>
                <div class="tech-stack">
                    ${project.tecnologias.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-frame" style="display: none;">
                    <iframe
                        id="frame-${project.id}"
                        src="${project.url}"
                        width="${project.tamanho?.width || 800}"
                        height="${project.tamanho?.height || 600}"
                        style="border: 1px solid var(--matrix-color); border-radius: 8px;"
                    ></iframe>
                    
                    ${controls ? `
                    <div class="variable-controls" style="margin-top: 1rem; padding: 1rem; background: rgba(0, 0, 0, 0.2); border-radius: 8px;">
                        <h4 style="color: var(--matrix-color); margin-bottom: 1rem;">Controles</h4>
                        ${controls}
                    </div>
                    ` : ''}
                </div>
                <div class="project-controls">
                    <button class="btn toggle-project" onclick="toggleProject('${project.id}')">
                        <i class="fas fa-play"></i> See Project
                    </button>
                    <button class="btn restart-project" onclick="restartProject('${project.id}')" style="display: none;">
                        <i class="fas fa-redo"></i> Reiniciar
                    </button>
                </div>
            </div>
        `;
    } else {
        projectContent = `
            ${project.imagem ? `
                <div class="project-image">
                    <img src="${project.imagem}" alt="${project.titulo}" 
                        style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px 8px 0 0;">
                </div>
            ` : ''}
            <div class="project-content" style="padding: 1.5rem;">
                <h3>${project.titulo}</h3>
                <p>${project.descricao}</p>
                <div class="tech-stack">
                    ${project.tecnologias.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <a href="${project.link}" class="btn" target="_blank">Visit project</a>
            </div>
        `;
    }
    
    card.innerHTML = projectContent;
    return card;
}

function createVariableControls(project) {
    return project.variaveis.map(variavel => `
        <div class="control-group" style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-color);">
                ${variavel.label}
            </label>
            <input 
                type="${variavel.tipo}"
                value="${variavel.valorInicial}"
                min="${variavel.min}"
                max="${variavel.max}"
                ${variavel.step ? `step="${variavel.step}"` : ''}
                onchange="updateProjectVariable('${project.id}', '${variavel.nome}', this.value)"
                style="background: rgba(0, 255, 149, 0.1); 
                       border: 1px solid var(--matrix-color);
                       color: var(--text-color);
                       padding: 0.5rem;
                       border-radius: 4px;
                       width: 100%;"
            />
            ${variavel.tipo === 'range' ? `
                <div class="value-display" style="text-align: right; font-size: 0.8rem; color: var(--text-color);">
                    Valor: ${variavel.valorInicial}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Função para atualizar variáveis do projeto
window.updateProjectVariable = function(projectId, variableName, value) {
    const frame = document.querySelector(`#frame-${projectId}`);
    if (frame) {
        // Envia mensagem para o iframe com a nova variável
        frame.contentWindow.postMessage({
            type: 'updateVariable',
            variable: variableName,
            value: value
        }, '*');
        
        // Atualiza o display do valor se for um range
        const input = event.target;
        if (input.type === 'range') {
            const displayDiv = input.nextElementSibling;
            if (displayDiv) {
                displayDiv.textContent = `Valor: ${value}`;
            }
        }
    }
}

// Funções existentes...
window.toggleProject = function(projectId) {
    const frame = document.querySelector(`#frame-${projectId}`).parentElement;
    const button = frame.nextElementSibling.querySelector('.toggle-project');
    const restartButton = frame.nextElementSibling.querySelector('.restart-project');
    
    if (frame.style.display === 'none') {
        frame.style.display = 'block';
        button.innerHTML = '<i class="fas fa-stop"></i> Hide project';
        restartButton.style.display = 'inline-block';
    } else {
        frame.style.display = 'none';
        button.innerHTML = '<i class="fas fa-play"></i> Visit Project';
        restartButton.style.display = 'none';
    }
}

window.restartProject = function(projectId) {
    const frame = document.querySelector(`#frame-${projectId}`);
    if (frame) {
        // Enviar apenas uma mensagem para reiniciar
        // Vamos escolher apenas uma variável para atualizar,
        // o que deve ser suficiente para disparar a reinicialização
        frame.contentWindow.postMessage({
            type: 'updateVariable',
            variable: 'chanceWhite',
            value: '50'
        }, '*');
    }
}

document.addEventListener('DOMContentLoaded', loadProjects);