#include "../include/customer.h"
#include "../include/booking.h"

Customer *findCustomerById(int id) {
    static Customer found;
    FILE *fp = fopen(CUSTOMER_FILE, "rb");
    Customer record;

    if (!fp) {
        return NULL;
    }

    while (fread(&record, sizeof(Customer), 1, fp) == 1) {
        if (record.id == id && record.active) {
            fclose(fp);
            found = record;
            return &found;
        }
    }

    fclose(fp);
    return NULL;
}

int addCustomer(void) {
    Customer customer;
    FILE *fp;

    ensureDataDirectory();
    customer.id = generateId(CUSTOMER_FILE);
    customer.active = 1;

    printf("\n--- Add New Customer ---\n");
    readString("Enter customer name      : ", customer.name, MAX_NAME_LEN);
    readPhone("Enter phone number (10 digit): ", customer.phone, MAX_PHONE_LEN);
    readString("Enter address            : ", customer.address, MAX_ADDR_LEN);

    fp = fopen(CUSTOMER_FILE, "ab");
    if (!fp) {
        printf("Error: Could not save customer record.\n");
        return 0;
    }

    fwrite(&customer, sizeof(Customer), 1, fp);
    fclose(fp);

    printf("\nCustomer added successfully! Customer ID: %d\n", customer.id);
    return customer.id;
}

void listCustomers(void) {
    FILE *fp = fopen(CUSTOMER_FILE, "rb");
    Customer record;
    int count = 0;

    printf("\n--- Customer List ---\n");
    printf("%-6s %-20s %-15s %-30s\n", "ID", "Name", "Phone", "Address");
    printf("--------------------------------------------------------------------------\n");

    if (!fp) {
        printf("No customers found.\n");
        return;
    }

    while (fread(&record, sizeof(Customer), 1, fp) == 1) {
        if (record.active) {
            printf("%-6d %-20s %-15s %-30s\n",
                   record.id, record.name, record.phone, record.address);
            count++;
        }
    }

    fclose(fp);

    if (count == 0) {
        printf("No active customers found.\n");
    } else {
        printf("\nTotal active customers: %d\n", count);
    }
}

void searchCustomer(void) {
    int id;
    Customer *customer;

    printf("\n--- Search Customer ---\n");
    id = readInt("Enter Customer ID: ", 1, 999999);
    customer = findCustomerById(id);

    if (!customer) {
        printf("Customer not found.\n");
        return;
    }

    printf("\nCustomer Details:\n");
    printf("ID      : %d\n", customer->id);
    printf("Name    : %s\n", customer->name);
    printf("Phone   : %s\n", customer->phone);
    printf("Address : %s\n", customer->address);
}

void updateCustomer(void) {
    int id;
    Customer *customer;
    Customer records[MAX_RECORDS];
    int total = 0;
    int i;
    FILE *fp;
    char temp[MAX_ADDR_LEN];

    printf("\n--- Update Customer ---\n");
    id = readInt("Enter Customer ID to update: ", 1, 999999);
    customer = findCustomerById(id);

    if (!customer) {
        printf("Customer not found.\n");
        return;
    }

    fp = fopen(CUSTOMER_FILE, "rb");
    if (!fp) {
        printf("Error reading customer file.\n");
        return;
    }

    while (fread(&records[total], sizeof(Customer), 1, fp) == 1 && total < MAX_RECORDS) {
        total++;
    }
    fclose(fp);

    for (i = 0; i < total; i++) {
        if (records[i].id != id) {
            continue;
        }

        printf("\nCurrent details:\n");
        printf("Name    : %s\n", records[i].name);
        printf("Phone   : %s\n", records[i].phone);
        printf("Address : %s\n", records[i].address);
        printf("\nEnter new values (press Enter to keep current):\n");

        printf("Name    : ");
        if (fgets(temp, MAX_NAME_LEN, stdin) && temp[0] != '\n') {
            temp[strcspn(temp, "\n")] = '\0';
            strncpy(records[i].name, temp, MAX_NAME_LEN - 1);
            records[i].name[MAX_NAME_LEN - 1] = '\0';
        }

        printf("Phone   : ");
        if (fgets(temp, MAX_PHONE_LEN, stdin) && temp[0] != '\n') {
            temp[strcspn(temp, "\n")] = '\0';
            if (strlen(temp) == 10) {
                int j;
                int valid = 1;
                for (j = 0; temp[j] != '\0'; j++) {
                    if (!isdigit((unsigned char)temp[j])) {
                        valid = 0;
                        break;
                    }
                }
                if (valid) {
                    strncpy(records[i].phone, temp, MAX_PHONE_LEN - 1);
                    records[i].phone[MAX_PHONE_LEN - 1] = '\0';
                } else {
                    printf("Invalid phone. Keeping current number.\n");
                }
            } else {
                printf("Phone must be 10 digits. Keeping current number.\n");
            }
        }

        printf("Address : ");
        if (fgets(temp, MAX_ADDR_LEN, stdin) && temp[0] != '\n') {
            temp[strcspn(temp, "\n")] = '\0';
            strncpy(records[i].address, temp, MAX_ADDR_LEN - 1);
            records[i].address[MAX_ADDR_LEN - 1] = '\0';
        }
        break;
    }

    fp = fopen(CUSTOMER_FILE, "wb");
    if (!fp) {
        printf("Error saving updates.\n");
        return;
    }

    for (i = 0; i < total; i++) {
        fwrite(&records[i], sizeof(Customer), 1, fp);
    }
    fclose(fp);

    printf("Customer updated successfully.\n");
}

void deleteCustomer(void) {
    int id;
    Customer records[MAX_RECORDS];
    int total = 0;
    int i;
    int found = 0;
    FILE *fp;

    printf("\n--- Delete Customer ---\n");
    id = readInt("Enter Customer ID to delete: ", 1, 999999);

    fp = fopen(CUSTOMER_FILE, "rb");
    if (!fp) {
        printf("No customers found.\n");
        return;
    }

    while (fread(&records[total], sizeof(Customer), 1, fp) == 1 && total < MAX_RECORDS) {
        if (records[total].id == id && records[total].active) {
            records[total].active = 0;
            found = 1;
        }
        total++;
    }
    fclose(fp);

    if (!found) {
        printf("Customer not found.\n");
        return;
    }

    if (customerHasPendingBookings(id)) {
        printf("Cannot delete: customer has pending bookings.\n");
        return;
    }

    fp = fopen(CUSTOMER_FILE, "wb");
    if (!fp) {
        printf("Error updating records.\n");
        return;
    }

    for (i = 0; i < total; i++) {
        fwrite(&records[i], sizeof(Customer), 1, fp);
    }
    fclose(fp);

    printf("Customer deleted successfully (soft delete).\n");
}

void customerMenu(void) {
    int choice;

    while (1) {
        clearScreen();
        printf("====================================\n");
        printf("       CUSTOMER MANAGEMENT\n");
        printf("====================================\n");
        printf("1. Add Customer\n");
        printf("2. View All Customers\n");
        printf("3. Search Customer\n");
        printf("4. Update Customer\n");
        printf("5. Delete Customer\n");
        printf("0. Back to Main Menu\n");
        printf("------------------------------------\n");

        choice = readInt("Enter your choice: ", 0, 5);

        switch (choice) {
            case 1: addCustomer(); pauseScreen(); break;
            case 2: listCustomers(); pauseScreen(); break;
            case 3: searchCustomer(); pauseScreen(); break;
            case 4: updateCustomer(); pauseScreen(); break;
            case 5: deleteCustomer(); pauseScreen(); break;
            case 0: return;
            default: break;
        }
    }
}
