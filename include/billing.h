#ifndef BILLING_H
#define BILLING_H

#include "common.h"
#include "booking.h"

typedef struct {
    int id;
    int bookingId;
    int customerId;
    double amount;
    char billDate[11];
    int paid; /* 1 = paid, 0 = unpaid */
} Bill;

void billingMenu(void);
int generateBill(int bookingId);
void listBills(void);
void markBillPaid(void);
void billingReport(void);
void exportBillsReport(void);

#endif
