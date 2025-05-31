const Reservas = {
    async cargarReservas() {
        try {
            const response = await fetch('/api/reservas');
            const reservas = await response.json();
            
           
            const reservasConDetalles = await Promise.all(reservas.map(async reserva => {
                const [clienteResponse, vehiculoResponse] = await Promise.all([
                    fetch(`/api/clientes/${reserva.cliente_id}`),
                    fetch(`/api/vehiculos/${reserva.vehiculo_id}`)
                ]);
                
                const cliente = await clienteResponse.json();
                const vehiculo = await vehiculoResponse.json();
                
                return {
                    ...reserva,
                    cliente,
                    vehiculo
                };
            }));
            
            this.mostrarReservas(reservasConDetalles);
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al cargar las reservas', 'error');
        }
    },

    mostrarReservas(reservas) {
        const contenedor = document.getElementById('lista-reservas');
        contenedor.innerHTML = '';

        reservas.forEach(reserva => {
            const reservaElement = document.createElement('div');
            reservaElement.className = 'reserva-card';
            
            let accionesReserva = `
                <button class="btn btn-primary" onclick="Reservas.editarReserva(${reserva.id})">
                    <span>Editar</span>
                </button>
                <button class="btn btn-danger" onclick="Reservas.cancelarReserva(${reserva.id})">
                    <span>Cancelar</span>
                </button>
            `;

            if (reserva.estado === 'activa') {
                accionesReserva += `
                    <button class="btn btn-success" onclick="Reservas.registrarDevolucion(${reserva.id}, ${reserva.vehiculo.id})">
                        <span>Registrar Devolución</span>
                    </button>
                `;
            }

            reservaElement.innerHTML = `
                <div class="reserva-details">
                    <h3>Reserva #${reserva.id}</h3>
                    <div class="reserva-info">
                        <p><strong>Cliente:</strong> ${reserva.cliente ? reserva.cliente.nombre : 'Cliente no encontrado'}</p>
                        <p><strong>Vehículo:</strong> ${reserva.vehiculo ? `${reserva.vehiculo.marca} ${reserva.vehiculo.modelo}` : 'Vehículo no encontrado'}</p>
                        <p><strong>Fecha Inicio:</strong> ${new Date(reserva.fecha_inicio).toLocaleDateString('es-ES')}</p>
                        <p><strong>Fecha Fin:</strong> ${new Date(reserva.fecha_fin).toLocaleDateString('es-ES')}</p>
                        <p><strong>Estado:</strong> <span class="estado estado-${reserva.estado}">${this.formatearEstado(reserva.estado)}</span></p>
                    </div>
                    <div class="reserva-actions">
                        ${accionesReserva}
                    </div>
                </div>
            `;
            contenedor.appendChild(reservaElement);
        });
    },

    formatearEstado(estado) {
        const estados = {
            'activa': 'Activa',
            'completada': 'Completada',
            'cancelada': 'Cancelada'
        };
        return estados[estado] || estado;
    },

    async mostrarFormulario(reserva = null) {
        try {
            const [clientesResponse, todosVehiculosResponse] = await Promise.all([
                fetch('/api/clientes'),
                fetch('/api/vehiculos') 
            ]);
            
            const clientes = await clientesResponse.json();
            const todosVehiculos = await todosVehiculosResponse.json();

           
            const vehiculosParaSelector = todosVehiculos; 

            const modal = document.getElementById('modal');
            const formularioContainer = document.getElementById('formulario-container');
            
            formularioContainer.innerHTML = `
                <h2>${reserva ? 'Editar' : 'Nueva'} Reserva</h2>
                <form id="formulario-reserva" class="formulario">
                    <div class="form-group">
                        <label for="cliente_id">Cliente</label>
                        <select id="cliente_id" name="cliente_id" class="form-input" required>
                            <option value="">Seleccione un cliente</option>
                            ${clientes.map(cliente => `
                                <option value="${cliente.id}" ${reserva && reserva.cliente_id === cliente.id ? 'selected' : ''}>
                                    ${cliente.nombre}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="vehiculo_id">Vehículo</label>
                        <select id="vehiculo_id" name="vehiculo_id" class="form-input" required>
                            <option value="">Seleccione un vehículo</option>
                            ${vehiculosParaSelector.map(vehiculo => `
                                <option value="${vehiculo.id}" ${reserva && reserva.vehiculo_id === vehiculo.id ? 'selected' : ''}>
                                    ${vehiculo.marca} ${vehiculo.modelo} (${Vehiculos.categorias[vehiculo.categoria] || vehiculo.categoria}) - ${Vehiculos.estados[vehiculo.estado] || vehiculo.estado}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="fecha_inicio">Fecha de Inicio</label>
                        <input type="date" id="fecha_inicio" name="fecha_inicio" class="form-input" required
                               min="${new Date().toISOString().split('T')[0]}"
                               value="${reserva ? reserva.fecha_inicio : new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="fecha_fin">Fecha de Fin</label>
                        <input type="date" id="fecha_fin" name="fecha_fin" class="form-input" required
                               min="${new Date().toISOString().split('T')[0]}"
                               value="${reserva ? reserva.fecha_fin : ''}">
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

            const form = document.getElementById('formulario-reserva');
            form.onsubmit = async (e) => {
                e.preventDefault();
                
                const vehiculoIdSeleccionado = form.vehiculo_id.value;
                const vehiculoSeleccionado = todosVehiculos.find(v => v.id == vehiculoIdSeleccionado);

                if (vehiculoSeleccionado && vehiculoSeleccionado.estado === 'mantenimiento') {
                    Utils.mostrarMensaje('El vehículo seleccionado está en mantenimiento y no se puede reservar.', 'error');
                    return;
                }
                
                if (reserva) {
                    this.actualizarReserva(reserva.id, form);
                } else {
                    this.guardarReserva(form);
                }
            };

            modal.style.display = 'flex';
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al cargar los datos del formulario', 'error');
        }
    },

    async guardarReserva(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            const reservaResponse = await fetch('/api/reservas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!reservaResponse.ok) throw new Error('Error al crear la reserva');

            const vehiculoResponse = await fetch(`/api/vehiculos/${data.vehiculo_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: 'alquilado' })
            });

            if (!vehiculoResponse.ok) throw new Error('Error al actualizar el estado del vehículo');

            Utils.mostrarMensaje('Reserva creada exitosamente', 'exito');
            Utils.cerrarModal();
            this.cargarReservas();
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al guardar la reserva', 'error');
        }
    },

    async editarReserva(id) {
        try {
            const response = await fetch(`/api/reservas/${id}`);
            const reserva = await response.json();
            this.mostrarFormulario(reserva);
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al cargar la reserva', 'error');
        }
    },

    async actualizarReserva(id, form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch(`/api/reservas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al actualizar la reserva');

            Utils.mostrarMensaje('Reserva actualizada exitosamente', 'exito');
            Utils.cerrarModal();
            this.cargarReservas();
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al actualizar la reserva', 'error');
        }
    },

    async cancelarReserva(id) {
        if (!confirm('¿Está seguro de que desea cancelar esta reserva?')) return;

        try {
            const reservaResponse = await fetch(`/api/reservas/${id}`);
            const reserva = await reservaResponse.json();

            // Primero actualizamos el estado del vehículo
            const vehiculoResponse = await fetch(`/api/vehiculos/${reserva.vehiculo_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: 'disponible' })
            });

            if (!vehiculoResponse.ok) {
                const errorData = await vehiculoResponse.json();
                throw new Error(errorData.message || 'Error al actualizar el estado del vehículo');
            }

            // Luego cancelamos la reserva
            const cancelarResponse = await fetch(`/api/reservas/${id}`, {
                method: 'DELETE'
            });

            if (!cancelarResponse.ok) {
                const errorData = await cancelarResponse.json();
                throw new Error(errorData.message || 'Error al cancelar la reserva');
            }

            Utils.mostrarMensaje('Reserva cancelada exitosamente', 'exito');
            
            // Actualizamos tanto la lista de reservas como la de vehículos
            await this.cargarReservas();
            if (typeof Vehiculos !== 'undefined' && Vehiculos.cargarVehiculos) {
                await Vehiculos.cargarVehiculos();
            }
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje(error.message || 'Error al cancelar la reserva', 'error');
        }
    },

    async registrarDevolucion(reservaId, vehiculoId) {
        if (!confirm('¿Está seguro de que desea registrar la devolución de este vehículo?')) return;

        try {
            
            const vehiculoUpdateResponse = await fetch(`/api/vehiculos/${vehiculoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: 'disponible' })
            });

            if (!vehiculoUpdateResponse.ok) {
                const errorData = await vehiculoUpdateResponse.json();
                throw new Error(errorData.message || 'Error al actualizar el estado del vehículo.');
            }

          
            const reservaUpdateResponse = await fetch(`/api/reservas/${reservaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: 'completada' })
            });

            if (!reservaUpdateResponse.ok) {
                const errorData = await reservaUpdateResponse.json();
                throw new Error(errorData.message || 'Error al actualizar el estado de la reserva.');
            }

            Utils.mostrarMensaje('Devolución registrada exitosamente. El vehículo está disponible.', 'exito');
            
            // Actualizamos tanto la lista de reservas como la de vehículos
            await this.cargarReservas();
            if (typeof Vehiculos !== 'undefined' && Vehiculos.cargarVehiculos) {
                await Vehiculos.cargarVehiculos();
            }

        } catch (error) {
            console.error('Error al registrar la devolución:', error);
            Utils.mostrarMensaje(error.message || 'Error al registrar la devolución.', 'error');
        }
    }
}; 