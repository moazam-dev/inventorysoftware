import React, { useEffect, useState } from 'react'
import { Row, Col, Spinner } from 'react-bootstrap'
import { FaMoneyBillWave, FaWallet, FaShoppingCart, FaExclamationCircle } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'
import KPICard from '../components/dashboard/KPICard'
import RevenueChart from '../components/dashboard/RevenueChart'
import StockChart from '../components/dashboard/StockChart'
import InsightsPanel from '../components/dashboard/InsightsPanel'

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        monthlyRevenue: 0,
        monthlyProfit: 0,
        monthlyExpenses: 0,
        monthlyLoss: 0
    });
    const [stockData, setStockData] = useState([]);
    const [trendData, setTrendData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, use an environment variable for API URL
                const API_URL = 'http://localhost:5000/api';

                const [summaryRes, stockRes, trendRes] = await Promise.all([
                    axios.get(`${API_URL}/dashboard/summary`),
                    axios.get(`${API_URL}/dashboard/stock`),
                    axios.get(`${API_URL}/dashboard/trend`)
                ]);

                if (summaryRes.data.success) {
                    setSummary(summaryRes.data.data);
                }
                if (stockRes.data.success) {
                    setStockData(stockRes.data.data);
                }
                if (trendRes.data.success) {
                    setTrendData(trendRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            <div className="mb-4">
                <h2 className="fw-bold">Dashboard</h2>
                <p className="text-muted">Overview of your business performance and insights</p>
            </div>

            {/* KPI Cards */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <KPICard
                        title="Monthly Revenue"
                        value={`Rs ${summary.monthlyRevenue.toLocaleString()}`}
                        icon={<FaMoneyBillWave size={24} />}
                        color="success"
                        trend={10.4} // Placeholder trend
                    />
                </Col>
                <Col md={3}>
                    <KPICard
                        title="Monthly Profit"
                        value={`Rs ${summary.monthlyProfit.toLocaleString()}`}
                        icon={<FaWallet size={24} />}
                        color="primary"
                        trend={5.2}
                    />
                </Col>
                <Col md={3}>
                    <KPICard
                        title="Monthly Expenses"
                        value={`Rs ${summary.monthlyExpenses.toLocaleString()}`}
                        icon={<FaShoppingCart size={24} />}
                        color="warning"
                        trend={-2.1}
                    />
                </Col>
                <Col md={3}>
                    <KPICard
                        title="Monthly Loss"
                        value={`Rs ${summary.monthlyLoss.toLocaleString()}`}
                        icon={<FaExclamationCircle size={24} />}
                        color="danger"
                        trend={0}
                    />
                </Col>
            </Row>

            {/* Charts */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <RevenueChart data={trendData} />
                </Col>
                <Col lg={4}>
                    <StockChart data={stockData} />
                </Col>
            </Row>

            {/* Insights */}
            <InsightsPanel />
        </div>
    )
}

export default Dashboard
