import { dbConnect } from "../../../../lib/dbConnect";
import Item from "../../../../models/Item";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const cats = await Item.distinct("category");

  return NextResponse.json(cats);
};