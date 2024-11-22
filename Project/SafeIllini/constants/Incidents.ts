import { IncidentType, SeverityLevel } from '../types/incidents';

// labels for incident types and severity levels for display purposes
export const INCIDENT_TYPE_LABELS: { label: string; value: IncidentType }[] = [
    {label: 'Harassment', value: 'harassment'},
    {label: 'Sexual Harassment', value:'sexual_harassment'},
    {label: 'Drunk Driving', value: 'drunk_driving'},
    {label: 'Assault', value: 'assault'},
    {label: 'Theft', value: 'theft'},
    {label: 'High Noise', value: 'high_noise'},
    {label: 'Other', value: 'other'}
];

export const SEVERITY_LEVEL_LABELS: { label: string; value: SeverityLevel }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
];

export const PIN_COLORS: Record<IncidentType, string> = {
    'harassment': 'purple',
    'sexual_harassment': 'red',
    'drunk_driving': 'orange',
    'assault': 'blue',
    'theft': 'yellow',
    'high_noise': 'green',
    'other': '#0066cc'
};