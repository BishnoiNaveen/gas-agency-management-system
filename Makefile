CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -Iinclude
SRC = src/main.c src/utils.c src/auth.c src/dashboard.c src/delivery.c src/customer.c src/cylinder.c src/booking.c src/billing.c
TARGET = gas_agency.exe
OUTDIR = bin

all: $(OUTDIR)/$(TARGET)

$(OUTDIR)/$(TARGET): $(SRC) | $(OUTDIR)
	$(CC) $(CFLAGS) -o $(OUTDIR)/$(TARGET) $(SRC)

$(OUTDIR):
	mkdir $(OUTDIR)

run: all
	$(OUTDIR)/$(TARGET)

clean:
ifeq ($(OS),Windows_NT)
	if exist $(OUTDIR) rmdir /s /q $(OUTDIR)
else
	rm -rf $(OUTDIR)
endif

.PHONY: all run clean
