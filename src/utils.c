#include "../include/common.h"
#include "../include/customer.h"
#include "../include/booking.h"
#include "../include/billing.h"

#ifdef _WIN32
#include <windows.h>
#include <conio.h>
#else
#include <unistd.h>
#endif

void clearInputBuffer(void) {
    int c;
    while ((c = getchar()) != '\n' && c != EOF) {
        /* discard remaining input */
    }
}

void pauseScreen(void) {
    printf("\nPress Enter to continue...");
    clearInputBuffer();
    getchar();
}

void clearScreen(void) {
#ifdef _WIN32
    system("cls");
#else
    system("clear");
#endif
}

int readInt(const char *prompt, int min, int max) {
    int value;
  char line[32];

    while (1) {
        printf("%s", prompt);
        if (!fgets(line, sizeof(line), stdin)) {
            continue;
        }

        if (sscanf(line, "%d", &value) != 1) {
            printf("Invalid input. Please enter a number.\n");
            continue;
        }

        if (value < min || value > max) {
            printf("Value must be between %d and %d.\n", min, max);
            continue;
        }

        return value;
    }
}

double readDouble(const char *prompt, double min) {
    double value;
    char line[32];

    while (1) {
        printf("%s", prompt);
        if (!fgets(line, sizeof(line), stdin)) {
            continue;
        }

        if (sscanf(line, "%lf", &value) != 1) {
            printf("Invalid input. Please enter a valid amount.\n");
            continue;
        }

        if (value < min) {
            printf("Amount must be at least %.2f.\n", min);
            continue;
        }

        return value;
    }
}

void readString(const char *prompt, char *buffer, int maxLen) {
    while (1) {
        printf("%s", prompt);
        if (!fgets(buffer, maxLen, stdin)) {
            continue;
        }

        buffer[strcspn(buffer, "\n")] = '\0';

        if (strlen(buffer) == 0) {
            printf("This field cannot be empty.\n");
            continue;
        }

        return;
    }
}

void readPassword(const char *prompt, char *buffer, int maxLen) {
    int i = 0;
    int ch;

    while (1) {
        i = 0;
        printf("%s", prompt);

#ifdef _WIN32
        while (i < maxLen - 1) {
            ch = _getch();
            if (ch == '\r' || ch == '\n') {
                break;
            }
            if (ch == '\b' || ch == 127) {
                if (i > 0) {
                    i--;
                    printf("\b \b");
                }
                continue;
            }
            buffer[i++] = (char)ch;
            printf("*");
        }
#else
        if (!fgets(buffer, maxLen, stdin)) {
            continue;
        }
        buffer[strcspn(buffer, "\n")] = '\0';
        i = (int)strlen(buffer);
#endif
        buffer[i] = '\0';
        printf("\n");

        if (i == 0) {
            printf("Password cannot be empty.\n");
            continue;
        }

        return;
    }
}

void readPhone(const char *prompt, char *buffer, int maxLen) {
    int i;
    int digits;

    while (1) {
        readString(prompt, buffer, maxLen);

        if (strlen(buffer) != 10) {
            printf("Phone number must be exactly 10 digits.\n");
            continue;
        }

        digits = 1;
        for (i = 0; buffer[i] != '\0'; i++) {
            if (!isdigit((unsigned char)buffer[i])) {
                digits = 0;
                break;
            }
        }

        if (!digits) {
            printf("Phone number must contain digits only.\n");
            continue;
        }

        return;
    }
}

int generateId(const char *filename) {
    FILE *fp = fopen(filename, "rb");
    int id = 1;
    int tempId;

    if (!fp) {
        return id;
    }

    if (strstr(filename, "customers") != NULL) {
        Customer record;
        while (fread(&record, sizeof(Customer), 1, fp) == 1) {
            if (record.id >= id) {
                id = record.id + 1;
            }
        }
    } else if (strstr(filename, "bookings") != NULL) {
        Booking record;
        while (fread(&record, sizeof(Booking), 1, fp) == 1) {
            if (record.id >= id) {
                id = record.id + 1;
            }
        }
    } else if (strstr(filename, "bills") != NULL) {
        Bill record;
        while (fread(&record, sizeof(Bill), 1, fp) == 1) {
            if (record.id >= id) {
                id = record.id + 1;
            }
        }
    } else {
        while (fread(&tempId, sizeof(int), 1, fp) == 1) {
            if (tempId >= id) {
                id = tempId + 1;
            }
        }
    }

    fclose(fp);
    return id;
}

int ensureDataDirectory(void) {
#ifdef _WIN32
    return system("if not exist data mkdir data") == 0 || system("mkdir data 2>nul") == 0;
#else
    return system("mkdir -p data") == 0;
#endif
}

void ensureReportsDirectory(void) {
    ensureDataDirectory();
#ifdef _WIN32
    system("if not exist data\\reports mkdir data\\reports");
#else
    system("mkdir -p data/reports");
#endif
}
