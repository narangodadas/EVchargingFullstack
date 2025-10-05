const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your actual API URL

class ApiService {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Charging Station API methods
    async getChargingStations() {
        return this.request('/charging-stations');
    }

    async getChargingStationById(id) {
        return this.request(`/charging-stations/${id}`);
    }

    async createChargingStation(stationData) {
        return this.request('/charging-stations', {
            method: 'POST',
            body: stationData,
        });
    }

    async updateChargingStation(id, stationData) {
        return this.request(`/charging-stations/${id}`, {
            method: 'PUT',
            body: stationData,
        });
    }

    async deactivateChargingStation(id) {
        return this.request(`/charging-stations/${id}/deactivate`, {
            method: 'PATCH',
        });
    }

    async activateChargingStation(id) {
        return this.request(`/charging-stations/${id}/activate`, {
            method: 'PATCH',
        });
    }

    async checkActiveBookings(stationId) {
        return this.request(`/charging-stations/${stationId}/active-bookings`);
    }
}

export default new ApiService();