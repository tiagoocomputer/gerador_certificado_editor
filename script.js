let participants = [];

function addParticipants() {
    const textArea = document.getElementById('participantName');
    const names = textArea.value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    if (names.length === 0) {
        alert('Por favor, digite pelo menos um nome');
        return;
    }

    let duplicates = [];
    let added = 0;

    names.forEach(name => {
        if (!participants.includes(name)) {
            participants.push(name);
            added++;
        } else {
            duplicates.push(name);
        }
    });

    if (duplicates.length > 0) {
        alert(`Os seguintes nomes já estavam na lista:\n${duplicates.join('\n')}`);
    }

    if (added > 0) {
        updateParticipantsList();
        textArea.value = '';
        document.getElementById('generateAllBtn').style.display = 'inline-block';
        alert(`${added} nome(s) adicionado(s) com sucesso!`);
    }
}

function updateParticipantsList() {
    const namesList = document.getElementById('namesList');
    namesList.innerHTML = '';
    
    participants.forEach((name, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="participant-name">${name}</span>
            <div class="button-group">
                <button class="edit-btn" onclick="editParticipant(${index})">Editar</button>
                <button class="delete-btn" onclick="removeParticipant(${index})">Remover</button>
            </div>
        `;
        namesList.appendChild(li);
    });
}

function editParticipant(index) {
    const newName = prompt('Digite o novo nome:', participants[index]);
    if (newName !== null && newName.trim() !== '') {
        const trimmedName = newName.trim();
        if (participants.includes(trimmedName) && participants.indexOf(trimmedName) !== index) {
            alert('Este nome já existe na lista!');
            return;
        }
        participants[index] = trimmedName;
        updateParticipantsList();
    }
}

function removeParticipant(index) {
    participants.splice(index, 1);
    updateParticipantsList();
    if (participants.length === 0) {
        document.getElementById('generateAllBtn').style.display = 'none';
    }
}

async function generateAllCertificates() {
    if (participants.length === 0) {
        alert('Adicione pelo menos um participante');
        return;
    }

    const element = document.getElementById('certificate');
    const customText = document.getElementById('customText').value.trim();
    const pdf = new jspdf.jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    try {
        for (let i = 0; i < participants.length; i++) {
            // Atualiza o nome no certificado
            document.getElementById('participantText').textContent = participants[i];
            
            // Pega o texto personalizado
            let customText = document.getElementById('customText').value;
            
            // Aplica negrito nas frases específicas
            customText = customText.replace(
                'Educação Inclusiva',
                '<strong>Educação Inclusiva</strong>'
            ).replace(
                'TEA, TDAH, TOD e Síndrome de Down',
                '<strong>TEA, TDAH, TOD e Síndrome de Down</strong>'
            );
            
            // Atualiza o texto personalizado
            document.getElementById('certificateCustomText').innerHTML = customText;

            // Converte o certificado atual para imagem
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // Adiciona uma nova página para cada certificado (exceto o primeiro)
            if (i > 0) {
                pdf.addPage();
            }

            // Adiciona a imagem do certificado à página
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }

        // Salva todos os certificados em um único PDF
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        pdf.save(`certificados_${timestamp}.pdf`);
        alert('Certificados gerados com sucesso!');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar os certificados. Por favor, tente novamente.');
    }
} 