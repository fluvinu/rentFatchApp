// src/components/CustomersList.js

import React, { useEffect, useState } from 'react';
import { getAllCustomers, deleteCustomer } from '../services/api';
import { Link } from 'react-router-dom';

const CustomersList = () => {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        getAllCustomers().then(response => setCustomers(response.data)).catch(err => console.error(err));
        console.log(customers)
    }, [/*  customers */]);


    const handleDelete = (id) => {
        deleteCustomer(id).then(() => {
            setCustomers(customers.filter(customer => customer.cId !== id));
        }).catch(err => console.error(err));
    };

    return (
        <div>
            <h2>Customers</h2>
            <Link to="/customer/new">Create New Customer</Link>
            <ul>
                {customers.map(customer => (
                    <li key={customer.cId}>
                        {customer.cName}
                        <span>{customer.cId}</span>
                        <Link to={`/customer/${customer.cId}`}>Edit</Link>
                        <button onClick={() => handleDelete(customer.cId)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CustomersList;
