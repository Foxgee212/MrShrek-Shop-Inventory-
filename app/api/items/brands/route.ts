import { dbConnect } from "../../../../lib/dbConnect";
import Item from "../../../../models/Item";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    await dbConnect();

    const brands = await Item.distinct("brand", { category })

    return NextResponse.json(brands);
}