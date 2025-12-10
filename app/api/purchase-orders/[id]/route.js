import { dbConnect } from "../../../../lib/dbConnect";
import PurchaseOrder from "../../../../models/PurchaseOrder";
import Item from "../../../../models/Item";
import ActivityLog from "../../../../models/ActivityLog";
import { verifyTokenFromReq } from "../../../../lib/auth";

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const po = await PurchaseOrder.findById(id).populate("createdBy", "name email");
  if (!po) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  return new Response(JSON.stringify(po), { status: 200 });
}

// PATCH used to update PO (e.g., change status to 'received' and qtyReceived)
export async function PATCH(req, { params }) {
  await dbConnect();
  try {
    const user = verifyTokenFromReq(req, "admin"); // only admin can receive/cancel
    const { id } = await params;
    const body = await req.json(); // { action: 'receive', lines: [{ lineIdx, qtyReceived }] } or general updates

    const po = await PurchaseOrder.findById(id);
    if (!po) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

    if (body.action === "receive") {
      // body.lines = [{ lineIdx, qtyReceived }] — we'll iterate and update stock
      for (const ln of body.lines) {
        const idx = ln.lineIdx;
        const receiveQty = Number(ln.qtyReceived || 0);
        if (receiveQty <= 0) continue;

        const line = po.lines[idx];
        if (!line) continue;

        // ensure not receiving more than ordered (optional: allow partial)
        const allowed = line.qtyOrdered - (line.qtyReceived || 0);
        const toReceive = Math.min(receiveQty, allowed);

        // update item stock
        if (toReceive > 0) {
          const item = await Item.findById(line.itemId);
          if (item) {
            item.stock = (item.stock || 0) + toReceive;
            await item.save();
          }
          // update po line received qty
          line.qtyReceived = (line.qtyReceived || 0) + toReceive;
        }
      }

      // if all lines fully received -> status = 'received'
      const allReceived = po.lines.every(l => (l.qtyReceived || 0) >= l.qtyOrdered);
      po.status = allReceived ? "received" : "ordered";
      po.receivedAt = new Date();
      await po.save();

      await ActivityLog.create({ userId: user.id, action: "receive_po", meta: { poId: po._id } });
      return new Response(JSON.stringify(po), { status: 200 });
    }

    // allow other updates like cancel
    if (body.action === "cancel") {
      po.status = "cancelled";
      await po.save();
      await ActivityLog.create({ userId: user.id, action: "cancel_po", meta: { poId: po._id } });
      return new Response(JSON.stringify(po), { status: 200 });
    }

    // generic patching
    Object.assign(po, body);
    await po.save();
    await ActivityLog.create({ userId: user.id, action: "update_po", meta: { poId: po._id } });
    return new Response(JSON.stringify(po), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: err.status || 500 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const user = verifyTokenFromReq(req, "admin");
    const { id } = params;
    const po = await PurchaseOrder.findById(id);
    if (!po) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    await PurchaseOrder.deleteOne({ _id: id });
    await ActivityLog.create({ userId: user.id, action: "delete_po", meta: { poId: id } });
    return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: err.status || 500 });
  }
}
