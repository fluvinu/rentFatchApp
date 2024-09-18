// src/components/OrderForm.js

import React, { useState, useEffect } from 'react';
import { createOrder, updateOrder, getOrderById } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const OrderForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [customerId, setCustomerId] = useState('');

    useEffect(() => {
        if (id && id !== 'new') {
            getOrderById(id).then(response => {
                const order = response.data;
                setDetails(order.details );
                setVehicleId(order.vehicleId ||0 );
                setCustomerId(order.customerId ||0);
            }).catch(err => console.error(err));
        }
    }, [id]);

    const onchange=(e)=>{
        const {name,value}=e.target;
        setDetails({...details,[name]:value});
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (id && id !== 'new') {
            updateOrder(id, { details, vehicleId, customerId })
                .then(() => navigate('/orders'))
                .catch(err => console.error(err));
        } else {
            createOrder(vehicleId, customerId)
                .then(() => navigate('/orders'))
                .catch(err => console.error(err));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Details:</label>
                <input type="text" value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
            <div>
                <label>Vehicle ID:</label>
                <input type="text" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} />
            </div>
            <div>
                <label>Customer ID:</label>
                <input type="text" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
            </div>
            <button type="submit">{id && id !== 'new' ? 'Update Order' : 'Create Order'}</button>
        </form>
    );
};

export default OrderForm;
