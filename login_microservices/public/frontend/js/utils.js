const Utils = {
    formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES');
    },

    mostrarMensaje(mensaje, tipo = 'info') {
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
        alert(`${tipo.toUpperCase()}: ${mensaje}`);
    },

    mostrarModal() {
        document.getElementById('modal').style.display = 'block';
    },

    cerrarModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
            const formularioContainer = document.getElementById('formulario-container');
            if (formularioContainer) {
                formularioContainer.innerHTML = '';
            }
        }
    },

    cambiarSeccion(seccionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(seccionId).classList.remove('hidden');
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === seccionId) {
                link.classList.add('active');
            }
        });
    },

    async cargarPlantilla(nombre) {
        try {
            const response = await fetch(`templates/${nombre}.html`);
            if (!response.ok) throw new Error('Error al cargar la plantilla');
            return await response.text();
        } catch (error) {
            console.error('Error:', error);
            return '';
        }
    },

    generarFormulario(campos) {
        return `
            <form class="formulario">
                ${campos.map(campo => `
                    <div class="campo">
                        <label for="${campo.id}">${campo.label}</label>
                        ${this.generarInput(campo)}
                    </div>
                `).join('')}
                <div class="botones">
                    <button type="button" class="btn btn-cancelar" onclick="Utils.cerrarModal()">Cancelar</button>
                    <button type="submit" class="btn btn-guardar">Guardar</button>
                </div>
            </form>
        `;
    },

    generarInput(campo) {
        if (campo.tipo === 'select') {
            return `
                <select id="${campo.id}" name="${campo.id}" ${campo.required ? 'required' : ''}>
                    ${campo.opciones.map(opcion => 
                        `<option value="${opcion.valor}">${opcion.texto}</option>`
                    ).join('')}
                </select>
            `;
        }
        return `
            <input 
                type="${campo.tipo || 'text'}" 
                id="${campo.id}" 
                name="${campo.id}"
                ${campo.required ? 'required' : ''}
                ${campo.min ? `min="${campo.min}"` : ''}
                ${campo.max ? `max="${campo.max}"` : ''}
            >
        `;
    },

    mostrarHistorialModal(titulo, historial, tipoHistorial) {
        const modal = document.getElementById('modal');
        const formularioContainer = document.getElementById('formulario-container');

        let contenidoHtml = `<h2 class="modal-title">${titulo}</h2>`;

        if (!historial || historial.length === 0) {
            contenidoHtml += '<p>No hay registros de historial disponibles.</p>';
        } else {
            contenidoHtml += '<ul class="historial-lista">';
            historial.forEach(reserva => {
                contenidoHtml += '<li class="historial-item">';
                if (tipoHistorial === 'vehiculo' && reserva.cliente) {
                    contenidoHtml += `<p><strong>Cliente:</strong> ${reserva.cliente.nombre} (${reserva.cliente.correo || 'N/A'})</p>`;
                } else if (tipoHistorial === 'cliente' && reserva.vehiculo) {
                    contenidoHtml += `<p><strong>Vehículo:</strong> ${reserva.vehiculo.marca} ${reserva.vehiculo.modelo} (${reserva.vehiculo.anio})</p>`;
                }
                contenidoHtml += `<p><strong>Fecha Inicio:</strong> ${new Date(reserva.fecha_inicio).toLocaleDateString('es-ES')}</p>`;
                contenidoHtml += `<p><strong>Fecha Fin:</strong> ${new Date(reserva.fecha_fin).toLocaleDateString('es-ES')}</p>`;
                contenidoHtml += `<p><strong>Estado:</strong> <span class="estado estado-${reserva.estado}">${Reservas.formatearEstado ? Reservas.formatearEstado(reserva.estado) : reserva.estado}</span></p>`;
                contenidoHtml += '</li>';
            });
            contenidoHtml += '</ul>';
        }

        formularioContainer.innerHTML = contenidoHtml;
        modal.style.display = 'flex';
    }
}; 