import { Request, Response } from "express";
import prisma from "../utils/prisma";
import logger from "../utils/logger";

// Standard error handler to reduce code duplication
const handleError = (res: Response, error: unknown, message: string) => {
  logger.error(message, error);
  return res.status(500).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : String(error),
  });
};

/**
 * Create a new call reservation
 */
export const createReservation = async (req: Request, res: Response) => {
  try {
    const { username, reservationDate, startTime, endTime, phoneNumber } =
      req.body;

    // Basic validation
    if (!username || !reservationDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: username, reservationDate, startTime, and endTime are required",
      });
    }

    // Create reservation
    const reservation = await prisma.callReservation.create({
      data: {
        username,
        reservationDate,
        startTime,
        endTime,
        phoneNumber,
      },
    });

    logger.info(
      `Created reservation for ${username} on ${reservationDate} at ${startTime}-${endTime}`
    );

    return res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create reservation");
  }
};

/**
 * Get all reservations for a username
 */
export const getUserReservations = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const reservations = await prisma.callReservation.findMany({
      where: {
        username,
      },
      orderBy: {
        reservationDate: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch reservations");
  }
};

/**
 * Get a specific reservation by ID
 */
export const getReservationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // More robust validation and parsing for the ID parameter
    if (!id) {
      logger.error("Missing ID parameter in getReservationById");
      return res.status(400).json({
        success: false,
        message: "Missing ID parameter",
      });
    }

    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      logger.error(`Invalid ID format in getReservationById: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid ID format - must be a number",
      });
    }

    logger.info(`Fetching reservation with ID: ${parsedId}`);

    const reservation = await prisma.callReservation.findUnique({
      where: {
        id: parsedId,
      },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch reservation");
  }
};

/**
 * Update a reservation's status or other details
 */
export const updateReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, callDuration, ...otherData } = req.body;
    const parsed_id = parseInt(id);

    // Log the update data for debugging
    logger.info(
      `Updating reservation ${id} with status: ${status}, callDuration: ${callDuration}`
    );

    const reservation = await prisma.callReservation.update({
      where: {
        id: parsed_id,
      },
      data: {
        status,
        callDuration,
        ...otherData,
      },
    });

    logger.info(`Reservation ${id} updated to status: ${reservation.status}`);

    return res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update reservation");
  }
};

/**
 * Update reservations that are past their end time but still marked as ongoing
 */
export const updateExpiredReservations = async (
  req: Request,
  res: Response
) => {
  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    logger.info(`Checking for expired reservations at ${today} ${currentTime}`);

    // Find all reservations that are ongoing but past their end time
    const expiredReservations = await prisma.callReservation.findMany({
      where: {
        status: "ongoing",
        OR: [
          // Past reservation dates
          {
            reservationDate: {
              lt: today,
            },
          },
          // Today but past end time
          {
            reservationDate: today,
            endTime: {
              lt: currentTime,
            },
          },
        ],
      },
    });

    logger.info(
      `Found ${expiredReservations.length} expired ongoing reservations`
    );

    if (expiredReservations.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No expired reservations found",
        data: [],
      });
    }

    // Update all expired reservations to completed status
    const updatedReservations = await Promise.all(
      expiredReservations.map(async (reservation) => {
        return prisma.callReservation.update({
          where: { id: reservation.id },
          data: {
            status: "completed",
            // Add default call duration if needed
            callDuration: reservation.callDuration || 0,
          },
        });
      })
    );

    logger.info(
      `Updated ${updatedReservations.length} expired reservations to completed status`
    );

    return res.status(200).json({
      success: true,
      message: `Updated ${updatedReservations.length} expired reservations`,
      data: updatedReservations,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update expired reservations");
  }
};
