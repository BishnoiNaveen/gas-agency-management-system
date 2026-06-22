#include "../include/billing.h"
#include <time.h>

static void getCurrentDate(char *buffer) {
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    sprintf(buffer, "%02d-%02d-%04d", t->tm_mday, t->tm_mon + 1, t->tm_year + 1900);
}

static int billExistsForBooking(int bookingId) {
    FILE *fp = fopen(BILL_FILE, "rb");
    Bill record;

    if (!fp) {
        return 0;
    }

    while (fread(&record, sizeof(Bill), 1, fp) == 1) {
        if (record.bookingId == bookingId) {
            fclose(fp);
            return 1;
        }
    }

    fclose(fp);
    return 0;
}

int generateBill(int bookingId) {
    FILE *fp = fopen(BOOKING_FILE, "rb");
    Booking booking;
    Customer *customer;
    CylinderStock *stock;
    Bill bill;
    int found = 0;

    if (!fp) {
        return 0;
    }

    while (fread(&booking, sizeof(Booking), 1, fp) == 1) {
        if (booking.id == bookingId) {
            found = 1;
            break;
        }
    }
    fclose(fp);

    if (!found || booking.status != STATUS_DELIVERED) {
        return 0;
    }

    if (billExistsForBooking(bookingId)) {
        printf("Bill already exists for booking ID %d.\n", bookingId);
        return 0;
    }

    customer = findCustomerById(booking.customerId);
    stock = findCylinderByType(booking.type);
    if (!customer || !stock) {
        return 0;
    }

    bill.id = generateId(BILL_FILE);
    bill.bookingId = bookingId;
    bill.customerId = booking.customerId;
    bill.amount = stock->price * booking.quantity;
    bill.paid = 0;
    getCurrentDate(bill.billDate);

    ensureDataDirectory();
    fp = fopen(BILL_FILE, "ab");
    if (!fp) {
        return 0;
    }

    fwrite(&bill, sizeof(Bill), 1, fp);
    fclose(fp);

    printf("\n--- Bill Generated ---\n");
    printf("Bill ID     : %d\n", bill.id);
    printf("Customer    : %s\n", customer->name);
    printf("Cylinder    : %s x %d\n", cylinderTypeName(booking.type), booking.quantity);
    printf("Amount      : Rs %.2f\n", bill.amount);
    printf("Status      : Unpaid\n");

    return bill.id;
}

void listBills(void) {
    FILE *fp = fopen(BILL_FILE, "rb");
    Bill record;
    Customer *customer;
    int count = 0;

    printf("\n--- Bill List ---\n");
    printf("%-6s %-10s %-20s %-12s %-10s\n", "Bill", "Booking", "Customer", "Amount", "Status");
    printf("----------------------------------------------------------------\n");

    if (!fp) {
        printf("No bills found.\n");
        return;
    }

    while (fread(&record, sizeof(Bill), 1, fp) == 1) {
        customer = findCustomerById(record.customerId);
        printf("%-6d %-10d %-20s Rs %-9.2f %-10s\n",
               record.id,
               record.bookingId,
               customer ? customer->name : "Unknown",
               record.amount,
               record.paid ? "Paid" : "Unpaid");
        count++;
    }

    fclose(fp);

    if (count == 0) {
        printf("No bills found.\n");
    }
}

void markBillPaid(void) {
    int id;
    Bill records[MAX_RECORDS];
    int total = 0;
    int i;
    int found = 0;
    FILE *fp;

    listBills();
    id = readInt("\nEnter Bill ID to mark as paid: ", 1, 999999);

    fp = fopen(BILL_FILE, "rb");
    if (!fp) {
        printf("No bills found.\n");
        return;
    }

    while (fread(&records[total], sizeof(Bill), 1, fp) == 1 && total < MAX_RECORDS) {
        total++;
    }
    fclose(fp);

    for (i = 0; i < total; i++) {
        if (records[i].id == id) {
            if (records[i].paid) {
                printf("Bill is already marked as paid.\n");
                return;
            }
            records[i].paid = 1;
            found = 1;
            break;
        }
    }

    if (!found) {
        printf("Bill not found.\n");
        return;
    }

    fp = fopen(BILL_FILE, "wb");
    if (!fp) {
        printf("Error updating bill.\n");
        return;
    }

    for (i = 0; i < total; i++) {
        fwrite(&records[i], sizeof(Bill), 1, fp);
    }
    fclose(fp);

    printf("Bill marked as paid.\n");
}

void billingReport(void) {
    FILE *fp = fopen(BILL_FILE, "rb");
    Bill record;
    double totalRevenue = 0.0;
    double pendingAmount = 0.0;
    int paidCount = 0;
    int unpaidCount = 0;

    printf("\n--- Billing Report ---\n");

    if (!fp) {
        printf("No billing data available.\n");
        return;
    }

    while (fread(&record, sizeof(Bill), 1, fp) == 1) {
        if (record.paid) {
            totalRevenue += record.amount;
            paidCount++;
        } else {
            pendingAmount += record.amount;
            unpaidCount++;
        }
    }

    fclose(fp);

    printf("Paid Bills    : %d\n", paidCount);
    printf("Unpaid Bills  : %d\n", unpaidCount);
    printf("Total Revenue : Rs %.2f\n", totalRevenue);
    printf("Pending Amount: Rs %.2f\n", pendingAmount);
}

void exportBillsReport(void) {
    FILE *in = fopen(BILL_FILE, "rb");
    FILE *out;
    Bill record;
    Customer *customer;
    int count = 0;

    ensureReportsDirectory();
    out = fopen(REPORTS_DIR "/bills_report.csv", "w");
    if (!out) {
        printf("Could not create report file.\n");
        if (in) {
            fclose(in);
        }
        return;
    }

    fprintf(out, "Bill ID,Booking ID,Customer,Amount,Bill Date,Status\n");

    if (!in) {
        fclose(out);
        printf("No bills to export.\n");
        return;
    }

    while (fread(&record, sizeof(Bill), 1, in) == 1) {
        customer = findCustomerById(record.customerId);
        fprintf(out, "%d,%d,%s,%.2f,%s,%s\n",
                record.id,
                record.bookingId,
                customer ? customer->name : "Unknown",
                record.amount,
                record.billDate,
                record.paid ? "Paid" : "Unpaid");
        count++;
    }

    fclose(in);
    fclose(out);

    printf("\nExported %d bill(s) to " REPORTS_DIR "/bills_report.csv\n", count);
}

void billingMenu(void) {
    int choice;

    while (1) {
        clearScreen();
        printf("====================================\n");
        printf("         BILLING MANAGEMENT\n");
        printf("====================================\n");
        printf("1. View All Bills\n");
        printf("2. Mark Bill as Paid\n");
        printf("3. Revenue Report\n");
        printf("4. Export Bills to CSV\n");
        printf("0. Back to Main Menu\n");
        printf("------------------------------------\n");

        choice = readInt("Enter your choice: ", 0, 4);

        switch (choice) {
            case 1: listBills(); pauseScreen(); break;
            case 2: markBillPaid(); pauseScreen(); break;
            case 3: billingReport(); pauseScreen(); break;
            case 4: exportBillsReport(); pauseScreen(); break;
            case 0: return;
            default: break;
        }
    }
}
