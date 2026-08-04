import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    // En producción usaríamos const sig = req.headers.get('stripe-signature');
    // y stripe.webhooks.constructEvent(body, sig, endpointSecret);
    
    // Mock parse for demonstration
    const event = JSON.parse(body);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const invoiceId = paymentIntent.metadata?.invoiceId;
      const customerId = paymentIntent.metadata?.customerId;
      
      if (invoiceId && customerId) {
        // Registrar pago
        await prisma.payment.create({
          data: {
            invoiceId,
            customerId,
            amount: paymentIntent.amount / 100,
            method: "CREDIT_CARD",
            reference: paymentIntent.id,
            notes: "Pagado vía Stripe"
          }
        });
        
        // Actualizar estado de factura
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: "PAID" }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
