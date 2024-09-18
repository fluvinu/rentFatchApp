// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OrdersList from './components/OrdersList';
import OrderForm from './components/OrderForm';
import VehiclesList from './components/VehiclesList';
import VehicleForm from './components/VehicleForm';
import CustomersList from './components/CustomersList';
import CustomerForm from './components/CustomerForm';

function App() {
    return (
        <Router>
            <div className="App">
                <h1>Rent Your Vehicle</h1>
                <Routes>
                    <Route path="/orders" element={<OrdersList />} />
                    <Route path="/order/:id" element={<OrderForm />} />
                    <Route path="/vehicles" element={<VehiclesList />} />
                    <Route path="/vehicle/:id" element={<VehicleForm />} />
                    <Route path="/customers" element={<CustomersList />} />
                    <Route path="/customer/:id" element={<CustomerForm />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
