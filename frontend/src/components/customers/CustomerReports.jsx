import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChartBar, 
  faCalendarAlt, 
  faPaw, 
  faCreditCard, 
  faShoppingCart,
  faDownload,
  faFilter,
  faRefresh,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./CustomerReports.css";

const CustomerReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  
  // Report data states
  const [bookingsData, setBookingsData] = useState([]);
  const [petsData, setPetsData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  
  // Filter states
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [reportType, setReportType] = useState("all");

  // Fetch all reports data
  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch data from backend APIs
      const [bookingsRes, petsRes, paymentsRes, storeRes] = await Promise.all([
        apiRequest("/customer/bookings"),
        apiRequest("/customer/pets"), 
        apiRequest("/customer/payments"),
        apiRequest("/customer/store-orders")
      ]);
      
      setBookingsData(bookingsRes || []);
      setPetsData(petsRes || []);
      setPaymentsData(paymentsRes || []);
      setStoreData(storeRes || []);
      
    } catch (err) {
      setError(err.message || "Failed to fetch reports data");
      console.error("Reports fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on date range
  const filterDataByDate = (data) => {
    if (!dateRange.start && !dateRange.end) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.created_at || item.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  };

  // Calculate statistics
  const calculateStats = () => {
    const filteredBookings = filterDataByDate(bookingsData);
    const filteredPayments = filterDataByDate(paymentsData);
    const filteredStore = filterDataByDate(storeData);
    
    return {
      totalBookings: filteredBookings.length,
      upcomingBookings: filteredBookings.filter(b => b.status === "upcoming" || b.status === "confirmed").length,
      completedBookings: filteredBookings.filter(b => b.status === "completed").length,
      totalPets: petsData.length,
      totalSpent: filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalOrders: filteredStore.length,
      pendingOrders: filteredStore.filter(s => s.status === "pending" || s.status === "processing").length
    };
  };

  // Export report
  const exportReport = async (type) => {
    try {
      let data = [];
      let filename = "";
      
      switch (type) {
        case "bookings":
          data = filterDataByDate(bookingsData);
          filename = "bookings-report.csv";
          break;
        case "pets":
          data = petsData;
          filename = "pets-report.csv";
          break;
        case "payments":
          data = filterDataByDate(paymentsData);
          filename = "payments-report.csv";
          break;
        case "store":
          data = filterDataByDate(storeData);
          filename = "store-orders-report.csv";
          break;
        default:
          data = {
            bookings: filterDataByDate(bookingsData),
            pets: petsData,
            payments: filterDataByDate(paymentsData),
            store: filterDataByDate(storeData),
            stats: calculateStats()
          };
          filename = "complete-report.json";
      }
      
      const csvContent = type === "all" 
        ? JSON.stringify(data, null, 2)
        : convertToCSV(data);
      
      const blob = new Blob([csvContent], { type: type === "all" ? "application/json" : "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      const reportTypeText = type === "all" ? "Complete" : type.charAt(0).toUpperCase() + type.slice(1);
      setMessage(`${reportTypeText} report exported successfully!`);
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
      
    } catch (err) {
      setMessage("Failed to export report");
      setMessageType("error");
      console.error("Export error:", err);
    }
  };

  // Convert data to CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");
    const csvRows = data.map(row => 
      headers.map(header => `"${row[header] || ""}"`).join(",")
    ).join("\n");
    
    return csvHeaders + "\n" + csvRows;
  };

  // Handle date range change
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange({ start: "", end: "" });
    setReportType("all");
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const stats = calculateStats();

  return (
    <div className="customer-reports">
      <div className="reports-header">
        <h2>
          <FontAwesomeIcon icon={faChartBar} /> Customer Reports
        </h2>
        <p>View comprehensive reports of your bookings, pets, payments, and store activity</p>
        
        <div className="reports-actions">
          <button 
            className="btn-refresh" 
            onClick={fetchReportsData}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faRefresh} spin={loading} /> Refresh
          </button>
          <button 
            className="btn-export" 
            onClick={() => exportReport(reportType)}
          >
            <FontAwesomeIcon icon={faDownload} /> Export
          </button>
        </div>
      </div>

      {message && (
        <div className={`${messageType}-message`}>
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section">
        <h3>
          <FontAwesomeIcon icon={faFilter} /> Filters
        </h3>
        <div className="filter-controls">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange("start", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange("end", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="all">All Reports</option>
              <option value="bookings">Bookings Only</option>
              <option value="pets">Pets Only</option>
              <option value="payments">Payments Only</option>
              <option value="store">Store Orders Only</option>
            </select>
          </div>
          <button className="btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <FontAwesomeIcon icon={faRefresh} spin size="2x" />
          <p>Loading reports data...</p>
        </div>
      ) : (
        <>
          {/* Statistics Overview */}
          <div className="stats-overview">
            <h3>Statistics Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <div className="stat-content">
                  <h4>{stats.totalBookings}</h4>
                  <p>Total Bookings</p>
                  <small>{stats.upcomingBookings} upcoming, {stats.completedBookings} completed</small>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faPaw} />
                </div>
                <div className="stat-content">
                  <h4>{stats.totalPets}</h4>
                  <p>Registered Pets</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faCreditCard} />
                </div>
                <div className="stat-content">
                  <h4>${stats.totalSpent.toFixed(2)}</h4>
                  <p>Total Spent</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faShoppingCart} />
                </div>
                <div className="stat-content">
                  <h4>{stats.totalOrders}</h4>
                  <p>Store Orders</p>
                  <small>{stats.pendingOrders} pending</small>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Content */}
          {(reportType === "all" || reportType === "bookings") && (
            <div className="report-section">
              <h3>
                <FontAwesomeIcon icon={faCalendarAlt} /> Bookings Overview
              </h3>
              <div className="report-content">
                {filterDataByDate(bookingsData).length > 0 ? (
                  <div className="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Service</th>
                          <th>Pet</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterDataByDate(bookingsData).slice(0, 5).map((booking, index) => (
                          <tr key={index}>
                            <td>{new Date(booking.date || booking.created_at).toLocaleDateString()}</td>
                            <td>{booking.service_type || booking.service}</td>
                            <td>{booking.pet_name || booking.pet}</td>
                            <td>
                              <span className={`status ${booking.status}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td>${booking.amount || "0.00"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">No bookings data available</p>
                )}
              </div>
            </div>
          )}

          {(reportType === "all" || reportType === "pets") && (
            <div className="report-section">
              <h3>
                <FontAwesomeIcon icon={faPaw} /> Pets Overview
              </h3>
              <div className="report-content">
                {petsData.length > 0 ? (
                  <div className="data-grid">
                    {petsData.slice(0, 6).map((pet, index) => (
                      <div key={index} className="pet-card">
                        <h4>{pet.name}</h4>
                        <p><strong>Type:</strong> {pet.type || pet.species}</p>
                        <p><strong>Breed:</strong> {pet.breed}</p>
                        <p><strong>Age:</strong> {pet.age}</p>
                        <p><strong>Status:</strong> {pet.status || "Active"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No pets data available</p>
                )}
              </div>
            </div>
          )}

          {(reportType === "all" || reportType === "payments") && (
            <div className="report-section">
              <h3>
                <FontAwesomeIcon icon={faCreditCard} /> Payments Overview
              </h3>
              <div className="report-content">
                {filterDataByDate(paymentsData).length > 0 ? (
                  <div className="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Method</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterDataByDate(paymentsData).slice(0, 5).map((payment, index) => (
                          <tr key={index}>
                            <td>{new Date(payment.date || payment.created_at).toLocaleDateString()}</td>
                            <td>{payment.description || payment.service}</td>
                            <td>{payment.method}</td>
                            <td>${payment.amount}</td>
                            <td>
                              <span className={`status ${payment.status}`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">No payments data available</p>
                )}
              </div>
            </div>
          )}

          {(reportType === "all" || reportType === "store") && (
            <div className="report-section">
              <h3>
                <FontAwesomeIcon icon={faShoppingCart} /> Store Activity
              </h3>
              <div className="report-content">
                {filterDataByDate(storeData).length > 0 ? (
                  <div className="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Order ID</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterDataByDate(storeData).slice(0, 5).map((order, index) => (
                          <tr key={index}>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                            <td>#{order.id}</td>
                            <td>{order.items?.length || 0} items</td>
                            <td>${order.total}</td>
                            <td>
                              <span className={`status ${order.status}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">No store orders data available</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerReports;
