/** Server-side Stripe entitlement and purchase helpers. */
import type Stripe from "stripe";
import { tierFromPriceId, type PaidTier } from "@/lib/stripe-server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type EntitlementTier="spark"|PaidTier;
export type EntitlementStatus="none"|"active"|"trialing"|"past_due"|"canceled"|"unpaid"|"incomplete";
export function isUuid(value:string|null|undefined):value is string{return Boolean(value&&UUID_RE.test(value));}
export function resolveLivvUserId(input:{metadata?:Stripe.Metadata|null;clientReferenceId?:string|null}):string|null{const fromMeta=input.metadata?.livv_user_id;if(isUuid(fromMeta))return fromMeta;if(isUuid(input.clientReferenceId))return input.clientReferenceId;return null;}
export function mapSubscriptionStatus(status:Stripe.Subscription.Status):EntitlementStatus{switch(status){case"active":return"active";case"trialing":return"trialing";case"past_due":return"past_due";case"canceled":return"canceled";case"unpaid":return"unpaid";case"incomplete":case"incomplete_expired":return"incomplete";case"paused":return"unpaid";default:return"none";}}
export function tierFromSubscription(sub:Stripe.Subscription):EntitlementTier{const fromMeta=sub.metadata?.livv_tier as PaidTier|undefined;if(fromMeta==="rise"||fromMeta==="apex"||fromMeta==="circle")return fromMeta;return tierFromPriceId(sub.items.data[0]?.price?.id)||"spark";}
export function effectiveTier(status:EntitlementStatus,mappedTier:EntitlementTier):EntitlementTier{return status==="active"||status==="trialing"||status==="past_due"?mappedTier:"spark";}
export async function claimWebhookEvent(eventId:string,eventType:string):Promise<"claimed"|"processed"|"busy">{
 const admin=getSupabaseAdmin(); if(!admin) throw new Error("Supabase admin client unavailable");
 const { error } = await admin.from("stripe_webhook_events").insert({event_id:eventId,event_type:eventType,status:"processing",claimed_at:new Date().toISOString()});
 if(!error) return "claimed";
 if(error.code!=="23505") throw error;
 const { data } = await admin.from("stripe_webhook_events").select("status,claimed_at").eq("event_id",eventId).maybeSingle();
 if(!data) return "busy";
 if(data.status==="processed") return "processed";
 const claimedAt=data.claimed_at ? new Date(data.claimed_at).getTime() : 0;
 if(claimedAt && Date.now()-claimedAt < 5*60*1000) return "busy";
 const { data: reclaimed } = await admin.from("stripe_webhook_events").update({status:"processing",claimed_at:new Date().toISOString()}).eq("event_id",eventId).eq("status","processing").lt("claimed_at",new Date(Date.now()-5*60*1000).toISOString()).select("event_id").maybeSingle();
 return reclaimed?.event_id ? "claimed" : "busy";
}
export async function markWebhookEventProcessed(eventId:string):Promise<void>{
 const admin=getSupabaseAdmin(); if(!admin) throw new Error("Supabase admin client unavailable");
 const { error } = await admin.from("stripe_webhook_events").update({status:"processed",processed_at:new Date().toISOString(),claimed_at:null}).eq("event_id",eventId);
 if(error) throw error;
}
export async function upsertEntitlement(row:{userId:string;tier:EntitlementTier;status:EntitlementStatus;stripeCustomerId?:string|null;stripeSubscriptionId?:string|null;currentPeriodEnd?:string|null;}){const admin=getSupabaseAdmin();if(!admin)throw new Error("Supabase admin client unavailable");const{error}=await admin.from("entitlements").upsert({user_id:row.userId,tier:row.tier,status:row.status,stripe_customer_id:row.stripeCustomerId||null,stripe_subscription_id:row.stripeSubscriptionId||null,current_period_end:row.currentPeriodEnd||null,source:"stripe",updated_at:new Date().toISOString()},{onConflict:"user_id"});if(error)throw error;}
export async function findUserIdBySubscriptionId(subscriptionId:string):Promise<string|null>{const admin=getSupabaseAdmin();if(!admin)return null;const{data,error}=await admin.from("entitlements").select("user_id").eq("stripe_subscription_id",subscriptionId).maybeSingle();if(error)return null;return data?.user_id??null;}
export async function findUserIdByCustomerId(customerId:string):Promise<string|null>{const admin=getSupabaseAdmin();if(!admin)return null;const{data,error}=await admin.from("entitlements").select("user_id").eq("stripe_customer_id",customerId).maybeSingle();if(error)return null;return data?.user_id??null;}