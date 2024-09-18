// src/components/VehiclesList.js

import React, { useEffect, useState } from 'react';
import { getAllVehicles, deleteVehicle } from '../services/api';
import { Link } from 'react-router-dom';

const VehiclesList = () => {
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        getAllVehicles().then(response => setVehicles(response.data)).catch(err => console.error(err));
    }, []);

    const handleDelete = (id) => {
        deleteVehicle(id).then(() => {
            setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
        }).catch(err => console.error(err));
    };

    return (
        <div>
            <h2>Vehicles</h2>
            <Link to="/vehicle/new">Create New Vehicle</Link>
            <ul>
                {vehicles.map(vehicle => (
                    <li key={vehicle.id}>
                        <span style={{ color: 'red' }}>Vehicle Type:</span> {vehicle.vType}<br />
                        <span style={{ color: 'red' }}>ID:</span> {vehicle.id}<br />
                        <span style={{ color: 'red' }}>Name:</span> {vehicle.vName}<br />
                        <span style={{ color: 'red' }}>Price:</span> {vehicle.vPrice}<br />
                        <span style={{color:'blue'}}>Availability:</span> {vehicle.available ? 'Yes' : 'No'}<br />
                        <Link to={`/vehicle/${vehicle.id}`}>Edit</Link>
                        <button onClick={() => handleDelete(vehicle.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VehiclesList;
