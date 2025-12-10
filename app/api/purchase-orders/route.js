import { dbConnect } from "../../../lib/dbConnect";
import PurchaseOrder from "../../../models/PurchaseOrder";
import { verifyTokenFromReq } from "../../../lib/auth";
import ActivityLog from "../../../models/ActivityLog";

export async function GET(req) {
  await dbConnect();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const query = status ? { status } : {};
  const pos = await PurchaseOrder.find(query).sort({ createdAt: -1 }).populate("createdBy", "name email");
  return new Response(JSON.stringify(pos), { status: 200 });
}

export async function POST(req) {
  await dbConnect();
  try {
    const user = verifyTokenFromReq(req, "admin"); // only admin create PO
    const body = await req.json(); // { supplierName, supplierContact, lines: [...] }

    // calculate totalCost
    let total = 0;
    (body.lines || []).forEach(l => {
      total += (l.unitCost || 0) * (l.qtyOrdered || 0);
    });

    const po = await PurchaseOrder.create({
      supplierName: body.supplierName,
      supplierContact: body.supplierContact,
      lines: body.lines,
      totalCost: total,
      createdBy: user.id,
      notes: body.notes || ""
    });

    await ActivityLog.create({ userId: user.id, action: "create_po", meta: { poId: po._id } });
    return new Response(JSON.stringify(po), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: err.status || 500 });
  }
}
