#ifndef BOOKING_H
#define BOOKING_H

#include "common.h"
#include "customer.h"
#include "cylinder.h"

typedef enum {
    STATUS_PENDING   = 0,
    STATUS_DELIVERED = 1,
    STATUS_CANCELLED = 2
} BookingStatus;

typedef struct {
    int id;
    int customerId;
    CylinderType type;
    int quantity;
    char bookingDate[11]; /* DD-MM-YYYY */
    BookingStatus status;
} Booking;

void bookingMenu(void);
int createBooking(void);
void listBookings(void);
void updateBookingStatus(void);
int customerHasPendingBookings(int customerId);
int markBookingDelivered(int bookingId);
Booking *findBookingById(int id);

#endif
