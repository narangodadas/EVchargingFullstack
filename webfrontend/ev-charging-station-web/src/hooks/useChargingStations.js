import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useChargingStations = (filters = {}) => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStations = async (status = null, type = null) => {
        try {
            setLoading(true);
            const data = await apiService.getChargingStations(status, type);
            setStations(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch charging stations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStationById = useCallback(async (id) => {
        try {
            const station = await apiService.getChargingStationById(id);
            return station;
        } catch (err) {
            setError(err.message || 'Failed to fetch charging station');
            throw err;
        }
    }, []);

    const fetchStationsByOperator = async (operatorId) => {
        try {
            setLoading(true);
            const data = await apiService.getChargingStationsByOperator(operatorId);
            setStations(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch stations for operator');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    const createStation = async (stationData) => {
        try {
            const newStation = await apiService.createChargingStation(stationData);
            setStations(prev => [...prev, newStation]);
            return newStation;
        } catch (err) {
            const errorMessage = err.message || 'Failed to create charging station';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const updateStation = async (id, stationData) => {
        try {
            const updatedStation = await apiService.updateChargingStation(id, stationData);
            // Refetch the updated station or update the local state
            if (updatedStation) {
                setStations(prev => prev.map(station =>
                    station.id === id ? updatedStation : station
                ));
            } else {
                // Refresh the stations list if the API doesn't return the updated station
                await fetchStations();
            }
            return updatedStation;
        } catch (err) {
            const errorMessage = err.message || 'Failed to update charging station';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const deactivateStation = async (id) => {
        try {
            await apiService.deactivateChargingStation(id);
            setStations(prev => prev.map(station =>
                station.id === id ? { ...station, status: 1 } : station // 1 = Inactive
            ));
        } catch (err) {
            const errorMessage = err.message || 'Failed to deactivate charging station';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const activateStation = async (id) => {
        try {
            await apiService.activateChargingStation(id);
            setStations(prev => prev.map(station =>
                station.id === id ? { ...station, status: 0 } : station // 0 = Active
            ));
        } catch (err) {
            const errorMessage = err.message || 'Failed to activate charging station';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const updateAvailableSlots = async (id) => {
        try {
            await apiService.updateAvailableSlots(id);
            // Refresh the station data after updating slots
            const updatedStation = await apiService.getChargingStationById(id);
            setStations(prev => prev.map(station =>
                station.id === id ? updatedStation : station
            ));
        } catch (err) {
            const errorMessage = err.message || 'Failed to update available slots';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    return {
        stations,
        loading,
        error,
        fetchStations,
        fetchStationById,
        fetchStationsByOperator,
        createStation,
        updateStation,
        deactivateStation,
        activateStation,
        updateAvailableSlots,
        setError, // Allow manual error clearing
    };
};