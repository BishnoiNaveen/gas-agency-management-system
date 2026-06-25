#include "../include/common.h"
#include "../include/customer.h"
#include "../include/cylinder.h"
#include "../include/booking.h"
#include "../include/billing.h"
#include "../include/auth.h"
#include "../include/dashboard.h"
#include "../include/delivery.h"

static void printBanner(void) {
    printf("================================================\n");
    printf("        BISHNOI GAS SERVICES (BGS)\n");
    printf("     LPG Agency Management System in C\n");
    printf("================================================\n");
    printf("  Admin: %-36s\n", getAdminUsername());
}

static void printMainMenu(void) {
    printf("\n+---------------- MAIN MENU ----------------+\n");
    printf("|  1. Customer Management                   |\n");
    printf("|  2. Cylinder Inventory                    |\n");
    printf("|  3. Booking Management                    |\n");
    printf("|  4. Billing Management                    |\n");
    printf("|  5. Delivery Management                   |\n");
    printf("|  6. Admin Dashboard                       |\n");
    printf("|  0. Exit (Logout)                         |\n");
    printf("+-------------------------------------------+\n");
}

int main(void) {
    int choice;

    if (!adminLogin()) {
        return 1;
    }

    ensureDataDirectory();
    initCylinderStock();

    while (1) {
        clearScreen();
        printBanner();
        printMainMenu();

        choice = readInt("Enter your choice: ", 0, 6);

        switch (choice) {
            case 1:
                customerMenu();
                break;
            case 2:
                cylinderMenu();
                break;
            case 3:
                bookingMenu();
                break;
            case 4:
                billingMenu();
                break;
            case 5:
                deliveryMenu();
                break;
            case 6:
                showDashboard();
                pauseScreen();
                break;
            case 0:
                clearScreen();
                printf("Thank you for using Bishnoi Gas Services.\n");
                printf("Logged out successfully. Goodbye, Admin!\n");
                return 0;
            default:
                break;
        }
    }

    return 0;
}
