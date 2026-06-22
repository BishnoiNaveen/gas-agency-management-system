#include "../include/booking.h"
#include "../include/billing.h"
#include <time.h>

static const char *statusName(BookingStatus status) {
    switch (status) {
        case STATUS_PENDING:   return "Pending";
        case STATUS_DELIVERED: return "Delivered";
        case STATUS_CANCELLED: return "Cancelled";
        default:               return "Unknown";
    }
}

static void getCurrentDate(char *buffer) {
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    sprintf(buffer, "%02d-%02d-%04d", t->tm_mday, t->tm_mon + 1, t->tm_year + 1900);
}

static void addEmptyCylinders(CylinderType type, int quantity) {
    CylinderStock stockRecords[10];
    int stockTotal = 0;
    int j;
    FILE *fp = fopen(CYLINDER_FILE, "rb");

    if (fp) {
        while (fread(&stockRecords[stockTotal], sizeof(CylinderStock), 1, fp) == 1 && stockTotal < 10) {
            stockTotal++;
        }
        fclose(fp);
    }

    for (j = 0; j < stockTotal; j++) {
        if (stockRecords[j].type == type) {
            stockRecords[j].empty += quantity;
            break;
        }
    }

    fp = fopen(CYLINDER_FILE, "wb");
    if (fp) {
        for (j = 0; j < stockTotal; j++) {
            fwrite(&stockRecords[j], sizeof(CylinderStock), 1, fp);
        }
        fclose(fp);
    }
}

int customerHasPendingBookings(int customerId) {
    FILE *fp = fopen(BOOKING_FILE, "rb");
    Booking record;

    if (!fp) {
        return 0;
    }

    while (fread(&record, sizeof(Booking), 1, fp) == 1) {
        if (record.customerId == customerId && record.status == STATUS_PENDING) {
            fclose(fp);
            return 1;
        }
    }

    fclose(fp);
    return 0;
}

Booking *findBookingById(int id) {
    static Booking found;
    FILE *fp = fopen(BOOKING_FILE, "rb");
    Booking record;

    if (!fp) {
        return NULL;
    }

    while (fread(&record, sizeof(Booking), 1, fp) == 1) {
        if (record.id == id) {
            fclose(fp);
            found = record;
            return &found;
        }
    }

    fclose(fp);
    return NULL;
}

int markBookingDelivered(int bookingId) {
    Booking records[MAX_RECORDS];
    int total = 0;
    int i;
    int deliverIndex = -1;
    FILE *fp;

    fp = fopen(BOOKING_FILE, "rb");
    if (!fp) {
        return 0;
    }

    while (fread(&records[total], sizeof(Booking), 1, fp) == 1 && total < MAX_RECORDS) {
        total++;
    }
    fclose(fp);

    for (i = 0; i < total; i++) {
        if (records[i].id == bookingId) {
            if (records[i].status != STATUS_PENDING) {
                return 0;
            }
            records[i].status = STATUS_DELIVERED;
            deliverIndex = i;
            break;
        }
    }

    if (deliverIndex < 0) {
        return 0;
    }

    fp = fopen(BOOKING_FILE, "wb");
    if (!fp) {
        return 0;
    }

    for (i = 0; i < total; i++) {
        fwrite(&records[i], sizeof(Booking), 1, fp);
    }
    fclose(fp);

    addEmptyCylinders(records[deliverIndex].type, records[deliverIndex].quantity);
    generateBill(bookingId);
    return 1;
}

int createBooking(void) {
    Booking booking;
    Customer *customer;
    CylinderStock *stock;
    int customerId;
    int typeChoice;
    FILE *fp;

    printf("\n--- New Cylinder Booking ---\n");
    customerId = readInt("Enter Customer ID: ", 1, 999999);
    customer = findCustomerById(customerId);

    if (!customer) {
        printf("Customer not found. Please add customer first.\n");
        return 0;
    }

    printf("Customer: %s | %s\n", customer->name, customer->phone);
    listCylinderStock();

    typeChoice = readInt("Select cylinder type (1=5KG, 2=14KG, 3=19KG): ", 1, 3);
    switch (typeChoice) {
        case 1: booking.type = CYLINDER_5KG; break;
        case 2: booking.type = CYLINDER_14KG; break;
        default: booking.type = CYLINDER_19KG; break;
    }

    stock = findCylinderByType(booking.type);
    if (!stock) {
        printf("Cylinder type not available in inventory.\n");
        return 0;
    }

    if (stock->filled < 1) {
        printf("Not enough filled cylinders in stock.\n");
        return 0;
    }

    booking.quantity = readInt("Enter quantity: ", 1, stock->filled);
    if (booking.quantity > stock->filled) {
        printf("Not enough filled cylinders in stock.\n");
        return 0;
    }

    booking.id = generateId(BOOKING_FILE);
    booking.customerId = customerId;
    booking.status = STATUS_PENDING;
    getCurrentDate(booking.bookingDate);

    ensureDataDirectory();
    fp = fopen(BOOKING_FILE, "ab");
    if (!fp) {
        printf("Error saving booking.\n");
        return 0;
    }

    fwrite(&booking, sizeof(Booking), 1, fp);
    fclose(fp);

    /* Reserve stock */
    {
        CylinderStock records[10];
        int total = 0;
        int i;
        fp = fopen(CYLINDER_FILE, "rb");
        if (fp) {
            while (fread(&records[total], sizeof(CylinderStock), 1, fp) == 1 && total < 10) {
                total++;
            }
            fclose(fp);
        }
        for (i = 0; i < total; i++) {
            if (records[i].type == booking.type) {
                records[i].filled -= booking.quantity;
                break;
            }
        }
        fp = fopen(CYLINDER_FILE, "wb");
        if (fp) {
            for (i = 0; i < total; i++) {
                fwrite(&records[i], sizeof(CylinderStock), 1, fp);
            }
            fclose(fp);
        }
    }

    printf("\nBooking created! Booking ID: %d\n", booking.id);
    printf("Estimated amount: Rs %.2f\n", stock->price * booking.quantity);
    return booking.id;
}

void listBookings(void) {
    FILE *fp = fopen(BOOKING_FILE, "rb");
    Booking record;
    Customer *customer;
    int count = 0;

    printf("\n--- Booking List ---\n");
    printf("%-6s %-12s %-10s %-6s %-12s %-12s\n",
           "ID", "Customer", "Type", "Qty", "Date", "Status");
    printf("----------------------------------------------------------------\n");

    if (!fp) {
        printf("No bookings found.\n");
        return;
    }

    while (fread(&record, sizeof(Booking), 1, fp) == 1) {
        customer = findCustomerById(record.customerId);
        printf("%-6d %-12s %-10s %-6d %-12s %-12s\n",
               record.id,
               customer ? customer->name : "Unknown",
               cylinderTypeName(record.type),
               record.quantity,
               record.bookingDate,
               statusName(record.status));
        count++;
    }

    fclose(fp);

    if (count == 0) {
        printf("No bookings found.\n");
    }
}

void updateBookingStatus(void) {
    int id;
    int choice;
    Booking records[MAX_RECORDS];
    int total = 0;
    int i;
    int found = 0;
    FILE *fp;

    listBookings();
    id = readInt("\nEnter Booking ID to update: ", 1, 999999);

    fp = fopen(BOOKING_FILE, "rb");
    if (!fp) {
        printf("No bookings found.\n");
        return;
    }

    while (fread(&records[total], sizeof(Booking), 1, fp) == 1 && total < MAX_RECORDS) {
        total++;
    }
    fclose(fp);

    for (i = 0; i < total; i++) {
        if (records[i].id == id) {
            found = 1;
            if (records[i].status != STATUS_PENDING) {
                printf("Only pending bookings can be updated.\n");
                return;
            }

            choice = readInt("Mark as (1=Delivered, 2=Cancel): ", 1, 2);
            if (choice == 1) {
                if (markBookingDelivered(id)) {
                    printf("Booking marked as delivered.\n");
                } else {
                    printf("Failed to mark booking as delivered.\n");
                }
                return;
            }

            records[i].status = STATUS_CANCELLED;
            {
                CylinderStock stockRecords[10];
                int stockTotal = 0;
                int j;
                fp = fopen(CYLINDER_FILE, "rb");
                if (fp) {
                    while (fread(&stockRecords[stockTotal], sizeof(CylinderStock), 1, fp) == 1 && stockTotal < 10) {
                        stockTotal++;
                    }
                    fclose(fp);
                }
                for (j = 0; j < stockTotal; j++) {
                    if (stockRecords[j].type == records[i].type) {
                        stockRecords[j].filled += records[i].quantity;
                        break;
                    }
                }
                fp = fopen(CYLINDER_FILE, "wb");
                if (fp) {
                    for (j = 0; j < stockTotal; j++) {
                        fwrite(&stockRecords[j], sizeof(CylinderStock), 1, fp);
                    }
                    fclose(fp);
                }
            }
            break;
        }
    }

    if (!found) {
        printf("Booking not found.\n");
        return;
    }

    fp = fopen(BOOKING_FILE, "wb");
    if (!fp) {
        printf("Error saving booking status.\n");
        return;
    }

    for (i = 0; i < total; i++) {
        fwrite(&records[i], sizeof(Booking), 1, fp);
    }
    fclose(fp);

    printf("Booking cancelled and stock restored.\n");
}

void bookingMenu(void) {
    int choice;

    while (1) {
        clearScreen();
        printf("====================================\n");
        printf("         BOOKING MANAGEMENT\n");
        printf("====================================\n");
        printf("1. Create Booking\n");
        printf("2. View All Bookings\n");
        printf("3. Update Booking Status\n");
        printf("0. Back to Main Menu\n");
        printf("------------------------------------\n");

        choice = readInt("Enter your choice: ", 0, 3);

        switch (choice) {
            case 1: createBooking(); pauseScreen(); break;
            case 2: listBookings(); pauseScreen(); break;
            case 3: updateBookingStatus(); pauseScreen(); break;
            case 0: return;
            default: break;
        }
    }
}
