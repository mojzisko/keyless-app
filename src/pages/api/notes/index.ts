import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const notes = await prisma.note.findMany();
    const serializedNotes = notes.map((note) => ({
      ...note,
      updatedAt: note.updatedAt.toISOString(),
    }));
    res.status(200).json(serializedNotes);
  } catch (error) {
    console.error("Error fetching notes: ", error);
    res.status(500).json({ error: "Error fetching notes" });
  } finally {
    await prisma.$disconnect();
  }
}
