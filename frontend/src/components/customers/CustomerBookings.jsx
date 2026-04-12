import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faStethoscope,
  faCut,
  faSpinner,
  faExclamationTriangle,
  faCalendarCheck,
  faClock,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./CustomerBookings.css";

const CustomerBookings = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    pet: '',
    roomType: '',
    checkInDate: '',
    checkOutDate: '',
    specialRequests: '',
    appointmentDate: '',
    reason: '',
    groomingDate: '',
    serviceType: ''
  });

  // Backend data states
  const [bookings, setBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Mock data structure ready for backend connection
  const mockBookingsData = {
    bookings: [
      {
        id: 1,
        type: 'Hotel',
        petName: 'Max',
        details: 'Standard Room',
        checkIn: '2023-12-15',
        checkOut: '2023-12-17',
        status: 'confirmed',
        createdAt: '2023-12-10T10:00:00Z'
      },
      {
        id: 2,
        type: 'Vet',
        petName: 'Bella',
        details: 'Regular Checkup',
        appointmentDate: '2023-12-20',
        status: 'pending',
        createdAt: '2023-12-15T14:30:00Z'
      },
      {
        id: 3,
        type: 'Groom',
        petName: 'Charlie',
        details: 'Full Grooming Package',
        groomingDate: '2023-12-22',
        status: 'confirmed',
        createdAt: '2023-12-18T09:15:00Z'
      }
    ],
    pets: [
      { id: 1, name: 'Max', type: 'Dog', breed: 'Golden Retriever' },
      { id: 2, name: 'Bella', type: 'Cat', breed: 'Persian' },
      { id: 3, name: 'Charlie', type: 'Dog', breed: 'Labrador' }
    ]
  };

  // Fetch bookings data from backend
  useEffect(() => {
    const fetchBookingsData = async () => {
      try {
        setLoading(true);
        
        // Fetch real data from backend
        const [bookingsResponse, petsResponse] = await Promise.all([
          apiRequest("/customer/bookings"),
          apiRequest("/customer/pets")
        ]);
        setBookings(bookingsResponse);
        setPets(petsResponse);
        
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load bookings data");
        console.error("Bookings data fetch error:", err);
        // Fallback to mock data
        setBookings(mockBookingsData.bookings);
        setPets(mockBookingsData.pets);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsData();
  }, []);

  // Refresh bookings data manually
  const refreshBookings = async () => {
    try {
      setLoading(true);
      const [bookingsResponse, petsResponse] = await Promise.all([
        apiRequest("/customer/bookings"),
        apiRequest("/customer/pets")
      ]);
      setBookings(bookingsResponse);
      setPets(petsResponse);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to refresh bookings data");
      console.error("Bookings refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBookings();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSelect = (type) => {
    setSelectedBooking(type);
    setReceipt(null);
    setPreviewUrl(null);
    setFormData({
      pet: '',
      roomType: '',
      checkInDate: '',
      checkOutDate: '',
      specialRequests: '',
      appointmentDate: '',
      reason: '',
      groomingDate: '',
      serviceType: ''
    });
  };

  const handleClose = () => {
    setSelectedBooking(null);
    setReceipt(null);
    setPreviewUrl(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
    setPreviewUrl(null);
  };

  // Booking actions
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await apiRequest(`/customer/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      await refreshBookings();
      alert('Booking cancelled successfully');
    } catch (err) {
      alert(`Failed to cancel booking: ${err.message || 'Unknown error'}`);
      console.error('Cancel booking error:', err);
    }
  };

  const handleRescheduleBooking = (booking) => {
    setSelectedBooking(booking.type);
    setFormData({
      pet: booking.petId || '',
      roomType: booking.roomType || '',
      checkInDate: booking.checkIn || '',
      checkOutDate: booking.checkOut || '',
      appointmentDate: booking.appointmentDate || '',
      groomingDate: booking.groomingDate || '',
      specialRequests: booking.specialRequests || '',
      reason: booking.reason || '',
      serviceType: booking.serviceType || ''
    });
  };

  const handleViewDetails = (booking) => {
    alert(`Booking Details:\nType: ${booking.type}\nPet: ${booking.petName}\nDetails: ${booking.details}\nStatus: ${booking.status}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Real API call to submit booking
      const bookingData = {
        type: selectedBooking,
        ...formData,
        receipt: receipt ? receipt.name : null
      };
      
      const response = await apiRequest("/customer/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData)
      });
      
      alert(`${selectedBooking} booking submitted successfully!`);
      handleClose();
      
      // Refresh bookings list to get updated data
      await refreshBookings();
      
    } catch (err) {
      alert(`Failed to submit booking: ${err.message || "Unknown error"}`);
      console.error("Booking submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getBookingDetails = (type, formData) => {
    switch (type) {
      case 'Hotel':
        return `${formData.roomType} (${formData.checkInDate} to ${formData.checkOutDate})`;
      case 'Vet':
        return `Appointment on ${formData.appointmentDate} - ${formData.reason}`;
      case 'Groom':
        return `${formData.serviceType} on ${formData.groomingDate}`;
      default:
        return 'General booking';
    }
  };

  const bookingTypes = [
    { id: 'Hotel', icon: <FontAwesomeIcon icon={faHotel} />, title: 'Hotel Stay', description: 'Comfortable boarding for your pet' },
    { id: 'Vet', icon: <FontAwesomeIcon icon={faStethoscope} />, title: 'Veterinary', description: 'Health checkups and treatments' },
    { id: 'Groom', icon: <FontAwesomeIcon icon={faCut} />, title: 'Grooming', description: 'Professional grooming services' }
  ];

  return (
    <div className="customer-bookings">
      <div className="bookings-header">
        <div className="header-content">
          <h3>My Bookings</h3>
          <p>Manage your pet's appointments and reservations</p>
        </div>
        <button 
          onClick={refreshBookings}
          className="refresh-btn"
          disabled={loading}
          title="Refresh Bookings"
        >
          <FontAwesomeIcon icon={loading ? faSpinner : faCalendarCheck} spin={loading} />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading bookings data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      )}

      {/* Bookings Content */}
      {!loading && !error && (
        <>
          {/* Booking type cards */}
          <div className="booking-types-grid">
            {bookingTypes.map((type) => (
              <div 
                key={type.id}
                className="booking-type-card"
                onClick={() => handleSelect(type.id)}
              >
                <div className="card-icon">{type.icon}</div>
                <div className="card-content">
                  <h4>{type.title}</h4>
                  <p>{type.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Bookings Section */}
          <div className="recent-bookings">
            <h4>Recent Bookings</h4>
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <span className="booking-type">
                      {bookingTypes.find(t => t.id === booking.type)?.icon}
                    </span>
                    <span className="booking-details">
                      {booking.petName} - {booking.details}
                    </span>
                    <span className="booking-date">
                      {booking.checkIn && booking.checkOut 
                        ? `${booking.checkIn} to ${booking.checkOut}`
                        : booking.appointmentDate || booking.groomingDate || 'TBD'
                      }
                    </span>
                  </div>
                  <div className="booking-actions">
                    <button 
                      onClick={() => handleViewDetails(booking)}
                      className="action-btn view-btn"
                      title="View Details"
                    >
                      👁️ View
                    </button>
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        className="action-btn cancel-btn"
                        title="Cancel Booking"
                      >
                        ❌ Cancel
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button 
                        onClick={() => handleRescheduleBooking(booking)}
                        className="action-btn reschedule-btn"
                        title="Reschedule Booking"
                      >
                        📅 Reschedule
                      </button>
                    )}
                  </div>
                  <span className={`booking-status ${booking.status}`}>
                    <FontAwesomeIcon 
                      icon={booking.status === 'confirmed' ? faCheckCircle : faClock} 
                    />
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="no-bookings">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  <p>No bookings yet. Create your first booking above!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Enhanced Modal */}
      {selectedBooking && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">
                  {bookingTypes.find(t => t.id === selectedBooking)?.icon}
                </span>
                <h4>{bookingTypes.find(t => t.id === selectedBooking)?.title} Booking</h4>
              </div>
              <button className="close-modal-btn" onClick={handleClose}>×</button>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
              {/* Pet Selection */}
              <div className="form-group">
                <label htmlFor="pet">Select Your Pet</label>
                <select 
                  id="pet" 
                  name="pet" 
                  value={formData.pet} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose your pet...</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.type}) - {pet.breed}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hotel-specific fields */}
              {selectedBooking === "Hotel" && (
                <div className="service-fields">
                  <div className="form-group">
                    <label htmlFor="roomType">Room Type</label>
                    <select 
                      id="roomType" 
                      name="roomType" 
                      value={formData.roomType} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select room...</option>
                      <option value="standard">Standard Room - $50/night</option>
                      <option value="deluxe">Deluxe Room - $75/night</option>
                      <option value="suite">Suite - $100/night</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="checkInDate">Check-In Date</label>
                      <input 
                        type="date" 
                        id="checkInDate" 
                        name="checkInDate" 
                        value={formData.checkInDate} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="checkOutDate">Check-Out Date</label>
                      <input 
                        type="date" 
                        id="checkOutDate" 
                        name="checkOutDate" 
                        value={formData.checkOutDate} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="specialRequests">Special Requests</label>
                    <textarea 
                      id="specialRequests" 
                      name="specialRequests" 
                      value={formData.specialRequests} 
                      onChange={handleInputChange}
                      placeholder="Any special needs or requests for your pet..."
                      rows="3"
                    />
                  </div>
                </div>
              )}

              {/* Vet-specific fields */}
              {selectedBooking === "Vet" && (
                <div className="service-fields">
                  <div className="form-group">
                    <label htmlFor="appointmentDate">Preferred Date</label>
                    <input 
                      type="date" 
                      id="appointmentDate" 
                      name="appointmentDate" 
                      value={formData.appointmentDate} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reason">Reason for Visit</label>
                    <textarea 
                      id="reason" 
                      name="reason" 
                      value={formData.reason} 
                      onChange={handleInputChange}
                      placeholder="Describe the health concern or reason for visit..."
                      rows="4"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Groom-specific fields */}
              {selectedBooking === "Groom" && (
                <div className="service-fields">
                  <div className="form-group">
                    <label htmlFor="groomingDate">Grooming Date</label>
                    <input 
                      type="date" 
                      id="groomingDate" 
                      name="groomingDate" 
                      value={formData.groomingDate} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="serviceType">Service Type</label>
                    <select 
                      id="serviceType" 
                      name="serviceType" 
                      value={formData.serviceType} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select service...</option>
                      <option value="bath">Bath & Dry - $30</option>
                      <option value="haircut">Haircut & Styling - $45</option>
                      <option value="nails">Nail Trim - $15</option>
                      <option value="full">Full Grooming Package - $80</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Payment Section */}
              <div className="payment-section">
                <h5>Payment Information</h5>
                <div className="form-group">
                  <label htmlFor="receipt">Upload Payment Receipt</label>
                  <div className="file-upload">
                    <input 
                      type="file" 
                      id="receipt" 
                      accept="image/*,.pdf" 
                      onChange={handleReceiptUpload}
                      className="file-input"
                    />
                    <label htmlFor="receipt" className="file-label">
                      <span className="upload-icon"></span>
                      <span className="upload-text">
                        {receipt ? receipt.name : 'Choose file or drag here'}
                      </span>
                    </label>
                  </div>
                </div>

                {previewUrl && (
                  <div className="receipt-preview">
                    <div className="preview-header">
                      <span>Receipt Preview</span>
                      <button 
                        type="button" 
                        className="remove-btn" 
                        onClick={handleRemoveReceipt}
                      >
                        Remove
                      </button>
                    </div>
                    <img src={previewUrl} alt="Receipt Preview" />
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Submitting...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;