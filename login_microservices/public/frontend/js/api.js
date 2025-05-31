const API = {
    async get(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`);
            if (!response.ok) throw new Error('Error en la petición');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error en la petición');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error en la petición');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error en la petición');
            return true;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}; 