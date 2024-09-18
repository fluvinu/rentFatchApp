// src/components/VehicleForm.js

import React, { useState, useEffect } from 'react';
import { createVehicle, updateVehicle, getVehicleById } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const VehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState({
        vType: '',
        vName: '',
        vPrice: '',
        available: false
    });

    useEffect(() => {
        if (id && id !== 'new') {
            getVehicleById(id).then(response => {
                const vehicle = response.data;
                setDetails({
                    vType: vehicle.vType || '',
                    vName: vehicle.vName || '',
                    vPrice: vehicle.vPrice || '',
                    available: vehicle.available || false
                });
            }).catch(err => console.error(err));
        }
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (id && id !== 'new') {
            updateVehicle(id, details)
                .then(() => navigate('/vehicles'))
                .catch(err => console.error(err));
        } else {
            createVehicle(details)
                .then(() => navigate('/vehicles'))
                .catch(err => console.error(err));
        }
    };

    const onSubmitChange = (e) => {
        const { name, value } = e.target;
        if (name === 'available') {
            setDetails({ ...details, [name]: value === 'true' });
        } else {
            setDetails({ ...details, [name]: value });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='vType'>Car Type</label>
                <input 
                    type="text" 
                    value={details.vType} 
                    name="vType" 
                    onChange={onSubmitChange} 
                />
                <label htmlFor="vName">Vehicle Name</label>
                <input 
                    type="text" 
                    value={details.vName}  
                    name="vName" 
                    onChange={onSubmitChange} 
                />
                <label htmlFor="vPrice">Vehicle Price</label>
                <input 
                    type="number" 
                    value={details.vPrice} 
                    name='vPrice'  
                    onChange={onSubmitChange} 
                />
                <label>Available</label>
                <label>
                    <input 
                        type="radio" 
                        name="available" 
                        value="true" 
                        checked={details.available === true} 
                        onChange={onSubmitChange} 
                    />
                    Yes
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="available" 
                        value="false" 
                        checked={details.available === false} 
                        onChange={onSubmitChange} 
                    />
                    No
                </label>
            </div>
            <button type="submit">{id && id !== 'new' ? 'Update Vehicle' : 'Create Vehicle'}</button>
        </form>
    );
};

export default VehicleForm;
