-- CreateTable
CREATE TABLE "CallReservation" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "reservationDate" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "phoneNumber" TEXT,
    "callSid" TEXT,
    "callDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CallReservation_username_idx" ON "CallReservation"("username");

-- CreateIndex
CREATE INDEX "CallReservation_reservationDate_startTime_idx" ON "CallReservation"("reservationDate", "startTime");

-- CreateIndex
CREATE INDEX "CallReservation_status_idx" ON "CallReservation"("status");
