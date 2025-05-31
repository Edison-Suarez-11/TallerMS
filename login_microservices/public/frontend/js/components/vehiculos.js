const Vehiculos = {
    categorias: {
        'economico': 'Económico',
        'intermedio': 'Intermedio',
        'lujo': 'Lujo'
    },

    estados: {
        'disponible': 'Disponible',
        'alquilado': 'Alquilado',
        'mantenimiento': 'En Mantenimiento'
    },

    async cargarVehiculos() {
        try {
            const response = await fetch('/api/vehiculos');
            const vehiculos = await response.json();
            this.mostrarVehiculos(vehiculos);
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al cargar los vehículos', 'error');
        }
    },

    mostrarVehiculos(vehiculos, contenedorId = 'lista-vehiculos') {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) {
            console.error(`Contenedor con ID ${contenedorId} no encontrado.`);
            return;
        }
        contenedor.innerHTML = '';

        if (vehiculos.length === 0 && contenedorId === 'lista-vehiculos-disponibles-rango') {
            contenedor.innerHTML = '<p>No se encontraron vehículos disponibles para el rango de fechas seleccionado.</p>';
            return;
        }
         if (vehiculos.length === 0 && contenedorId === 'lista-vehiculos') {
            contenedor.innerHTML = '<p>No hay vehículos registrados actualmente.</p>';
            return;
        }

        vehiculos.forEach(vehiculo => {
            const card = document.createElement('div');
            card.className = 'vehicle-card';
            
            let infoExtraEstado = '';
            if (vehiculo.estado === 'alquilado' && vehiculo.fecha_proxima_disponibilidad) {
                infoExtraEstado = ` (Disponible el: ${vehiculo.fecha_proxima_disponibilidad})`;
            }

            card.innerHTML = `
                <div class="vehicle-details">
                    <h3 class="vehicle-title">${vehiculo.marca} ${vehiculo.modelo}</h3>
                    <div class="vehicle-info">
                        <p><strong>Año:</strong> ${vehiculo.anio}</p>
                        <p><strong>Categoría:</strong> <span class="categoria categoria-${vehiculo.categoria}">${this.categorias[vehiculo.categoria] || vehiculo.categoria}</span></p>
                        <p><strong>Estado:</strong> <span class="estado estado-${vehiculo.estado}">${this.estados[vehiculo.estado] || vehiculo.estado}</span>${infoExtraEstado}</p>
                    </div>
                    ${contenedorId === 'lista-vehiculos' ? `
                    <div class="item-actions">
                        <button class="btn btn-primary" onclick="Vehiculos.editarVehiculo(${vehiculo.id})">
                            <span>Editar</span>
                        </button>
                        <button class="btn btn-danger" onclick="Vehiculos.eliminarVehiculo(${vehiculo.id})">
                            <span>Eliminar</span>
                        </button>
                        <button class="btn btn-info" onclick="Vehiculos.verHistorialVehiculo(${vehiculo.id}, '${vehiculo.marca} ${vehiculo.modelo}')">
                            <span>Ver Historial</span>
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
            contenedor.appendChild(card);
        });
    },

    mostrarFormulario(vehiculo = null) {
        const modal = document.getElementById('modal');
        const formularioContainer = document.getElementById('formulario-container');
        
        const anioActual = new Date().getFullYear();
        
        // Define los estados disponibles para el formulario de vehículos
        const estadosFormularioVehiculo = {
            'disponible': 'Disponible',
            'mantenimiento': 'En Mantenimiento'
        };

        formularioContainer.innerHTML = `
            <h2>${vehiculo ? 'Editar' : 'Agregar'} Vehículo</h2>
            <form id="formulario-vehiculo" class="formulario">
                <div class="form-group">
                    <label for="marca">Marca</label>
                    <input type="text" id="marca" name="marca" class="form-input" required 
                           value="${vehiculo ? vehiculo.marca : ''}" maxlength="100">
                </div>
                <div class="form-group">
                    <label for="modelo">Modelo</label>
                    <input type="text" id="modelo" name="modelo" class="form-input" required 
                           value="${vehiculo ? vehiculo.modelo : ''}" maxlength="100">
                </div>
                <div class="form-group">
                    <label for="anio">Año</label>
                    <input type="number" id="anio" name="anio" class="form-input" required 
                           value="${vehiculo ? vehiculo.anio : anioActual}"
                           min="1900" max="${anioActual + 1}">
                </div>
                <div class="form-group">
                    <label for="categoria">Categoría</label>
                    <select id="categoria" name="categoria" class="form-input" required>
                        ${Object.entries(this.categorias).map(([valor, texto]) => `
                            <option value="${valor}" ${vehiculo && vehiculo.categoria === valor ? 'selected' : ''}>
                                ${texto}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="estado">Estado</label>
                    <select id="estado" name="estado" class="form-input" required>
                        ${Object.entries(estadosFormularioVehiculo).map(([valor, texto]) => `
                            <option value="${valor}" ${vehiculo && vehiculo.estado === valor ? 'selected' : (valor === 'disponible' && !vehiculo ? 'selected' : '')}>
                                ${texto}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="botones">
                    <button type="button" class="btn btn-danger" onclick="Utils.cerrarModal()">
                        <span>Cancelar</span>
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <span>Guardar</span>
                    </button>
                </div>
            </form>
        `;

        const form = document.getElementById('formulario-vehiculo');
        form.onsubmit = (e) => {
            e.preventDefault();
            if (vehiculo) {
                this.actualizarVehiculo(vehiculo.id, form);
            } else {
                this.guardarVehiculo(form);
            }
        };

        modal.style.display = 'flex';
    },

    async guardarVehiculo(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // El estado se toma directamente del formulario
            // No es necesario asegurar 'disponible' aquí

            const response = await fetch('/api/vehiculos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al guardar el vehículo');

            Utils.mostrarMensaje('Vehículo agregado exitosamente', 'exito');
            Utils.cerrarModal();
            this.cargarVehiculos();
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al guardar el vehículo', 'error');
        }
    },

    async editarVehiculo(id) {
        try {
            const response = await fetch(`/api/vehiculos/${id}`);
            const vehiculo = await response.json();
            this.mostrarFormulario(vehiculo);
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al cargar el vehículo', 'error');
        }
    },

    async actualizarVehiculo(id, form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch(`/api/vehiculos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al actualizar el vehículo');

            Utils.mostrarMensaje('Vehículo actualizado exitosamente', 'exito');
            Utils.cerrarModal();
            this.cargarVehiculos();
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al actualizar el vehículo', 'error');
        }
    },

    async eliminarVehiculo(id) {
        if (!confirm('¿Está seguro de que desea eliminar este vehículo?')) return;

        try {
            // Primero, obtener los detalles del vehículo para verificar su estado
            const vehiculoResponse = await fetch(`/api/vehiculos/${id}`);
            if (!vehiculoResponse.ok) {
                throw new Error('Error al obtener detalles del vehículo antes de eliminar.');
            }
            const vehiculo = await vehiculoResponse.json();

            if (vehiculo.estado === 'alquilado') {
                Utils.mostrarMensaje('No se puede eliminar un vehículo que está actualmente alquilado.', 'error');
                return;
            }

            const response = await fetch(`/api/vehiculos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar el vehículo');

            Utils.mostrarMensaje('Vehículo eliminado exitosamente', 'exito');
            this.cargarVehiculos();
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje(error.message || 'Error al eliminar el vehículo', 'error');
        }
    },

    async verHistorialVehiculo(vehiculoId, vehiculoNombre) {
        try {
            const response = await fetch(`/api/vehiculos/${vehiculoId}/historial`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar el historial del vehículo.');
            }
            const historial = await response.json();
            Utils.mostrarHistorialModal(`Historial de Alquileres para: ${vehiculoNombre}`, historial, 'vehiculo');
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje(error.message, 'error');
        }
    },

    async buscarVehiculosDisponiblesPorFecha(event) {
        event.preventDefault();
        const fechaInicioInput = document.getElementById('fecha_inicio_busqueda');
        const fechaFinInput = document.getElementById('fecha_fin_busqueda');
        const fechaInicio = fechaInicioInput.value;
        const fechaFin = fechaFinInput.value;

        const contenedorResultadosId = 'lista-vehiculos-disponibles-rango';
        const contenedorResultados = document.getElementById(contenedorResultadosId);

        
        const tituloResultadosPrevio = contenedorResultados.previousElementSibling;
        if (tituloResultadosPrevio && tituloResultadosPrevio.tagName === 'H4') {
            tituloResultadosPrevio.remove();
        }
        contenedorResultados.innerHTML = '<p class="text-info">Buscando vehículos disponibles...</p>';

        if (!fechaInicio || !fechaFin) {
            Utils.mostrarMensaje('Por favor, seleccione ambas fechas para la búsqueda.', 'error');
            contenedorResultados.innerHTML = '<p class="text-danger">Por favor, ingrese ambas fechas.</p>';
            return;
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fechaInicioObj = new Date(fechaInicio + 'T00:00:00');
        const fechaFinObj = new Date(fechaFin + 'T00:00:00');

        fechaInicioObj.setHours(0, 0, 0, 0);
        fechaFinObj.setHours(0, 0, 0, 0);

        console.log("[DEBUG] Fechas a comparar:", {
            hoy: hoy.toISOString(),
            fechaInicio: fechaInicioObj.toISOString(),
            fechaFin: fechaFinObj.toISOString()
        });

        if (fechaInicioObj < hoy) {
            Utils.mostrarMensaje('La fecha de inicio no puede ser anterior a hoy.', 'error');
            contenedorResultados.innerHTML = '<p class="text-danger">La fecha de inicio no puede ser anterior a hoy.</p>';
            return;
        }

        if (fechaFinObj <= fechaInicioObj) {
            Utils.mostrarMensaje('La fecha de fin debe ser posterior a la fecha de inicio.', 'error');
            contenedorResultados.innerHTML = '<p class="text-danger">La fecha de fin debe ser posterior a la fecha de inicio.</p>';
            return;
        }

        try {
            const queryParams = new URLSearchParams({
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            });

            console.log("[DEBUG] Enviando petición al backend:", {
                url: `/api/vehiculos/disponibles-en-rango?${queryParams}`,
                fechaInicio,
                fechaFin
            });

            const response = await fetch(`/api/vehiculos/disponibles-en-rango?${queryParams}`);
            console.log("[DEBUG] Respuesta del servidor:", {
                status: response.status,
                ok: response.ok
            });

            const responseText = await response.text();
            console.log("[DEBUG] Respuesta como texto:", responseText);

            let responseData;
            try {
                responseData = JSON.parse(responseText);
                console.log("[DEBUG] Respuesta parseada:", responseData);
            } catch (error) {
                console.error("[DEBUG] Error al parsear respuesta:", error);
                throw new Error("Error al procesar la respuesta del servidor");
            }

            if (!response.ok) {
                let errorMessage = 'Error al buscar vehículos disponibles.';
                if (responseData && responseData.message) {
                    errorMessage = responseData.message;
                    if (responseData.errors) {
                        const errorsArray = Object.values(responseData.errors).flat();
                        errorMessage += ": " + errorsArray.join(', ');
                    }
                }
                throw new Error(errorMessage);
            }

            const vehiculosDisponibles = responseData;
            
            const tituloPrevio = contenedorResultados.previousElementSibling;
            if (tituloPrevio && tituloPrevio.tagName === 'H4') {
                tituloPrevio.remove();
            }

            this.mostrarVehiculos(vehiculosDisponibles, contenedorResultadosId);

            if (vehiculosDisponibles.length > 0) {
                contenedorResultados.insertAdjacentHTML('beforebegin', 
                    '<h4 class="text-success">Vehículos encontrados para el rango seleccionado:</h4>');
            }

        } catch (error) {
            console.error("[DEBUG] Error en la búsqueda:", error);
            Utils.mostrarMensaje(error.message, 'error');
            contenedorResultados.innerHTML = `<p class="text-danger">${error.message}</p>`;
        }
    },

    init() {
     
        if (document.getElementById('lista-vehiculos')) {
             this.cargarVehiculos(); 
        }
       
        const btnAgregarVehiculo = document.querySelector('#vehiculos button[data-action="agregar-vehiculo"]');
        if (btnAgregarVehiculo) {
            btnAgregarVehiculo.addEventListener('click', () => this.mostrarFormulario());
        }

        const formBusqueda = document.getElementById('form-buscar-disponibles');
        if (formBusqueda) {
            formBusqueda.addEventListener('submit', this.buscarVehiculosDisponiblesPorFecha.bind(this));
        }
    }
}; 