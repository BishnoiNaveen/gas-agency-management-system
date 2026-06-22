#include "../include/delivery.h"
#include "../include/booking.h"
#include "../include/billing.h"
#include "../include/cylinder.h"
#include <time.h>

static void getCurrentDate(char *buffer) {
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    sprintf(buffer, "%02d-%02d-%04d", t->tm_mday, t->tm_mon + 1, t->tm_year + 1900);
}

static void printDeliverySlip(const Booking *booking, const Customer *customer,
                              double amount, const char *deliveryDate) {
    char filename[80];
    FILE *fp;

    ensureReportsDirectory();
    sprintf(filename, REPORTS_DIR "/delivery_slip_%d.txt", booking->id);

    fp = fopen(filename, "w");
    if (!fp) {
        printf("Warning: Could not save delivery slip file.\n");
        return;
    }

    fprintf(fp, "================================================\n");
    fprintf(fp, "           GAS AGENCY DELIVERY SLIP             \n");
    fprintf(fp, "================================================\n");
    fprintf(fp, "Booking ID     : %d\n", booking->id);
    fprintf(fp, "Delivery Date  : %s\n", deliveryDate);
    fprintf(fp, "Booked On      : %s\n", booking->bookingDate);
    fprintf(fp, "------------------------------------------------\n");
    fprintf(fp, "Customer       : %s\n", customer->name);
    fprintf(fp, "Phone          : %s\n", customer->phone);
    fprintf(fp, "Address        : %s\n", customer->address);
    fprintf(fp, "------------------------------------------------\n");
    fprintf(fp, "Cylinder       : %s\n", cylinderTypeName(booking->type));
    fprintf(fp, "Quantity       : %d\n", booking->quantity);
    fprintf(fp, "Amount         : Rs %.2f\n", amount);
    fprintf(fp, "Status         : DELIVERED\n");
    fprintf(fp, "================================================\n");
    fprintf(fp, "        Thank you for your business!            \n");
    fprintf(fp, "================================================\n");
    fclose(fp);

    printf("\nDelivery slip saved: %s\n", filename);
}

void listPendingDeliveries(void) {
    FILE *fp = fopen(BOOKING_FILE, "rb");
    Booking record;
    Customer *customer;
    CylinderStock *stock;
    int count = 0;

    printf("\n--- Pending Deliveries (Ready for Dispatch) ---\n");
    printf("%-6s %-16s %-12s %-28s %-8s %-6s %-10s\n",
           "ID", "Customer", "Phone", "Address", "Type", "Qty", "Amount");
    printf("--------------------------------------------------------------------------------------------\n");

    if (!fp) {
        printf("No pending deliveries.\n");
        return;
    }

    while (fread(&record, sizeof(Booking), 1, fp) == 1) {
        if (record.status != STATUS_PENDING) {
            continue;
        }

        customer = findCustomerById(record.customerId);
        stock = findCylinderByType(record.type);

        printf("%-6d %-16s %-12s %-28s %-8s %-6d Rs %-7.2f\n",
               record.id,
               customer ? customer->name : "Unknown",
               customer ? customer->phone : "-",
               customer ? customer->address : "-",
               cylinderTypeName(record.type),
               record.quantity,
               stock ? stock->price * record.quantity : 0.0);
        count++;
    }

    fclose(fp);

    if (count == 0) {
        printf("No pending deliveries.\n");
    } else {
        printf("\nTotal pending deliveries: %d\n", count);
    }
}

void processCustomerDelivery(void) {
    int id;
    Booking *booking;
    Customer *customer;
    CylinderStock *stock;
    double amount;
    char deliveryDate[11];
    char confirm;

    listPendingDeliveries();

    {
        FILE *fp = fopen(BOOKING_FILE, "rb");
        if (!fp) {
            printf("\nNo bookings available for delivery.\n");
            return;
        }
        fclose(fp);
    }

    id = readInt("\nEnter Booking ID to deliver: ", 1, 999999);
    booking = findBookingById(id);

    if (!booking) {
        printf("Booking not found.\n");
        return;
    }

    if (booking->status != STATUS_PENDING) {
        printf("This booking is not pending. Only pending orders can be delivered.\n");
        return;
    }

    customer = findCustomerById(booking->customerId);
    if (!customer) {
        printf("Customer record not found. Cannot process delivery.\n");
        return;
    }

    stock = findCylinderByType(booking->type);
    amount = stock ? stock->price * booking->quantity : 0.0;
    getCurrentDate(deliveryDate);

    printf("\n========== DELIVERY CONFIRMATION ==========\n");
    printf("Booking ID  : %d\n", booking->id);
    printf("Customer    : %s\n", customer->name);
    printf("Phone       : %s\n", customer->phone);
    printf("Address     : %s\n", customer->address);
    printf("Cylinder    : %s x %d\n", cylinderTypeName(booking->type), booking->quantity);
    printf("Amount      : Rs %.2f\n", amount);
    printf("Date        : %s\n", deliveryDate);
    printf("=========================================\n");

    printf("Confirm delivery to customer? (y/n): ");
    scanf(" %c", &confirm);
    clearInputBuffer();

    if (confirm != 'y' && confirm != 'Y') {
        printf("Delivery cancelled.\n");
        return;
    }

    if (!markBookingDelivered(id)) {
        printf("Delivery failed. Please try again.\n");
        return;
    }

    booking = findBookingById(id);
    if (booking && customer) {
        printDeliverySlip(booking, customer, amount, deliveryDate);
    }

    printf("\nCylinder delivered successfully to %s!\n", customer->name);
    printf("Bill has been generated automatically.\n");
}

void deliveryMenu(void) {
    int choice;

    while (1) {
        clearScreen();
        printf("====================================\n");
        printf("       DELIVERY MANAGEMENT\n");
        printf("====================================\n");
        printf("1. View Pending Deliveries\n");
        printf("2. Deliver Cylinder to Customer\n");
        printf("0. Back to Main Menu\n");
        printf("------------------------------------\n");

        choice = readInt("Enter your choice: ", 0, 2);

        switch (choice) {
            case 1: listPendingDeliveries(); pauseScreen(); break;
            case 2: processCustomerDelivery(); pauseScreen(); break;
            case 0: return;
            default: break;
        }
    }
}
