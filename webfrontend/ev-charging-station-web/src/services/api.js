// Determine API base URL based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5296/api';

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
            console.log('API Request:', config.method || 'GET', url, config.body ? JSON.parse(config.body) : 'No body');
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', response.status, errorText);

                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }

                const errorMessage = errorData?.message || errorData?.errors || errorText || `HTTP error! status: ${response.status}`;
                throw new Error(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
            }

            // Handle no content responses
            if (response.status === 204) {
                return null;
            }

            const result = await response.json();
            console.log('API Response:', result);
            return result;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Charging Station API methods
    async getChargingStations(status = null, type = null) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (type) params.append('type', type);

        const queryString = params.toString();
        return this.request(`/chargingstations${queryString ? `?${queryString}` : ''}`);
    }

    async getChargingStationById(id) {
        return this.request(`/chargingstations/${id}`);
    }

    async getChargingStationsByOperator(operatorId) {
        return this.request(`/chargingstations/operator/${operatorId}`);
    }

    async getNearbyChargingStations(latitude, longitude, radius = 10) {
        return this.request(`/chargingstations/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
    }

    async createChargingStation(stationData) {
        return this.request('/chargingstations', {
            method: 'POST',
            body: stationData,
        });
    }

    async updateChargingStation(id, stationData) {
        await this.request(`/chargingstations/${id}`, {
            method: 'PUT',
            body: stationData,
        });
        // Return updated station
        return this.getChargingStationById(id);
    }

    async deactivateChargingStation(id) {
        return this.request(`/chargingstations/${id}/deactivate`, {
            method: 'PATCH',
        });
    }

    async activateChargingStation(id) {
        return this.request(`/chargingstations/${id}/activate`, {
            method: 'PATCH',
        });
    }

    async updateAvailableSlots(id) {
        return this.request(`/chargingstations/${id}/update-slots`, {
            method: 'PATCH',
        });
    }

    // Booking API methods (if needed for checking active bookings)
    async getBookingsByStation(stationId) {
        return this.request(`/booking/station/${stationId}`);
    }

    async getActiveBookingsByStation(stationId) {
        return this.request(`/booking/station/${stationId}/active`);
    }
}

const apiService = new ApiService();
export default apiService;