import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { title, text } = req.body;

    if (!title || !text) {
      return res.status(400).json({ error: "Title and body are required" });
    }
    try {
      const newNote = await prisma.note.create({
        data: {
          title,
          text,
          updatedAt: new Date(),
        },
      });

      return res.status(201).json(newNote);
    } catch (error) {
      return res.status(500).json({ error: "Error creating note" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
