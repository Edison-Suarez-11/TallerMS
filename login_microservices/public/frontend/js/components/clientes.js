const Clientes = {
    async cargarClientes() {
        try {
            const response = await fetch('/api/clientes');
            const clientes = await response.json();
            this.mostrarClientes(clientes);
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al cargar los clientes', 'error');
        }
    },

    mostrarClientes(clientes) {
        const contenedor = document.getElementById('lista-clientes');
        contenedor.innerHTML = '';

        clientes.forEach(cliente => {
            const clienteElement = document.createElement('div');
            clienteElement.className = 'client-item';
            clienteElement.innerHTML = `
                <div class="client-info">
                    <h3 class="client-name">${cliente.nombre}</h3>
                    <div class="client-details">
                        <p><span class="label">Teléfono:</span> ${cliente.telefono || 'N/A'}</p>
                        <p><span class="label">Correo:</span> ${cliente.correo || 'N/A'}</p>
                        <p><span class="label">Licencia:</span> ${cliente.numero_licencia || 'N/A'}</p>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary" onclick="Clientes.editarCliente(${cliente.id})">
                        <span>Editar</span>
                    </button>
                    <button class="btn btn-danger" onclick="Clientes.eliminarCliente(${cliente.id})">
                        <span>Eliminar</span>
                    </button>
                    <button class="btn btn-info" onclick="Clientes.verHistorialCliente(${cliente.id}, '${cliente.nombre}')">
                        <span>Ver Historial</span>
                    </button>
                </div>
            `;
            contenedor.appendChild(clienteElement);
        });
    },

    mostrarFormulario(cliente = null) {
        const modal = document.getElementById('modal');
        const formularioContainer = document.getElementById('formulario-container');
        
        formularioContainer.innerHTML = `
            <h2>${cliente ? 'Editar' : 'Registrar'} Cliente</h2>
            <form id="formulario-cliente" class="formulario">
                <div class="form-group">
                    <label for="nombre">Nombre Completo</label>
                    <input type="text" id="nombre" name="nombre" class="form-input" required 
                           value="${cliente ? cliente.nombre : ''}" maxlength="150">
                </div>
                <div class="form-group">
                    <label for="telefono">Teléfono</label>
                    <input type="tel" id="telefono" name="telefono" class="form-input"
                           value="${cliente ? cliente.telefono : ''}" maxlength="50">
                </div>
                <div class="form-group">
                    <label for="correo">Correo Electrónico</label>
                    <input type="email" id="correo" name="correo" class="form-input"
                           value="${cliente ? cliente.correo : ''}" maxlength="100">
                </div>
                <div class="form-group">
                    <label for="numero_licencia">Número de Licencia</label>
                    <input type="text" id="numero_licencia" name="numero_licencia" class="form-input" required
                           value="${cliente ? cliente.numero_licencia : ''}" maxlength="50">
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

        const form = document.getElementById('formulario-cliente');
        form.onsubmit = (e) => {
            e.preventDefault();
            if (cliente) {
                this.actualizarCliente(cliente.id, form);
            } else {
                this.guardarCliente(form);
            }
        };

        modal.style.display = 'flex';
    },

    async guardarCliente(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (!response.ok) {
                let errorMessage = 'Error al guardar el cliente';
                if (responseData.message) {
                    errorMessage = responseData.message;
                    if (responseData.errors) {
                        const errorsArray = Object.values(responseData.errors).flat();
                        errorMessage += ": " + errorsArray.join(', ');
                    }
                }
                throw new Error(errorMessage);
            }

            Utils.mostrarMensaje('Cliente registrado exitosamente', 'exito');
            Utils.cerrarModal();
            this.cargarClientes();
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje(error.message, 'error');
        }
    },

    async editarCliente(id) {
        try {
            const response = await fetch(`/api/clientes/${id}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar el cliente');
            }
            const cliente = await response.json();
            this.mostrarFormulario(cliente);
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje(error.message, 'error');
        }
    },

    async actualizarCliente(id, form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch(`/api/clientes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (!response.ok) {
                let errorMessage = 'Error al actualizar el cliente';
                if (responseData.message) {
                    errorMessage = responseData.message;
                    if (responseData.errors) {
                        const errorsArray = Object.values(responseData.errors).flat();
                        errorMessage += ": " + errorsArray.join(', ');
                    }
                }
                throw new Error(errorMessage);
            }

            Utils.mostrarMensaje('Cliente actualizado exitosamente', 'exito');
            Utils.cerrarModal();
            this.cargarClientes();
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje(error.message, 'error');
        }
    },

    async eliminarCliente(id) {
        if (!confirm('¿Está seguro de que desea eliminar este cliente?')) return;

        try {
            const response = await fetch(`/api/clientes/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar el cliente');

            Utils.mostrarMensaje('Cliente eliminado exitosamente', 'exito');
            this.cargarClientes();
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje('Error al eliminar el cliente', 'error');
        }
    },

    async verHistorialCliente(clienteId, clienteNombre) {
        try {
            const response = await fetch(`/api/clientes/${clienteId}/historial`); 
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar el historial del cliente.');
            }
            const historial = await response.json();
            Utils.mostrarHistorialModal(`Historial de Alquileres para: ${clienteNombre}`, historial, 'cliente');
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarMensaje(error.message, 'error');
        }
    }
}; 