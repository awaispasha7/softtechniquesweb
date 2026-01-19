import { NextRequest, NextResponse } from "next/server";
import { hasCredits, useCredit as deductCredit } from "@/lib/creditServiceAdmin";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    console.log('[Deduct Credit] Received request for userId:', userId);

    // Check authentication
    if (!userId || typeof userId !== "string") {
      console.error('[Deduct Credit] Missing or invalid userId');
      return NextResponse.json(
        { error: "Authentication required. Please sign in to analyze videos." },
        { status: 401 }
      );
    }

    // Initialize Firebase Admin and verify user exists
    let userDoc;
    try {
      const adminDb = getAdminDb();
      userDoc = await adminDb.collection('users').doc(userId).get();
    } catch (adminError) {
      console.error('[Deduct Credit] Firebase Admin initialization error:', adminError);
      const errorMessage = adminError instanceof Error ? adminError.message : 'Unknown error';
      return NextResponse.json(
        { 
          error: "Server configuration error. Please contact support.",
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }

    if (!userDoc.exists) {
      console.error('[Deduct Credit] User not found:', userId);
      return NextResponse.json(
        { error: "User not found. Please sign in again." },
        { status: 401 }
      );
    }

    // Check if user has credits
    let hasCredit;
    try {
      hasCredit = await hasCredits(userId);
    } catch (creditCheckError) {
      console.error('[Deduct Credit] Error checking credits:', creditCheckError);
      return NextResponse.json(
        { 
          error: "Error checking credits. Please try again.",
          details: process.env.NODE_ENV === 'development' ? (creditCheckError instanceof Error ? creditCheckError.message : 'Unknown error') : undefined
        },
        { status: 500 }
      );
    }

    if (!hasCredit) {
      console.log('[Deduct Credit] User has no credits:', userId);
      return NextResponse.json(
        { error: "You have no credits remaining. Please contact support to add more credits." },
        { status: 403 }
      );
    }

    // Use a credit before processing
    let creditUsed;
    try {
      creditUsed = await deductCredit(userId);
    } catch (creditUseError) {
      console.error('[Deduct Credit] Error using credit:', creditUseError);
      return NextResponse.json(
        { 
          error: "Failed to use credit. Please try again.",
          details: process.env.NODE_ENV === 'development' ? (creditUseError instanceof Error ? creditUseError.message : 'Unknown error') : undefined
        },
        { status: 500 }
      );
    }

    if (!creditUsed) {
      console.error('[Deduct Credit] Credit use returned false:', userId);
      return NextResponse.json(
        { error: "Failed to use credit. Please try again." },
        { status: 500 }
      );
    }

    console.log('[Deduct Credit] Successfully deducted credit for userId:', userId);
    return NextResponse.json({ success: true, message: "Credit deducted successfully" });
  } catch (err) {
    console.error("[Deduct Credit] Unexpected error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const errorStack = err instanceof Error ? err.stack : undefined;
    console.error("[Deduct Credit] Error stack:", errorStack);
    
    return NextResponse.json(
      { 
        error: "Unexpected server error.",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
