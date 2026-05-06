import api from './api';
// import { LoginCredentials, SignupData, AuthResponse, User } from '@/interfaces/auth';


export const getWeatherForLocation = async (locationId: string): Promise<any> => {
    const url = `/weather/${locationId}`;
    const response = await api.get<any>(url);
    return response.data;
};

export const getLocations = async (): Promise<any> => {
    const url = `/weather/locations`;
    const response = await api.get<any>(url);
    return response.data;
};