// src/components/OrdersList.js

import React, { useEffect, useState } from 'react';
import { getAllOrders, deleteOrder } from '../services/api';
import { Link } from 'react-router-dom';

const OrdersList = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        getAllOrders().then(response => setOrders(response.data)).catch(err => console.error(err));
    }, []);

    const handleDelete = (id) => {
        deleteOrder(id).then(() => {
            setOrders(orders.filter(order => order.oId !== id));
        }).catch(err => console.error(err));
    };

    return (
        <div>
            <h2>Orders</h2>
            <Link to="/order/new">Create New Order</Link>
            <ul>
                {orders.map(order => (
                    <li key={order.oId}>
                        <span>{order.oId}</span>
                        <span>{order.cName}</span>
                        <Link to={`/order/${order.oId}`}>Edit</Link>
                        <button onClick={() => handleDelete(order.oId)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrdersList;
