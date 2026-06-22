#include "../include/dashboard.h"
#include "../include/customer.h"
#include "../include/cylinder.h"
#include "../include/booking.h"
#include "../include/billing.h"
#include "../include/auth.h"

void showDashboard(void) {
    FILE *fp;
    Customer customer;
    CylinderStock stock;
    Booking booking;
    Bill bill;
    int activeCustomers = 0;
    int totalFilled = 0;
    int totalEmpty = 0;
    int pendingBookings = 0;
    int deliveredBookings = 0;
    int cancelledBookings = 0;
    double totalRevenue = 0.0;
    double pendingAmount = 0.0;
    int paidBills = 0;
    int unpaidBills = 0;

    fp = fopen(CUSTOMER_FILE, "rb");
    if (fp) {
        while (fread(&customer, sizeof(Customer), 1, fp) == 1) {
            if (customer.active) {
                activeCustomers++;
            }
        }
        fclose(fp);
    }

    fp = fopen(CYLINDER_FILE, "rb");
    if (fp) {
        while (fread(&stock, sizeof(CylinderStock), 1, fp) == 1) {
            totalFilled += stock.filled;
            totalEmpty += stock.empty;
        }
        fclose(fp);
    }

    fp = fopen(BOOKING_FILE, "rb");
    if (fp) {
        while (fread(&booking, sizeof(Booking), 1, fp) == 1) {
            switch (booking.status) {
                case STATUS_PENDING:   pendingBookings++; break;
                case STATUS_DELIVERED: deliveredBookings++; break;
                case STATUS_CANCELLED: cancelledBookings++; break;
                default: break;
            }
        }
        fclose(fp);
    }

    fp = fopen(BILL_FILE, "rb");
    if (fp) {
        while (fread(&bill, sizeof(Bill), 1, fp) == 1) {
            if (bill.paid) {
                totalRevenue += bill.amount;
                paidBills++;
            } else {
                pendingAmount += bill.amount;
                unpaidBills++;
            }
        }
        fclose(fp);
    }

    clearScreen();
    printf("================================================\n");
    printf("              ADMIN DASHBOARD                   \n");
    printf("================================================\n");
    printf("  Logged in as : %s\n", getAdminUsername());
    printf("------------------------------------------------\n");
    printf("  CUSTOMERS\n");
    printf("    Active customers      : %d\n", activeCustomers);
    printf("\n  INVENTORY\n");
    printf("    Filled cylinders      : %d\n", totalFilled);
    printf("    Empty cylinders       : %d\n", totalEmpty);
    printf("\n  BOOKINGS\n");
    printf("    Pending               : %d\n", pendingBookings);
    printf("    Delivered             : %d\n", deliveredBookings);
    printf("    Cancelled             : %d\n", cancelledBookings);
    printf("\n  BILLING\n");
    printf("    Paid bills            : %d\n", paidBills);
    printf("    Unpaid bills          : %d\n", unpaidBills);
    printf("    Total revenue         : Rs %.2f\n", totalRevenue);
    printf("    Pending collection    : Rs %.2f\n", pendingAmount);
    printf("================================================\n");
}
