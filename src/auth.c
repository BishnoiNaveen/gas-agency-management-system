#include "../include/auth.h"

#define ADMIN_USERNAME "Naveen Bishnoi"
#define ADMIN_PASSWORD "Bhambu2006"

static void printLoginPage(int attempt, int maxAttempts) {
    clearScreen();
    printf("================================================\n");
    printf("          GAS AGENCY MANAGEMENT SYSTEM          \n");
    printf("                 ADMIN LOGIN PANEL                \n");
    printf("================================================\n");
    printf("\n");
    printf("  +------------------------------------------+  \n");
    printf("  |  Authorized personnel only               |  \n");
    printf("  |  Enter your admin credentials below      |  \n");
    printf("  +------------------------------------------+  \n");
    printf("\n");
    if (attempt > 1) {
        printf("  [!] Invalid credentials. Attempt %d of %d\n\n", attempt - 1, maxAttempts);
    }
}

static int credentialsMatch(const char *username, const char *password) {
    return strcmp(username, ADMIN_USERNAME) == 0 &&
           strcmp(password, ADMIN_PASSWORD) == 0;
}

int adminLogin(void) {
    char username[MAX_USERNAME_LEN];
    char password[MAX_PASSWORD_LEN];
    int attempt;

    for (attempt = 1; attempt <= MAX_LOGIN_ATTEMPTS; attempt++) {
        printLoginPage(attempt, MAX_LOGIN_ATTEMPTS);

        readString("  Username : ", username, MAX_USERNAME_LEN);
        readPassword("  Password : ", password, MAX_PASSWORD_LEN);

        if (credentialsMatch(username, password)) {
            clearScreen();
            printf("================================================\n");
            printf("           LOGIN SUCCESSFUL - WELCOME!            \n");
            printf("================================================\n");
            printf("\n  Admin : %s\n", ADMIN_USERNAME);
            printf("  Access granted to Gas Agency Management System.\n");
            pauseScreen();
            return 1;
        }
    }

    clearScreen();
    printf("================================================\n");
    printf("              ACCESS DENIED                       \n");
    printf("================================================\n");
    printf("\n  Too many failed login attempts.\n");
    printf("  Please contact the system administrator.\n");
    pauseScreen();
    return 0;
}

const char *getAdminUsername(void) {
    return ADMIN_USERNAME;
}
