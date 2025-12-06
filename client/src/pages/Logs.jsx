import React, { useState, useEffect } from 'react'
import { Button, Row, Col, InputGroup, Form, Spinner } from 'react-bootstrap'
import { FaSearch, FaArrowLeft } from 'react-icons/fa'
import axios from 'axios'
import { YearCard, LogCard, DayCard, HeaderStats, TransactionRow } from '../components/logs/LogComponents'

const Logs = () => {
    const [view, setView] = useState('years'); // years, months, days, transactions
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Selection State
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    // Data State
    const [years, setYears] = useState([]);
    const [months, setMonths] = useState([]);
    const [days, setDays] = useState([]);
    const [dayDetails, setDayDetails] = useState(null);

    const API_URL = 'http://localhost:5000/api/logs';

    // --- Data Fetching ---

    // 1. Fetch Years (Initial)
    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/years`);
            if (res.data.success) setYears(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch Months (When Year Selected)
    useEffect(() => {
        if (selectedYear && view === 'months') {
            fetchMonths();
        }
    }, [selectedYear, view]);

    const fetchMonths = async () => {
        setLoading(true);
        try {
            // Updated backend should return full 12 month array
            const res = await axios.get(`${API_URL}/${selectedYear._id}`);
            if (res.data.success) setMonths(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Fetch Days (When Month Selected)
    useEffect(() => {
        if (selectedYear && selectedMonth && view === 'days') {
            fetchDays();
        }
    }, [selectedYear, selectedMonth, view]);

    const fetchDays = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/${selectedYear._id}/${selectedMonth.month}`);
            if (res.data.success) setDays(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 4. Fetch Day Details (When Day Selected)
    useEffect(() => {
        if (selectedYear && selectedMonth && selectedDay && view === 'transactions') {
            fetchDayDetails();
        }
    }, [selectedYear, selectedMonth, selectedDay, view]);

    const fetchDayDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/${selectedYear._id}/${selectedMonth.month}/${selectedDay.day}`);
            if (res.data.success) setDayDetails(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    // --- Navigation Handlers ---

    const handleYearClick = (yearData) => {
        setSelectedYear(yearData);
        setView('months');
    };

    const handleMonthClick = (monthData) => {
        setSelectedMonth(monthData);
        setView('days');
    };

    const handleDayClick = (dayData) => {
        setSelectedDay(dayData);
        setView('transactions');
    };

    const handleBack = () => {
        if (view === 'transactions') {
            setView('days');
            setSelectedDay(null);
            setDayDetails(null);
        } else if (view === 'days') {
            setView('months');
            setSelectedMonth(null);
        } else if (view === 'months') {
            setView('years');
            setSelectedYear(null);
        }
    };

    // --- Render Helpers ---

    const getTitle = () => {
        if (view === 'years') return 'Logs';
        if (view === 'months') return `Logs / ${selectedYear._id}`;
        if (view === 'days') return `Logs / ${selectedYear._id} / ${selectedMonth.name}`;
        if (view === 'transactions') return `Logs / ${selectedYear._id} / ${selectedMonth.name} / Day ${selectedDay.day}`;
        return 'Logs';
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center mb-4">
                {view !== 'years' && (
                    <Button variant="link" className="p-0 text-dark me-3" onClick={handleBack}>
                        <FaArrowLeft />
                    </Button>
                )}
                <div>
                    <h2 className="fw-bold mb-1">{getTitle()}</h2>
                    <p className="text-muted mb-0">Complete record of all business activity</p>
                </div>
            </div>
{/* 
            {view === 'years' && (
                <div className="mb-4">
                    <InputGroup className="bg-white shadow-sm rounded p-1" style={{ maxWidth: '400px' }}>
                        <InputGroup.Text className="bg-white border-0"><FaSearch className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none"
                            placeholder="Search by product, customer, supplier, invoice number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
            )} */}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <>
                    {/* YEARS VIEW */}
                    {view === 'years' && (
                        <Row className="g-4">
                            {years.map((year) => (
                                <Col md={3} key={year._id}>
                                    <YearCard
                                        year={year._id}
                                        itemsSold={`${year.itemsSold || 0} items sold`}
                                        revenue={year.totalRevenue || 0}
                                        profit={year.totalProfit || 0}
                                        onClick={() => handleYearClick(year)}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}

                    {/* MONTHS VIEW */}
                    {view === 'months' && (
                        <Row className="g-4">
                            {months.map((month) => (
                                <Col md={3} key={month.month}>
                                    <LogCard
                                        title={month.name}
                                        subtitle={month.itemsSold > 0 ? `${month.itemsSold} items sold` : 'No activity'}
                                        metrics={{
                                            itemsSold: month.itemsSold,
                                            returns: month.itemsReturned,
                                            revenue: month.totalRevenue,
                                            profit: month.totalProfit
                                        }}
                                        onClick={() => handleMonthClick(month)}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}

                    {/* DAYS VIEW */}
                    {view === 'days' && (
                        <>
                            {
                            selectedMonth && (
                                <HeaderStats
                                    selectedMonth={selectedMonth}
                                    revenue={selectedMonth.totalRevenue}
                                    profit={selectedMonth.totalProfit}
                                    expenses={selectedMonth.totalExpenses}
                                    loss={selectedMonth.totalLoss} // Placeholder, loss usually financial
                                />
                            )}

                            <Row className="g-4">
                                {days.map((day) => {
                                    // Day data format from backend might need normalizing or we just use it
                                    // Backend getDaysByMonth returns log documents
                                    const dateStr = `${selectedMonth.name} ${day.day}`;
                                    return (
                                        <Col md={3} key={day.day}>
                                            <DayCard
                                                date={dateStr} // e.g., "December 15"
                                                transactionsCount={day.transactions ? day.transactions.length : 0} // Approximate or add transactionCount to backend schema if needed
                                                // The log document has fields itemsSold, but maybe not transaction count directly unless we count the array
                                                // Schema has transactions array
                                                revenue={day.totalRevenue}
                                                profit={day.totalProfit}
                                                onClick={() => handleDayClick(day)}
                                            />
                                        </Col>
                                    )
                                })}
                                {days.length === 0 && (
                                    <div className="text-center text-muted py-5">
                                        No activity found for this month.
                                    </div>
                                )}
                            </Row>
                        </>
                    )}

                    {/* TRANSACTIONS VIEW */}
                    {view === 'transactions' && dayDetails && (
                        <div>
                            <HeaderStats
                                 selectedDay={dayDetails}
                                revenue={dayDetails.totalRevenue}
                                profit={dayDetails.totalProfit}
                                expenses={dayDetails.totalExpenses}
                                loss={dayDetails.totalLoss} // Logic for loss could be derived if profit is negative or separate field
                            />

                            <h4 className="fw-bold mb-4">Transactions on {selectedMonth.name} {selectedDay.day}, {selectedYear._id}</h4>

                            {dayDetails.transactions && dayDetails.transactions.length > 0 ? (
                                <div>
                                    {dayDetails.transactions.map((t, idx) => (
                                        <TransactionRow key={idx} transaction={t} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted">No details available.</div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Logs
