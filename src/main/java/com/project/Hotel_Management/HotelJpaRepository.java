package com.project.Hotel_Management;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelJpaRepository extends JpaRepository<Reservation, Integer> {
    
    // Custom query to find reservations by guest name
    @Query("SELECT r FROM Reservation r WHERE r.guestName LIKE %:name%")
    List<Reservation> findByGuestNameContaining(@Param("name") String name);
    
    // Find reservations by room number
    List<Reservation> findByRoomNumber(int roomNumber);
    
    // Find reservations by contact number
    List<Reservation> findByContactNumber(String contactNumber);
}
