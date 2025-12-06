import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { FaHome, FaBoxOpen, FaShoppingCart, FaHistory, FaCog, FaMoneyBillWave } from 'react-icons/fa'

const Layout = () => {
    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <div className="bg-light border-end" style={{ width: '250px', minWidth: '250px' }}>
                <div className="p-3 border-bottom">
                    <h5 className="mb-0 fw-bold text-primary">Elegance Boutique</h5>
                    <small className="text-muted">Inventory System</small>
                </div>
                <div className="list-group list-group-flush mt-3">
                    <NavLink to="/" className={({ isActive }) => `list-group-item list-group-item-action border-0 ${isActive ? 'active-nav-item' : ''}`}>
                        <FaHome className="me-2" /> Dashboard
                    </NavLink>
                    <NavLink to="/inventory" className={({ isActive }) => `list-group-item list-group-item-action border-0 ${isActive ? 'active-nav-item' : ''}`}>
                        <FaBoxOpen className="me-2" /> Inventory
                    </NavLink>
                    <NavLink to="/checkout" className={({ isActive }) => `list-group-item list-group-item-action border-0 ${isActive ? 'active-nav-item' : ''}`}>
                        <FaShoppingCart className="me-2" /> Checkout
                    </NavLink>
                    <NavLink to="/expenses" className={({ isActive }) => `list-group-item list-group-item-action border-0 ${isActive ? 'active-nav-item' : ''}`}>
                        <FaMoneyBillWave className="me-2" /> Expenses
                    </NavLink>
                    <NavLink to="/logs" className={({ isActive }) => `list-group-item list-group-item-action border-0 ${isActive ? 'active-nav-item' : ''}`}>
                        <FaHistory className="me-2" /> Logs
                    </NavLink>
                </div>
                <div className="mt-auto p-3 border-top">
                    <div className="list-group list-group-flush">
                        <button className="list-group-item list-group-item-action border-0 text-muted">
                            <FaCog className="me-2" /> Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 bg-light-subtle">
                <Outlet />
            </div>
        </div>
    )
}

export default Layout
