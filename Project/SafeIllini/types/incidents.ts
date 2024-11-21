export type IncidentType = 'harassment' | 'sexual_harassment' | 'drunk_driving' | 'assault' | 'theft' | 'high_noise' | 'other';
export type SeverityLevel = 'low' | 'medium' | 'high';

/**
* @typedef {Object} Incident
* @property {string} id - The unique identifier for the incident.
* @property {string} type - The type of the incident.
* @property {string} severity - The severity level of the incident.
* @property {string} description - A description of the incident.
* @property {Object} location - The location of the incident.
* @property {number} location.latitude - The latitude of the incident location.
* @property {number} location.longitude - The longitude of the incident location.
* @property {number} timestamp - The timestamp of when the incident occurred.
* @property {Object} [photos] - An object containing photos related to the incident.
**/
export interface Incident {
  id: string;
  type: IncidentType;
  severity: SeverityLevel;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  description?: string;
  photos?: { [key: string]: string };
}