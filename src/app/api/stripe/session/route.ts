import { NextRequest, NextResponse } from "next/server";
import { getStripe, tierFromPriceId, type PaidTier } from "@/lib/stripe-server";
import { getVerifiedSupabaseUser, isSupabaseServerConfigured } from "@/lib/supabase/server-auth";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/stripe-entitlements";

export const runtime = "nodejs";
function json(data: unknown, init?: ResponseInit) { return NextResponse.json(data, { ...init, headers: { "Cache-Control": "no-store", ...(init?.headers || {}) } }); }

export async function GET(req: NextRequest) {
  try {
    const stripe=getStripe(); if(!stripe)return json({error:"Stripe not configured"},{status:503});
    const sessionId=req.nextUrl.searchParams.get("session_id");
    if(!sessionId)return json({error:"Missing session_id"},{status:400});
    if(sessionId.length>255||!/^cs_[A-Za-z0-9_]+$/.test(sessionId))return json({error:"Invalid checkout session"},{status:400});
    let verifiedUserId:string|null=null;
    if(isSupabaseServerConfigured()){
      const verified=await getVerifiedSupabaseUser(req);
      if(!verified)return json({error:"Authenticated session required"},{status:401});
      if(verified.isAnonymous)return json({error:"Verify your email before confirming payment"},{status:403});
      verifiedUserId=verified.id;
    }
    const session=await stripe.checkout.sessions.retrieve(sessionId,{expand:["subscription","line_items"]});
    if(session.payment_status!=="paid"&&session.status!=="complete")return json({error:"Payment not complete",status:session.status},{status:402});
    if(verifiedUserId){const boundId=session.metadata?.livv_user_id||session.client_reference_id;if(!isUuid(boundId)||boundId!==verifiedUserId)return json({error:"Checkout session does not belong to this account"},{status:403});}
    if(session.metadata?.livv_kind==="pack"){
      if(session.payment_status!=="paid")return json({error:"Pack payment not complete"},{status:402});
      if(isSupabaseAdminConfigured()&&verifiedUserId){
        const admin=getSupabaseAdmin();
        const {data:p,error}=await admin?.from("pack_purchases").select("grade,quantity,status").eq("stripe_session_id",session.id).eq("user_id",verifiedUserId).maybeSingle()??{data:null,error:null};
        if(error||!p||p.status!=="paid")return json({error:"Pack purchase is still being confirmed"},{status:409});
        return json({kind:"pack",grade:p.grade,qty:p.quantity,customerId:typeof session.customer==="string"?session.customer:session.customer?.id,email:session.customer_details?.email||session.customer_email});
      }
      return json({error:"Pack confirmation unavailable"},{status:503});
    }
    if(session.subscription&&typeof session.subscription!=="string"){const invalid=new Set(["canceled","unpaid","incomplete","incomplete_expired","paused"]);if(invalid.has(session.subscription.status))return json({error:"Subscription is not active"},{status:402});}
    let tier=(session.metadata?.livv_tier as PaidTier|undefined)||null;
    if(!tier&&session.subscription&&typeof session.subscription!=="string")tier=tierFromPriceId(session.subscription.items.data[0]?.price?.id);
    if(!tier){const linePrice=session.line_items?.data?.[0]?.price?.id;tier=tierFromPriceId(linePrice||null);}
    if(!tier)return json({error:"Could not resolve purchase"},{status:422});
    return json({kind:"tier",tier,customerId:typeof session.customer==="string"?session.customer:session.customer?.id,subscriptionId:typeof session.subscription==="string"?session.subscription:session.subscription?.id,email:session.customer_details?.email||session.customer_email});
  }catch(err){console.error("[stripe/session]",err instanceof Error?err.message:err);return json({error:"Could not confirm this payment session."},{status:500});}
}
