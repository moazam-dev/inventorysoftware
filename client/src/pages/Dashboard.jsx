import React, { useEffect, useState } from 'react'
import { Row, Col, Spinner } from 'react-bootstrap'
import { FaMoneyBillWave, FaWallet, FaShoppingCart, FaExclamationCircle } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'
import KPICard from '../components/dashboard/KPICard'
import ProfitExpenseChart from '../components/dashboard/RevenueChart'
import TopProductsChart from '../components/dashboard/TopProductsChart'
import CategoryPerformanceChart from '../components/dashboard/CategoryPerformanceChart'

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        monthlyRevenue: 0,
        monthlyProfit: 0,
        monthlyExpenses: 0,
        monthlyLoss: 0
    });
    const [topProducts, setTopProducts] = useState([]);
    const [categoryPerformance, setCategoryPerformance] = useState([]);
    const [salesTrends, setSalesTrends] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const API_URL = 'http://localhost:5000/api';

                const [summaryRes, topProductsRes, categoryRes, trendsRes] = await Promise.all([
                    axios.get(`${API_URL}/dashboard/summary`),
                    axios.get(`${API_URL}/analytics/top-products`),
                    axios.get(`${API_URL}/analytics/category-performance`),
                    axios.get(`${API_URL}/analytics/sales-trends`)
                ]);

                if (summaryRes.data.success) {
                    setSummary(summaryRes.data.data);
                }
                if (topProductsRes.data.success) {
                    setTopProducts(topProductsRes.data.data);
                }
                if (categoryRes.data.success) {
                    setCategoryPerformance(categoryRes.data.data);
                }
                if (trendsRes.data.success) {
                    setSalesTrends(trendsRes.data.data);
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
            <Row className="g-3 mb-4">
                <Col md={3}>
                    <KPICard
                        title="Monthly Revenue"
                        value={`Rs ${summary.monthlyRevenue.toLocaleString()}`}
                        icon={<FaMoneyBillWave size={24} />}
                        color="success"
                    />
                </Col>
                <Col md={3}>
                    <KPICard
                        title="Monthly Profit"
                        value={`Rs ${summary.monthlyProfit.toLocaleString()}`}
                        icon={<FaWallet size={24} />}
                        color="primary"
                    />
                </Col>
                <Col md={3}>
                    <KPICard
                        title="Monthly Expenses"
                        value={`Rs ${summary.monthlyExpenses.toLocaleString()}`}
                        icon={<FaShoppingCart size={24} />}
                        color="warning"
                    />
                </Col>
                <Col md={3}>
                    <KPICard
                        title="Monthly Loss"
                        value={`Rs ${summary.monthlyLoss.toLocaleString()}`}
                        icon={<FaExclamationCircle size={24} />}
                        color="danger"
                    />
                </Col>
            </Row>

            {/* Charts */}
            <Row className="g-4 mt-2">
                <Col lg={12}>
                    <ProfitExpenseChart data={salesTrends} />
                </Col>
            </Row>

            <Row className="g-4 mt-2">
                <Col lg={6}>
                    <TopProductsChart data={topProducts} />
                </Col>
                <Col lg={6}>
                    <CategoryPerformanceChart data={categoryPerformance} />
                </Col>
            </Row>
        </div>
    )
}

export default Dashboard
