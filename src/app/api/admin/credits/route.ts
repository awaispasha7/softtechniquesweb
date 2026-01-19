import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addCredits, setCredits, setUnlimitedCredits } from "@/lib/creditService";

// Simple admin check - in production, use proper admin authentication
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

// GET: Get user credits
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const adminEmail = searchParams.get("adminEmail");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required." },
        { status: 400 }
      );
    }

    if (!adminEmail || !isAdmin(adminEmail)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    return NextResponse.json({
      userId,
      email: userData.email,
      displayName: userData.displayName,
      credits: userData.credits ?? 3,
      isUnlimited: userData.isUnlimited === true,
    });
  } catch (error: unknown) {
    console.error("Error getting user credits:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

// POST: Update user credits
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, value, adminEmail } = body ?? {};

    if (!userId || !action || !adminEmail) {
      return NextResponse.json(
        { error: "userId, action, and adminEmail are required." },
        { status: 400 }
      );
    }

    if (!isAdmin(adminEmail)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Verify user exists
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    switch (action) {
      case "add":
        if (typeof value !== "number") {
          return NextResponse.json(
            { error: "value must be a number for 'add' action." },
            { status: 400 }
          );
        }
        await addCredits(userId, value);
        return NextResponse.json({ success: true, message: `Added ${value} credits.` });

      case "set":
        if (typeof value !== "number") {
          return NextResponse.json(
            { error: "value must be a number for 'set' action." },
            { status: 400 }
          );
        }
        await setCredits(userId, value);
        return NextResponse.json({ success: true, message: `Set credits to ${value}.` });

      case "setUnlimited":
        if (typeof value !== "boolean") {
          return NextResponse.json(
            { error: "value must be a boolean for 'setUnlimited' action." },
            { status: 400 }
          );
        }
        await setUnlimitedCredits(userId, value);
        return NextResponse.json({ 
          success: true, 
          message: value ? "Set unlimited credits." : "Removed unlimited credits." 
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'add', 'set', or 'setUnlimited'." },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error("Error updating user credits:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

