import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useChargingStations = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStations = async () => {
        try {
            setLoading(true);
            const data = await apiService.getChargingStations();
            setStations(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch charging stations');
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
            setError('Failed to create charging station');
            throw err;
        }
    };

    const updateStation = async (id, stationData) => {
        try {
            const updatedStation = await apiService.updateChargingStation(id, stationData);
            setStations(prev => prev.map(station =>
                station.id === id ? updatedStation : station
            ));
            return updatedStation;
        } catch (err) {
            setError('Failed to update charging station');
            throw err;
        }
    };

    const deactivateStation = async (id) => {
        try {
            await apiService.deactivateChargingStation(id);
            setStations(prev => prev.map(station =>
                station.id === id ? { ...station, isActive: false } : station
            ));
        } catch (err) {
            setError('Failed to deactivate charging station');
            throw err;
        }
    };

    const activateStation = async (id) => {
        try {
            await apiService.activateChargingStation(id);
            setStations(prev => prev.map(station =>
                station.id === id ? { ...station, isActive: true } : station
            ));
        } catch (err) {
            setError('Failed to activate charging station');
            throw err;
        }
    };

    return {
        stations,
        loading,
        error,
        fetchStations,
        createStation,
        updateStation,
        deactivateStation,
        activateStation,
    };
};