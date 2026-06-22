#ifndef CUSTOMER_H
#define CUSTOMER_H

#include "common.h"

typedef struct {
    int id;
    char name[MAX_NAME_LEN];
    char phone[MAX_PHONE_LEN];
    char address[MAX_ADDR_LEN];
    int active; /* 1 = active, 0 = inactive */
} Customer;

void customerMenu(void);
int addCustomer(void);
void listCustomers(void);
void searchCustomer(void);
void updateCustomer(void);
void deleteCustomer(void);
Customer *findCustomerById(int id);

#endif
