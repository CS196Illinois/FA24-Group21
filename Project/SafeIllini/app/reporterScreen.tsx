import React, { useState } from 'react';

export default function ReporterScreen() {
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [severity, setSeverity] = useState<string | undefined>(undefined);
    const [timestamp, setTimestamp] = useState<number | undefined>(undefined);
    const [type, setType] = useState<number | undefined>(undefined);
    const [photos, setPhotos] = useState([]);
    const severityLevels = ['Very severe', 'Severe', 'A little Severe', 'Be Careful', 'Minor Inconvenience'];

    // When applicable, put into the return statement instead of creating a function here
    const chooseSeverity = (choice : number) => {
        setSeverity(severityLevels[choice]);
    };

    const chooseTime = (time : Date) => {
        setTimestamp(time.getTime());
    };

    const chooseLongitude = (setLong: number) => {
        setLongitude(setLong);
    };

    const chooseLatitiude = (setLat: number) => {
        setLatitude(setLat);
    };

    const typeDesc = (setDesc: string | undefined) => {
        setDescription(setDesc);
    };

    const choosePhotos = (photos: string) => {
        
    };
    

    return ({
        /* 
        * Header
        * Incident Report
        * Button
        * Another Button
        * 
        * Time Selection
        * 
        * 
        * Bar at the bottom
        */
    });
}