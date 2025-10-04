package com.project.Hotel_Management;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/hotel")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class HotelController {

    private final HotelJpaRepository jpaRepository;

    /**
     * Get all reservations
     */
    @GetMapping("/reservations")
    public ResponseEntity<List<Reservation>> getAllReservations(){
        try {
            List<Reservation> reservations = jpaRepository.findAll();
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new reservation
     */
    @PostMapping("/reservations")
    public ResponseEntity<Reservation> createReservation(@Valid @RequestBody Reservation reservation){
        try {
            // Set creation date if not provided
            if (reservation.getReservationDate() == null) {
                reservation.setReservationDate(LocalDateTime.now());
            }
            Reservation savedReservation = jpaRepository.save(reservation);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReservation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get reservation by ID
     */
    @GetMapping("/reservations/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable Integer id){
        try {
            Optional<Reservation> reservation = jpaRepository.findById(id);
            return reservation.map(r -> ResponseEntity.ok(r))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing reservation
     */
    @PutMapping("/reservations/{id}")
    public ResponseEntity<Reservation> updateReservation(@PathVariable Integer id, 
                                                        @Valid @RequestBody Reservation reservation){
        try {
            if (!jpaRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            reservation.setReservationId(id);
            Reservation updatedReservation = jpaRepository.save(reservation);
            return ResponseEntity.ok(updatedReservation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Delete a reservation
     */
    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Integer id){
        try {
            if (jpaRepository.existsById(id)) {
                jpaRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search reservations by guest name
     */
    @GetMapping("/reservations/search")
    public ResponseEntity<List<Reservation>> searchReservationsByGuestName(@RequestParam String name) {
        try {
            List<Reservation> reservations = jpaRepository.findByGuestNameContaining(name);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get reservations by room number
     */
    @GetMapping("/reservations/room/{roomNumber}")
    public ResponseEntity<List<Reservation>> getReservationsByRoom(@PathVariable Integer roomNumber) {
        try {
            List<Reservation> reservations = jpaRepository.findByRoomNumber(roomNumber);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update reservation status
     */
    @PatchMapping("/reservations/{id}/status")
    public ResponseEntity<Reservation> updateReservationStatus(@PathVariable Integer id, 
                                                              @RequestParam String status) {
        try {
            Optional<Reservation> optionalReservation = jpaRepository.findById(id);
            if (optionalReservation.isPresent()) {
                Reservation reservation = optionalReservation.get();
                reservation.setStatus(Reservation.ReservationStatus.valueOf(status.toUpperCase()));
                Reservation updatedReservation = jpaRepository.save(reservation);
                return ResponseEntity.ok(updatedReservation);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Hotel Management System is running!");
    }
}
