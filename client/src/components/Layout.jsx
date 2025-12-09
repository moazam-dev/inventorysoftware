import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { FaHome, FaBoxOpen, FaShoppingCart, FaHistory, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa'

const Layout = () => {
    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <div className="sidebar" style={{ width: '250px', minWidth: '250px', position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto' }}>
                <div className="sidebar-header">
                    <h5 className="mb-0 fw-bold">Elegance Boutique</h5>
                    <small>Inventory System</small>
                </div>
                <div className="list-group list-group-flush mt-3">
                    <NavLink to="/" className={({ isActive }) => `nav-item-custom ${isActive ? 'active-nav-item' : ''}`}>
                        <FaHome className="me-2" /> Dashboard
                    </NavLink>
                    <NavLink to="/inventory" className={({ isActive }) => `nav-item-custom ${isActive ? 'active-nav-item' : ''}`}>
                        <FaBoxOpen className="me-2" /> Inventory
                    </NavLink>
                    <NavLink to="/checkout" className={({ isActive }) => `nav-item-custom ${isActive ? 'active-nav-item' : ''}`}>
                        <FaShoppingCart className="me-2" /> Checkout
                    </NavLink>
                    <NavLink to="/payments" className={({ isActive }) => `nav-item-custom ${isActive ? 'active-nav-item' : ''}`}>
                        <FaMoneyBillWave className="me-2" /> Payments
                    </NavLink>
                    <NavLink to="/expenses" className={({ isActive }) => `nav-item-custom ${isActive ? 'active-nav-item' : ''}`}>
                        <FaMoneyBillWave className="me-2" /> Expenses
                    </NavLink>
                    <NavLink to="/logs" className={({ isActive }) => `nav-item-custom ${isActive ? 'active-nav-item' : ''}`}>
                        <FaHistory className="me-2" /> Logs
                    </NavLink>
                    <NavLink to="/pending-payments" className={({ isActive }) => `nav-item-custom ${isActive ? 'active-nav-item' : ''}`}>
                        <FaClipboardList className="me-2" /> Pending Payments
                    </NavLink>
                </div>
            </div>

            {/* Main Content */}
            <div id="main-content" className="flex-grow-1 bg-light-subtle" style={{ marginLeft: '250px' }}>
                <Outlet />
            </div>
        </div>
    )
}

export default Layout
