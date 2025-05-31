const App = {
    init() {
        this.initNavigation();
        this.initModal();
        this.initComponents();
        // Cargar sección inicial o por hash
        this.cargarSeccionDesdeHash();
    },

    initNavigation() {
        const links = document.querySelectorAll('.nav-links a');
        const sections = document.querySelectorAll('.section');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);

                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                sections.forEach(section => {
                    if (section.id === targetId) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                });
            });
        });

        window.addEventListener('hashchange', this.cargarSeccionDesdeHash.bind(this));
    },

    cargarSeccionDesdeHash() {
        let sectionId = window.location.hash.substring(1);
        if (!sectionId || !document.getElementById(sectionId)) {
            sectionId = 'vehiculos'; 
            window.location.hash = `#${sectionId}`; 
        }
        
        this.mostrarSeccion(sectionId);

        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    },

    mostrarSeccion(sectionId) {
        document.querySelectorAll('main .section').forEach(section => {
            section.classList.add('hidden');
        });

        const seccionActiva = document.getElementById(sectionId);
        if (seccionActiva) {
            seccionActiva.classList.remove('hidden');
            
            if (sectionId === 'vehiculos' && typeof Vehiculos !== 'undefined' && !Vehiculos.listaCargada) {
                
            }
            
        } else {
            console.warn(`Sección con ID '${sectionId}' no encontrada. Mostrando sección por defecto.`);
            document.getElementById('vehiculos')?.classList.remove('hidden');
            window.location.hash = '#vehiculos'; 
        }
    },
    
    initComponents() {
        if (typeof Vehiculos !== 'undefined') {
            Vehiculos.init();
            const btnAgregarVehiculo = document.querySelector('#vehiculos button[data-action="agregar-vehiculo"]');
            if (btnAgregarVehiculo) {
                btnAgregarVehiculo.addEventListener('click', () => Vehiculos.mostrarFormulario());
            }
        }

        if (typeof Clientes !== 'undefined') {
            const btnAgregarCliente = document.querySelector('#clientes button[data-action="agregar-cliente"]');
            if (btnAgregarCliente) {
                btnAgregarCliente.addEventListener('click', () => Clientes.mostrarFormulario());
            }
            Clientes.cargarClientes();
        }

        if (typeof Reservas !== 'undefined') {
            const btnAgregarReserva = document.querySelector('#reservas button[data-action="agregar-reserva"]');
            if (btnAgregarReserva) {
                btnAgregarReserva.addEventListener('click', () => Reservas.mostrarFormulario());
            }
            Reservas.cargarReservas();
        }
    },
    
    initModal() {
        const modal = document.getElementById('modal');
        const closeButton = modal.querySelector('.modal-close');

        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
                const formularioContainer = document.getElementById('formulario-container');
                if (formularioContainer) {
                    formularioContainer.innerHTML = '';
                }
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                const formularioContainer = document.getElementById('formulario-container');
                if (formularioContainer) {
                    formularioContainer.innerHTML = '';
                }
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
}); 