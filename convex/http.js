import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();

      // Webhooks from Resend contain type and data
      if (payload && payload.type && payload.data && payload.data.email_id) {
        let status = "sent";
        const type = payload.type;

        if (type === "email.delivered") status = "delivered";
        else if (type === "email.opened") status = "opened";
        else if (type === "email.bounced") status = "bounced";
        else if (type === "email.complained") status = "complaint";
        
        // Let's only update if it is an event we care about that mutates the status forward
        if (type.startsWith("email.")) {
          await ctx.runMutation(api.emails.updateLogStatus, {
            resendId: payload.data.email_id,
            status: status,
          });
        }
      }

      return new Response(null, { status: 200 });
    } catch (err) {
      console.error("Webhook processing error:", err);
      return new Response("Webhook Error", { status: 400 });
    }
  }),
});

export default http;
