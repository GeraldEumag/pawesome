import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheck,
  faCheckDouble,
  faTrash,
  faFilter,
  faSearch,
  faCalendarAlt,
  faUser,
  faClock,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import "./CustomerNotifications.css";

const CustomerNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New User Registration",
      message: "John Doe has registered as a new customer in the system.",
      type: "info",
      priority: "medium",
      read: false,
      timestamp: "2024-04-17T10:30:00Z",
      user: "John Doe",
      category: "User Management",
    },
    {
      id: 2,
      title: "Appointment Scheduled",
      message: "Dr. Smith has a new appointment scheduled for today at 3:00 PM.",
      type: "success",
      priority: "high",
      read: false,
      timestamp: "2024-04-17T09:45:00Z",
      user: "Dr. Smith",
      category: "Appointments",
    },
    {
      id: 3,
      title: "System Maintenance",
      message: "Payment system maintenance is scheduled for tonight at 11:00 PM.",
      type: "warning",
      priority: "high",
      read: false,
      timestamp: "2024-04-17T08:00:00Z",
      user: "System Admin",
      category: "System",
    },
    {
      id: 4,
      title: "Payment Processed",
      message: "Payment of $150.00 has been successfully processed for order #12345.",
      type: "success",
      priority: "low",
      read: true,
      timestamp: "2024-04-17T07:30:00Z",
      user: "Customer Service",
      category: "Payments",
    },
    {
      id: 5,
      title: "Failed Login Attempt",
      message: "Multiple failed login attempts detected from IP address 192.168.1.100.",
      type: "error",
      priority: "high",
      read: true,
      timestamp: "2024-04-17T06:15:00Z",
      user: "Security System",
      category: "Security",
    },
    {
      id: 6,
      title: "Inventory Alert",
      message: "Pet food stock is running low. Current stock: 15 units.",
      type: "warning",
      priority: "medium",
      read: true,
      timestamp: "2024-04-17T05:00:00Z",
      user: "Inventory Manager",
      category: "Inventory",
    },
    {
      id: 7,
      title: "New Review Posted",
      message: "Sarah Johnson left a 5-star review for grooming services.",
      type: "success",
      priority: "low",
      read: true,
      timestamp: "2024-04-16T22:30:00Z",
      user: "Sarah Johnson",
      category: "Reviews",
    },
    {
      id: 8,
      title: "Staff Schedule Update",
      message: "Weekly staff schedule has been updated and published.",
      type: "info",
      priority: "medium",
      read: true,
      timestamp: "2024-04-16T20:00:00Z",
      user: "Manager",
      category: "Staff",
    },
  ]);

  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [showSettings, setShowSettings] = useState(false);

  // Calculate statistics
  const totalNotifications = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === "high").length;

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter(notification => {
      const matchesFilter = filter === "all" || 
        (filter === "unread" && !notification.read) ||
        (filter === "read" && notification.read) ||
        (filter === "high" && notification.priority === "high") ||
        (filter === notification.type);
      
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.user.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  // Handler functions
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAsUnread = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const deleteSelected = () => {
    setNotifications(prev => 
      prev.filter(notif => !selectedNotifications.includes(notif.id))
    );
    setSelectedNotifications([]);
  };

  const toggleSelection = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const deselectAll = () => {
    setSelectedNotifications([]);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="customer-notifications">
      <div className="notifications-header">
        <div className="header-left">
          <h1>
            <FontAwesomeIcon icon={faBell} />
            Notifications
          </h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{totalNotifications}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item unread">
              <span className="stat-number">{unreadCount}</span>
              <span className="stat-label">Unread</span>
            </div>
            <div className="stat-item high-priority">
              <span className="stat-number">{highPriorityCount}</span>
              <span className="stat-label">High Priority</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={markAllAsRead}>
            <FontAwesomeIcon icon={faCheckDouble} />
            Mark All Read
          </button>
          <button className="action-btn settings-btn" onClick={() => setShowSettings(!showSettings)}>
            <FontAwesomeIcon icon={faCog} />
            Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="notifications-settings">
          <div className="settings-content">
            <h3>Notification Settings</h3>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Email notifications
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Push notifications
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                High priority alerts only
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="notifications-controls">
        <div className="controls-left">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faFilter} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="high">High Priority</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div className="sort-dropdown">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>
        </div>
        <div className="controls-right">
          {selectedNotifications.length > 0 && (
            <>
              <button className="bulk-action-btn" onClick={deleteSelected}>
                <FontAwesomeIcon icon={faTrash} />
                Delete Selected ({selectedNotifications.length})
              </button>
              <button className="bulk-action-btn" onClick={deselectAll}>
                Deselect All
              </button>
            </>
          )}
          {selectedNotifications.length === 0 && filteredNotifications.length > 0 && (
            <button className="bulk-action-btn" onClick={selectAll}>
              Select All
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'} priority-${notification.priority}`}
            >
              <div className="notification-checkbox">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => toggleSelection(notification.id)}
                />
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <div className="notification-meta">
                    <span className="priority-badge">{notification.priority}</span>
                    <span className="category-tag">{notification.category}</span>
                    <span className="timestamp">
                      <FontAwesomeIcon icon={faClock} />
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-footer">
                  <span className="notification-user">
                    <FontAwesomeIcon icon={faUser} />
                    {notification.user}
                  </span>
                  <div className="notification-actions">
                    {!notification.read ? (
                      <button 
                        className="action-btn-small"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    ) : (
                      <button 
                        className="action-btn-small"
                        onClick={() => markAsUnread(notification.id)}
                        title="Mark as unread"
                      >
                        Mark Unread
                      </button>
                    )}
                    <button 
                      className="action-btn-small delete-btn"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <FontAwesomeIcon icon={faBell} />
            <h3>No notifications found</h3>
            <p>
              {searchTerm || filter !== "all" 
                ? "Try adjusting your filters or search terms" 
                : "You're all caught up! No new notifications."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerNotifications;
