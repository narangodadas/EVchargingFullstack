// Determine API base URL based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5296';

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
        return this.request(`/api/chargingstations${queryString ? `?${queryString}` : ''}`);
    }

    async getChargingStationById(id) {
        return this.request(`/api/chargingstations/${id}`);
    }

    // This method is no longer needed as operators see all stations
    // async getChargingStationsByOperator(operatorId) {
    //     return this.getChargingStations();
    // }

    async getNearbyChargingStations(latitude, longitude, radius = 10) {
        return this.request(`/api/chargingstations/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
    }

    async createChargingStation(stationData) {
        return this.request('/api/chargingstations', {
            method: 'POST',
            body: stationData,
        });
    }

    async updateChargingStation(id, stationData) {
        await this.request(`/api/chargingstations/${id}`, {
            method: 'PUT',
            body: stationData,
        });
        // Return updated station
        return this.getChargingStationById(id);
    }

    async deactivateChargingStation(id) {
        return this.request(`/api/chargingstations/${id}/deactivate`, {
            method: 'PATCH',
        });
    }

    async activateChargingStation(id) {
        return this.request(`/api/chargingstations/${id}/activate`, {
            method: 'PATCH',
        });
    }

    async updateAvailableSlots(id) {
        return this.request(`/api/chargingstations/${id}/update-slots`, {
            method: 'PATCH',
        });
    }

    async updateStationSlots(id, slotData) {
        return this.request(`/api/chargingstations/${id}/slots`, {
            method: 'PATCH',
            body: slotData,
        });
    }

    // Authentication API methods
    async login(credentials) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: credentials,
        });
    }

    // Booking API methods
    async getAllBookings() {
        return this.request('/api/bookings');
    }

    async getBookingsByStation(stationId) {
        return this.request(`/api/bookings?stationId=${stationId}`);
    }

    async getActiveBookingsByStation(stationId) {
        const bookings = await this.request(`/api/bookings?stationId=${stationId}`);
        // Filter for active bookings (not cancelled and in the future)
        const now = new Date();
        return bookings.filter(booking =>
            booking.status !== 'Cancelled' && new Date(booking.startTime) > now
        );
    }

    async getUpcomingBookingsByStation(stationId) {
        const bookings = await this.request(`/api/bookings?stationId=${stationId}`);
        const now = new Date();
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        return bookings.filter(booking => {
            const startTime = new Date(booking.startTime);
            return booking.status !== 'Cancelled' &&
                startTime > now &&
                startTime <= next24Hours;
        }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }

    // This method is no longer needed as operators see all stations
    // async getBookingsByOperator(operatorId) {
    //     // Operators now see all bookings through getAllBookings()
    //     return this.getAllBookings();
    // }
}

const apiService = new ApiService();
export default apiService;