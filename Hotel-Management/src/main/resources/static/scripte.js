// =======================
// Notification System
// =======================
function showNotification(type, title, message, details = null) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    let detailsHTML = '';
    if (details) {
        detailsHTML = '<div class="notification-details">';
        Object.entries(details).forEach(([key, value]) => {
            detailsHTML += `
                <div class="detail-row">
                    <span class="detail-label">${key}:</span>
                    <span class="detail-value">${value}</span>
                </div>
            `;
        });
        detailsHTML += '</div>';
    }
    
    notification.innerHTML = `
        <button class="notification-close" onclick="closeNotification(this)">&times;</button>
        <div class="notification-header">
            <div class="notification-icon">${iconMap[type] || 'ℹ'}</div>
            <h4 class="notification-title">${title}</h4>
        </div>
        <p class="notification-message">${message}</p>
        ${detailsHTML}
    `;
    
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, 5000);
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.classList.add('hide');
    setTimeout(() => {
        notification.remove();
    }, 400);
}

// Specific notification functions
function showBookingSuccess(guestName, roomNumber, bookingId) {
    const details = {
        'Guest Name': guestName,
        'Room Number': roomNumber,
        'Booking ID': bookingId,
        'Status': 'Confirmed',
        'Date': new Date().toLocaleDateString()
    };
    
    showNotification(
        'success',
        'Booking Created Successfully!',
        `Room has been successfully assigned to ${guestName}`,
        details
    );
}

function showCheckInSuccess(guestName, roomNumber) {
    const now = new Date();
    const details = {
        'Guest Name': guestName,
        'Room Number': roomNumber,
        'Check-in Time': now.toLocaleTimeString(),
        'Check-in Date': now.toLocaleDateString(),
        'Status': 'Checked In',
        'Front Desk Staff': 'Current User'
    };
    
    showNotification(
        'success',
        'Check-in Completed!',
        `${guestName} has been successfully checked into room ${roomNumber}`,
        details
    );
}

function showCheckOutSuccess(guestName, roomNumber) {
    const now = new Date();
    const details = {
        'Guest Name': guestName,
        'Room Number': roomNumber,
        'Check-out Time': now.toLocaleTimeString(),
        'Check-out Date': now.toLocaleDateString(),
        'Status': 'Checked Out',
        'Front Desk Staff': 'Current User'
    };
    
    showNotification(
        'success',
        'Check-out Completed!',
        `${guestName} has been successfully checked out of room ${roomNumber}`,
        details
    );
}

function showError(title, message) {
    showNotification('error', title, message);
}

function showWarning(title, message) {
    showNotification('warning', title, message);
}

// =======================
// Sidebar Navigation
// =======================
document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".sidebar-nav ul li a");
    const bottomNavLinks = document.querySelectorAll(".sidebar-bottom ul li a");
    const allNavLinks = [...navLinks, ...bottomNavLinks];
    const pages = document.querySelectorAll(".page");

    function handleNavigation(link) {
        document.querySelectorAll(".sidebar-nav ul li").forEach(li => li.classList.remove("active"));
        document.querySelectorAll(".sidebar-bottom ul li").forEach(li => li.classList.remove("active"));

        link.parentElement.classList.add("active");

        pages.forEach(page => page.classList.remove("active"));

        const linkText = link.querySelector("span").innerText.toLowerCase();
        let targetId = "";
        switch (linkText) {
            case "dashboard": targetId = "dashboard"; break;
            case "front desk": targetId = "frontdesk"; break;
            case "guest": targetId = "guest"; break;
            case "rooms": targetId = "rooms"; break;
            case "settings": targetId = "settings"; break;
            case "logout": alert("Logout functionality would be implemented here"); return;
            default: targetId = "dashboard";
        }

        const targetPage = document.getElementById(targetId);
        if (targetPage) targetPage.classList.add("active");
    }

    allNavLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            handleNavigation(link);
        });
    });

    const dashboardLink = document.querySelector(".sidebar-nav ul li.active a");
    if (dashboardLink) handleNavigation(dashboardLink);
});

// =======================
// Profile Dropdown
// =======================
const profileArrow = document.getElementById("dropdown-icon");
const dropdownMenu = document.getElementById("dropdown-menu");

if (profileArrow && dropdownMenu) {
    profileArrow.addEventListener("click", e => {
        e.stopPropagation();
        dropdownMenu.classList.toggle("active");
    });

    document.addEventListener("click", () => {
        dropdownMenu.classList.remove("active");
    });
}

// =======================
// API Helper Functions
// =======================
const API_BASE = "http://localhost:8080/api/hotel";

async function getAllReservations() {
    const res = await fetch(`${API_BASE}/reservations`);
    return res.json();
}

async function getReservationById(id) {
    const res = await fetch(`${API_BASE}/reservations/${id}`);
    return res.json();
}

async function createReservation(data) {
    const res = await fetch(`${API_BASE}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

async function updateReservation(id, data) {
    const res = await fetch(`${API_BASE}/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

async function updateReservationStatus(id, status) {
    const res = await fetch(`${API_BASE}/reservations/${id}/status?status=${status}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
    });
    return res.json();
}

async function deleteReservation(id) {
    await fetch(`${API_BASE}/reservations/${id}`, { method: "DELETE" });
}

// =======================
// Dashboard Counter Updates
// =======================
async function updateDashboardCounters() {
    try {
        const reservations = await getAllReservations();
        const today = new Date().toISOString().split('T')[0];
        
        console.log('Updating dashboard counters with', reservations.length, 'reservations');
        
        // Calculate counters
        let checkedInToday = 0;
        let checkedOutToday = 0;
        let totalInHotel = 0;
        let totalRoomsOccupied = 0;
        
        const occupiedRooms = new Set();
        
        reservations.forEach(reservation => {
            const reservationDate = new Date(reservation.reservationDate).toISOString().split('T')[0];
            const updatedDate = reservation.updatedAt ? new Date(reservation.updatedAt).toISOString().split('T')[0] : null;
            
            console.log(`Processing reservation ${reservation.reservationId}: Status=${reservation.status}, Room=${reservation.roomNumber}, UpdatedDate=${updatedDate}`);
            
            switch(reservation.status) {
                case 'CHECKED_IN':
                    totalInHotel++;
                    occupiedRooms.add(reservation.roomNumber);
                    if (updatedDate === today) {
                        checkedInToday++;
                    }
                    break;
                case 'CHECKED_OUT':
                    if (updatedDate === today) {
                        checkedOutToday++;
                    }
                    break;
                case 'CONFIRMED':
                    if (reservationDate === today) {
                        // Count as potential check-in today
                    }
                    break;
            }
        });
        
        totalRoomsOccupied = occupiedRooms.size;
        
        console.log('Dashboard counters:', {
            checkedInToday,
            checkedOutToday,
            totalInHotel,
            totalRoomsOccupied
        });
        
        // Update the DOM with animation
        updateCardNumber('.card:nth-child(1) .card-number', checkedInToday);
        updateCardNumber('.card:nth-child(2) .card-number', checkedOutToday);
        updateCardNumber('.card:nth-child(3) .card-number', totalInHotel);
        updateCardNumber('.card:nth-child(4) .card-number', totalRoomsOccupied);
        
    } catch (error) {
        console.error('Error updating dashboard counters:', error);
        // Set all to 0 on error
        updateCardNumber('.card:nth-child(1) .card-number', 0);
        updateCardNumber('.card:nth-child(2) .card-number', 0);
        updateCardNumber('.card:nth-child(3) .card-number', 0);
        updateCardNumber('.card:nth-child(4) .card-number', 0);
    }
}

function updateCardNumber(selector, newValue) {
    const element = document.querySelector(selector);
    if (element) {
        const card = element.closest('.card');
        
        // Add shimmer effect
        if (card) {
            card.classList.add('card-updating');
            setTimeout(() => card.classList.remove('card-updating'), 1000);
        }
        
        // Add scale animation
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.3s ease';
        element.style.color = '#007bff';
        
        // Update value after brief delay
        setTimeout(() => {
            element.textContent = newValue;
        }, 150);
        
        // Reset animation
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 300);
    }
}

async function refreshDashboard() {
    showNotification('info', 'Refreshing Dashboard', 'Updating all counters and statistics...');
    
    try {
        await updateDashboardCounters();
        await populateRoomGrid();
        await populateFrontDeskTable();
        
        showNotification('success', 'Dashboard Refreshed', 'All counters and data have been updated');
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
        showError('Refresh Failed', 'Unable to refresh dashboard data');
    }
}

// =======================
// Populate Front Desk Table
// =======================
async function populateFrontDeskTable() {
    try {
        const reservations = await getAllReservations();
        const tbody = document.querySelector("#frontdesk .data-table tbody");
        tbody.innerHTML = ""; // Clear existing rows

        reservations.forEach(reservation => {
            const row = document.createElement("tr");
            const reservationDate = new Date(reservation.reservationDate);
            const statusClass = getStatusClass(reservation.status);
            const lastUpdated = getLastUpdatedTime(reservation);
            
            row.innerHTML = `
                <td>${reservation.guestName}</td>
                <td>${reservation.roomNumber}</td>
                <td>${reservationDate.toLocaleDateString()}</td>
                <td>${getCheckoutDate(reservation)}</td>
                <td><span class="status ${statusClass}">${formatStatus(reservation.status)}</span></td>
                <td>${lastUpdated}</td>
                <td>
                    ${getActionButtons(reservation)}
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error populating front desk table:', error);
    }
}

function getStatusClass(status) {
    switch(status) {
        case 'CHECKED_IN': return 'checked-in';
        case 'CHECKED_OUT': return 'checked-out';
        case 'CONFIRMED': return 'confirmed';
        case 'PENDING': return 'pending';
        case 'CANCELLED': return 'cancelled';
        case 'NO_SHOW': return 'no-show';
        default: return 'pending';
    }
}

function formatStatus(status) {
    switch(status) {
        case 'CHECKED_IN': return '🟢 Checked In';
        case 'CHECKED_OUT': return '⚪ Checked Out';
        case 'CONFIRMED': return '🔵 Confirmed';
        case 'PENDING': return '🟡 Pending';
        case 'CANCELLED': return '🔴 Cancelled';
        case 'NO_SHOW': return '🔍 No Show';
        default: return status;
    }
}

function getCheckoutDate(reservation) {
    if (reservation.status === 'CHECKED_OUT' && reservation.updatedAt) {
        return new Date(reservation.updatedAt).toLocaleDateString();
    }
    return '-';
}

function getLastUpdatedTime(reservation) {
    if (reservation.updatedAt) {
        const updatedDate = new Date(reservation.updatedAt);
        const now = new Date();
        const diffMinutes = Math.floor((now - updatedDate) / (1000 * 60));
        
        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffMinutes < 1440) { // 24 hours
            const hours = Math.floor(diffMinutes / 60);
            return `${hours}h ago`;
        } else {
            return updatedDate.toLocaleDateString();
        }
    }
    return 'Unknown';
}

function getActionButtons(reservation) {
    let buttons = '';
    
    switch(reservation.status) {
        case 'CONFIRMED':
            buttons = `
                <button class="btn-small btn-success" onclick="checkInGuest(${reservation.reservationId})">Check In</button>
                <button class="btn-small btn-danger" onclick="cancelReservation(${reservation.reservationId})">Cancel</button>
            `;
            break;
        case 'CHECKED_IN':
            buttons = `
                <button class="btn-small btn-warning" onclick="checkOutGuest(${reservation.reservationId})">Check Out</button>
                <button class="btn-small" onclick="editReservation(${reservation.reservationId})">Edit</button>
            `;
            break;
        case 'CHECKED_OUT':
        case 'CANCELLED':
        case 'NO_SHOW':
            buttons = `
                <button class="btn-small btn-danger" onclick="deleteReservation(${reservation.reservationId})">Delete</button>
            `;
            break;
        default:
            buttons = `
                <button class="btn-small" onclick="editReservation(${reservation.reservationId})">Edit</button>
                <button class="btn-small btn-danger" onclick="deleteReservation(${reservation.reservationId})">Delete</button>
            `;
    }
    
    return buttons;
}

// Action functions for reservations
async function checkInGuest(reservationId) {
    try {
        const reservation = await getReservationById(reservationId);
        await updateReservationStatus(reservationId, 'CHECKED_IN');
        
        showCheckInSuccess(reservation.guestName, reservation.roomNumber);
        
        // Update all displays including room grid
        await populateFrontDeskTable();
        await updateDashboardCounters();
        await populateGuestList();
        await populateRoomGrid();
    } catch (error) {
        console.error('Error checking in guest:', error);
        showError('Check-in Failed', 'Unable to check in guest. Please try again.');
    }
}

async function checkOutGuest(reservationId) {
    try {
        const reservation = await getReservationById(reservationId);
        await updateReservationStatus(reservationId, 'CHECKED_OUT');
        
        showCheckOutSuccess(reservation.guestName, reservation.roomNumber);
        
        // Update all displays including room grid
        await populateFrontDeskTable();
        await updateDashboardCounters();
        await populateGuestList();
        await populateRoomGrid();
    } catch (error) {
        console.error('Error checking out guest:', error);
        showError('Check-out Failed', 'Unable to check out guest. Please try again.');
    }
}

async function cancelReservation(reservationId) {
    if (confirm('Are you sure you want to cancel this reservation?')) {
        try {
            const reservation = await getReservationById(reservationId);
            await updateReservationStatus(reservationId, 'CANCELLED');
            
            const details = {
                'Guest Name': reservation.guestName,
                'Room Number': reservation.roomNumber,
                'Cancelled At': new Date().toLocaleTimeString()
            };
            
            showNotification(
                'warning',
                'Reservation Cancelled',
                `Reservation for ${reservation.guestName} has been cancelled`,
                details
            );
            
            await populateFrontDeskTable();
            await updateDashboardCounters();
            await populateGuestList();
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            showError('Cancellation Failed', 'Unable to cancel reservation. Please try again.');
        }
    }
}

async function editReservation(reservationId) {
    // TODO: Implement edit functionality
    showNotification('info', 'Feature Coming Soon', 'Edit functionality will be implemented soon!');
}

async function deleteReservationById(reservationId) {
    if (confirm('Are you sure you want to permanently delete this reservation?')) {
        try {
            const reservation = await getReservationById(reservationId);
            await deleteReservation(reservationId);
            
            const details = {
                'Guest Name': reservation.guestName,
                'Room Number': reservation.roomNumber,
                'Deleted At': new Date().toLocaleTimeString()
            };
            
            showNotification(
                'info',
                'Reservation Deleted',
                `Reservation for ${reservation.guestName} has been permanently deleted`,
                details
            );
            
            await populateFrontDeskTable();
            await updateDashboardCounters();
            await populateGuestList();
        } catch (error) {
            console.error('Error deleting reservation:', error);
            showError('Deletion Failed', 'Unable to delete reservation. Please try again.');
        }
    }
}

// =======================
// Booking Modal
// =======================
document.addEventListener("DOMContentLoaded", function () {
    const bookingModal = document.getElementById("bookingModal");
    const createBookingBtn = document.querySelector(".create-booking-btn");
    const closeBtn = document.querySelector(".close-btn");
    const cancelBtn = document.getElementById("cancelBooking");
    const bookingForm = document.getElementById("bookingForm");

    function closeModal() {
        bookingModal.style.display = "none";
        document.body.style.overflow = "auto";
        bookingForm.reset();
    }

    if (createBookingBtn) {
        createBookingBtn.addEventListener("click", e => {
            e.preventDefault();
            bookingModal.style.display = "flex";
            document.body.style.overflow = "hidden";
        });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    bookingModal.addEventListener("click", e => {
        if (e.target === bookingModal) closeModal();
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && bookingModal.style.display === "flex") closeModal();
    });

    if (bookingForm) {
        bookingForm.addEventListener("submit", async e => {
            e.preventDefault();
            const formData = new FormData(bookingForm);
            const bookingData = Object.fromEntries(formData.entries());

            const checkIn = new Date(bookingData.checkIn);
            const checkOut = new Date(bookingData.checkOut);
            const today = new Date(); today.setHours(0, 0, 0, 0);

            if (checkIn < today) {
                showError('Invalid Date', 'Check-in date cannot be in the past');
                return;
            }
            if (checkOut <= checkIn) {
                showError('Invalid Date', 'Check-out date must be after check-in');
                return;
            }

            // Check if room is available before booking
            const availableRooms = await getAvailableRooms();
            const selectedRoom = availableRooms.find(room => room.number === parseInt(bookingData.roomNumber));
            
            if (!selectedRoom) {
                showError('Room Unavailable', `Room ${bookingData.roomNumber} is not available for booking`);
                return;
            }

            // Map to reservation fields
            const reservationData = {
                guestName: bookingData.guestName,
                roomNumber: parseInt(bookingData.roomNumber),
                contactNumber: bookingData.guestPhone,
                status: 'CONFIRMED'
            };

            try {
                const newBooking = await createReservation(reservationData);
                console.log("Booking Created:", newBooking);
                
                // Show success notification with guest details
                showBookingSuccess(
                    bookingData.guestName,
                    bookingData.roomNumber,
                    newBooking.reservationId
                );
                
                await populateFrontDeskTable(); // Refresh table
                await updateDashboardCounters(); // Update counters
                await populateGuestList(); // Update guest list
                await populateRoomGrid(); // Update room grid

                closeModal();
            } catch (error) {
                console.error('Error creating booking:', error);
                showError('Booking Failed', 'Unable to create booking. Please try again.');
            }
        });
    }

    const checkInInput = document.getElementById("checkIn");
    const checkOutInput = document.getElementById("checkOut");

    if (checkInInput) {
        const today = new Date().toISOString().split("T")[0];
        checkInInput.setAttribute("min", today);

        checkInInput.addEventListener("change", () => {
            const nextDay = new Date(checkInInput.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOutInput.setAttribute("min", nextDay.toISOString().split("T")[0]);
        });
    }
});

// =======================
// Check-in Modal
// =======================
document.addEventListener("DOMContentLoaded", function () {
    const checkinModal = document.getElementById("checkinModal");
    const newCheckinBtn = document.querySelector(".section-header .btn-primary");
    const closeCheckinBtn = document.getElementById("closeCheckin");
    const cancelCheckinBtn = document.getElementById("cancelCheckin");
    const checkinForm = document.getElementById("checkinForm");

    function closeCheckinModal() {
        checkinModal.style.display = "none";
        document.body.style.overflow = "auto";
        checkinForm.reset();
    }

    if (newCheckinBtn && newCheckinBtn.textContent.includes("New Check-in")) {
        newCheckinBtn.addEventListener("click", e => {
            e.preventDefault();
            checkinModal.style.display = "flex";
            document.body.style.overflow = "hidden";

            const today = new Date().toISOString().split("T")[0];
            const now = new Date().toTimeString().slice(0, 5);
            document.getElementById("checkinDate").value = today;
            document.getElementById("checkinTime").value = now;
        });
    }

    if (closeCheckinBtn) closeCheckinBtn.addEventListener("click", closeCheckinModal);
    if (cancelCheckinBtn) cancelCheckinBtn.addEventListener("click", closeCheckinModal);

    checkinModal.addEventListener("click", e => {
        if (e.target === checkinModal) closeCheckinModal();
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && checkinModal.style.display === "flex") closeCheckinModal();
    });

    if (checkinForm) {
        checkinForm.addEventListener("submit", async e => {
            e.preventDefault();
            const formData = new FormData(checkinForm);
            const checkinData = Object.fromEntries(formData.entries());

            const checkinDate = new Date(checkinData.checkinDate);
            const today = new Date(); today.setHours(0, 0, 0, 0);
            if (checkinDate < today) {
                showError('Invalid Date', 'Check-in date cannot be in the past');
                return;
            }

            // Map to reservation
            const reservationData = {
                guestName: checkinData.guestName,
                roomNumber: parseInt(checkinData.roomNumber.split(' ')[1]), // Extract room number
                contactNumber: checkinData.guestPhone,
                status: 'CHECKED_IN'
            };

            try {
                const newReservation = await createReservation(reservationData);
                console.log("Check-in Created:", newReservation);
                
                // Show success notification with guest details
                showCheckInSuccess(
                    checkinData.guestName,
                    checkinData.roomNumber.split(' ')[1]
                );
                
                await populateFrontDeskTable(); // Refresh table
                await updateDashboardCounters(); // Update counters
                await populateGuestList(); // Update guest list

                closeCheckinModal();
            } catch (error) {
                console.error('Error creating check-in:', error);
                showError('Check-in Failed', 'Unable to process check-in. Please try again.');
            }
        });
    }

    const checkinDateInput = document.getElementById("checkinDate");
    if (checkinDateInput) {
        const today = new Date().toISOString().split("T")[0];
        checkinDateInput.setAttribute("min", today);
    }
});

// =======================
// Room Management System
// =======================

// Define all available rooms in the hotel
const HOTEL_ROOMS = [
    // Floor 1 - Single Rooms
    { number: 101, type: 'Single', floor: 1 },
    { number: 102, type: 'Single', floor: 1 },
    { number: 103, type: 'Single', floor: 1 },
    { number: 104, type: 'Single', floor: 1 },
    { number: 105, type: 'Single', floor: 1 },
    { number: 106, type: 'Single', floor: 1 },
    { number: 107, type: 'Single', floor: 1 },
    { number: 108, type: 'Single', floor: 1 },
    { number: 109, type: 'Single', floor: 1 },
    { number: 110, type: 'Single', floor: 1 },
    
    // Floor 2 - Double Rooms
    { number: 201, type: 'Double', floor: 2 },
    { number: 202, type: 'Double', floor: 2 },
    { number: 203, type: 'Double', floor: 2 },
    { number: 204, type: 'Double', floor: 2 },
    { number: 205, type: 'Double', floor: 2 },
    { number: 206, type: 'Double', floor: 2 },
    { number: 207, type: 'Double', floor: 2 },
    { number: 208, type: 'Double', floor: 2 },
    { number: 209, type: 'Double', floor: 2 },
    { number: 210, type: 'Double', floor: 2 },
    
    // Floor 3 - Triple Rooms
    { number: 301, type: 'Triple', floor: 3 },
    { number: 302, type: 'Triple', floor: 3 },
    { number: 303, type: 'Triple', floor: 3 },
    { number: 304, type: 'Triple', floor: 3 },
    { number: 305, type: 'Triple', floor: 3 },
    { number: 306, type: 'Triple', floor: 3 },
    { number: 307, type: 'Triple', floor: 3 },
    { number: 308, type: 'Triple', floor: 3 },
    { number: 309, type: 'Triple', floor: 3 },
    { number: 310, type: 'Triple', floor: 3 },
    
    // Floor 4 - Suite Rooms
    { number: 401, type: 'Suite', floor: 4 },
    { number: 402, type: 'Suite', floor: 4 },
    { number: 403, type: 'Suite', floor: 4 },
    { number: 404, type: 'Suite', floor: 4 },
    { number: 405, type: 'Suite', floor: 4 },
    { number: 406, type: 'Suite', floor: 4 },
    { number: 407, type: 'Suite', floor: 4 },
    { number: 408, type: 'Suite', floor: 4 },
    { number: 409, type: 'Suite', floor: 4 },
    { number: 410, type: 'Suite', floor: 4 }
];

// Rooms that are in maintenance (you can customize this list)
const MAINTENANCE_ROOMS = [103, 207, 305];

async function getRoomStatus() {
    try {
        const reservations = await getAllReservations();
        const occupiedRooms = [];
        
        // Get all currently occupied rooms with guest info
        reservations.forEach(reservation => {
            if (reservation.status === 'CHECKED_IN') {
                occupiedRooms.push({
                    roomNumber: reservation.roomNumber,
                    guestName: reservation.guestName,
                    checkInTime: reservation.updatedAt ? new Date(reservation.updatedAt) : null
                });
            }
        });
        
        // Build room status array
        const roomStatus = HOTEL_ROOMS.map(room => {
            let status = 'available';
            let guestName = '-';
            let checkInTime = null;
            
            if (MAINTENANCE_ROOMS.includes(room.number)) {
                status = 'maintenance';
            } else {
                const occupiedRoom = occupiedRooms.find(r => r.roomNumber === room.number);
                if (occupiedRoom) {
                    status = 'occupied';
                    guestName = occupiedRoom.guestName;
                    checkInTime = occupiedRoom.checkInTime;
                }
            }
            
            return {
                ...room,
                status: status,
                guestName: guestName,
                checkInTime: checkInTime
            };
        });
        
        return roomStatus;
    } catch (error) {
        console.error('Error getting room status:', error);
        return [];
    }
}

async function populateRoomGrid() {
    try {
        const rooms = await getRoomStatus();
        const roomGrid = document.getElementById('roomGrid');
        roomGrid.innerHTML = '';
        
        // Sort rooms by room number
        rooms.sort((a, b) => a.number - b.number);
        
        rooms.forEach(room => {
            const roomItem = document.createElement('div');
            roomItem.className = `room-item ${room.status}`;
            
            const statusText = room.status.charAt(0).toUpperCase() + room.status.slice(1);
            const guestDisplay = room.status === 'occupied' ? room.guestName : '-';
            
            // Format check-in time for occupied rooms
            let checkInDisplay = '';
            if (room.status === 'occupied' && room.checkInTime) {
                const checkInTime = new Date(room.checkInTime);
                checkInDisplay = `<div class="room-checkin">Checked in: ${checkInTime.toLocaleTimeString()}</div>`;
            }
            
            roomItem.innerHTML = `
                <div class="room-number">${room.number}</div>
                <div class="room-type">${room.type}</div>
                <div class="room-status">${statusText}</div>
                <div class="room-guest">${guestDisplay}</div>
                ${checkInDisplay}
                ${room.status === 'occupied' ? 
                    `<button class="btn-small btn-warning mt-10" onclick="quickCheckOut(${room.number})">Quick Check-out</button>` :
                    room.status === 'available' ? 
                    `<button class="btn-small btn-success mt-10" onclick="quickCheckIn(${room.number})">Quick Check-in</button>` :
                    ''
                }
            `;
            
            roomGrid.appendChild(roomItem);
        });
        
        // Update room statistics
        updateRoomStatistics(rooms);
        
    } catch (error) {
        console.error('Error populating room grid:', error);
    }
}

function updateRoomStatistics(rooms) {
    const available = rooms.filter(r => r.status === 'available').length;
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;
    const total = rooms.length;
    
    document.getElementById('availableRooms').textContent = available;
    document.getElementById('occupiedRooms').textContent = occupied;
    document.getElementById('maintenanceRooms').textContent = maintenance;
    document.getElementById('totalRooms').textContent = total;
}

async function getAvailableRooms() {
    const rooms = await getRoomStatus();
    return rooms.filter(room => room.status === 'available');
}

async function getAvailableRoomsByType(roomType) {
    const availableRooms = await getAvailableRooms();
    if (!roomType) return availableRooms;
    
    const typeMap = {
        'single': 'Single',
        'double': 'Double', 
        'triple': 'Triple',
        'suite': 'Suite'
    };
    
    return availableRooms.filter(room => room.type === typeMap[roomType]);
}

async function refreshRoomStatus() {
    await populateRoomGrid();
    showNotification('info', 'Room Status Updated', 'Room availability has been refreshed');
}

async function quickCheckIn(roomNumber) {
    // TODO: Implement quick check-in functionality
    showNotification('info', 'Quick Check-in', `Quick check-in for room ${roomNumber} will be implemented soon!`);
}

async function quickCheckOut(roomNumber) {
    try {
        const reservations = await getAllReservations();
        const reservation = reservations.find(r => 
            r.roomNumber === roomNumber && r.status === 'CHECKED_IN'
        );
        
        if (reservation) {
            await checkOutGuest(reservation.reservationId);
        } else {
            showError('Check-out Failed', 'No active reservation found for this room');
        }
    } catch (error) {
        console.error('Error in quick check-out:', error);
        showError('Check-out Failed', 'Unable to process quick check-out');
    }
}

// Update room dropdown when room type changes
async function updateRoomOptions() {
    const roomType = document.getElementById('roomType').value;
    const roomNumberSelect = document.getElementById('roomNumber');
    
    roomNumberSelect.innerHTML = '<option value="">Select a room</option>';
    
    if (!roomType) {
        roomNumberSelect.innerHTML = '<option value="">Please select room type first</option>';
        return;
    }
    
    try {
        const availableRooms = await getAvailableRoomsByType(roomType.toLowerCase());
        
        if (availableRooms.length === 0) {
            roomNumberSelect.innerHTML = '<option value="">No rooms available for this type</option>';
            return;
        }
        
        // Sort rooms by number
        availableRooms.sort((a, b) => a.number - b.number);
        
        availableRooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.number;
            option.textContent = `${room.number} - ${room.type}`;
            roomNumberSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error updating room options:', error);
        roomNumberSelect.innerHTML = '<option value="">Error loading rooms</option>';
    }
}

// =======================
// Guest Management Functions
// =======================
async function populateGuestList() {
    try {
        const reservations = await getAllReservations();
        const tbody = document.getElementById("guestTableBody");
        tbody.innerHTML = ""; // Clear existing rows

        // Filter for current guests (checked in)
        const currentGuests = reservations.filter(r => r.status === 'CHECKED_IN');

        currentGuests.forEach(guest => {
            const row = document.createElement("tr");
            const checkInDate = new Date(guest.reservationDate);
            
            row.innerHTML = `
                <td><strong>${guest.guestName}</strong></td>
                <td>${guest.roomNumber}</td>
                <td>${guest.contactNumber}</td>
                <td><span class="status ${getStatusClass(guest.status)}">${formatStatus(guest.status)}</span></td>
                <td>${checkInDate.toLocaleDateString()}</td>
                <td>
                    <button class="btn-small btn-warning" onclick="checkOutGuest(${guest.reservationId})">Check Out</button>
                    <button class="btn-small" onclick="viewGuestDetails(${guest.reservationId})">Details</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        if (currentGuests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #6c757d;">No guests currently checked in</td></tr>';
        }
    } catch (error) {
        console.error('Error populating guest list:', error);
    }
}

async function refreshGuestList() {
    await populateGuestList();
}

function viewGuestDetails(reservationId) {
    // TODO: Implement guest details view
    showNotification('info', 'Guest Details', 'Detailed guest information view will be implemented soon!');
}

// =======================
// Fetch Reservations on Load
// =======================
document.addEventListener("DOMContentLoaded", async function () {
    await populateFrontDeskTable();
    await updateDashboardCounters();
    await populateGuestList();
    await populateRoomGrid();
    
    // Set up room type change listener
    const roomTypeSelect = document.getElementById('roomType');
    if (roomTypeSelect) {
        roomTypeSelect.addEventListener('change', updateRoomOptions);
    }
    
    // Set up refresh room status button if it exists
    const refreshRoomsBtn = document.getElementById('refreshRoomsBtn');
    if (refreshRoomsBtn) {
        refreshRoomsBtn.addEventListener('click', refreshRoomStatus);
    }
    
    console.log('Hotel Management System with Room Management initialized');
});
