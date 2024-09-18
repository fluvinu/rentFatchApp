// src/components/CustomerForm.js

import React, { useState, useEffect } from 'react';
import { createCustomer, updateCustomer, getCustomerById } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const CustomerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Initialize state with empty strings to prevent undefined values.
    const [details, setDetails] = useState({
        cName: '',
        mobileNo: ''
    });

    // Fetch customer details if we are editing an existing customer (id is not 'new').
    useEffect(() => {
        if (id && id !== 'new') {
            getCustomerById(id)
                .then(response => {
                    const customer = response.data;
                    console.log("Fetched customer details:", customer);  // Debugging
                    setDetails({
                        cName: customer.cName || '',   // Set cName with fallback
                        mobileNo: customer.mobileNo || '' // Set mobileNo with fallback
                    });
                })
                .catch(err => console.error(err));
        }
    }, [id]);

    // Update state when form inputs change.
    const onsubmichnge = (e) => {
        const { name, value } = e.target;
        setDetails({ ...details, [name]: value });
    };

    // Handle form submission and log details for debugging.
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted with details:", details);  // Debugging

        if (id && id !== 'new') {
            updateCustomer(id, details)  // Pass the `details` object directly
                .then(() => navigate('/customers'))
                .catch(err => console.error(err));
        } else {
            createCustomer(details)  // Pass the `details` object directly
                .then(() => navigate('/customers'))
                .catch(err => console.error(err));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='cName'>Customer Name</label>
                <input 
                    type="text" 
                    value={(details.cName)?details.cName:"Loding..."} // Ensure value is bound to state
                    name="cName" 
                    onChange={onsubmichnge} 
                    required 
                />
                <label htmlFor='mobileNo'>Mobile Number</label>
                <input 
                    type="number" 
                    value={(details.mobileNo)?details.mobileNo:"loding..."} // Ensure value is bound to state
                    name="mobileNo" 
                    onChange={onsubmichnge} 
                    required 
                />
            </div>
            <button type="submit">
                {id && id !== 'new' ? 'Update Customer' : 'Create Customer'}
            </button>
        </form>
    );
};

export default CustomerForm;
