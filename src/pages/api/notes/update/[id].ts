// pages/api/notes/update/[id].ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const noteId = req.query.id;

  const { title, text } = req.body;

  try {
    const updatedNote = await prisma.note.update({
      where: { id: Number(noteId) },
      data: { title, text },
    });

    return res.status(200).json(updatedNote);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update the note" });
  } finally {
    await prisma.$disconnect();
  }
}
