import UserPackage from "@/db/schemas/UserPackage";
import startDB from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic";

export async function GET(req: any) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { result: `Not Authorised`, success: false },
      { status: 401 }
    );
  }
  try {
    const url = new URL(req.url);

    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          result: "Bad Request: No email found",
        },
        { status: 400 }
      );
    }

    await startDB();

    const userPackage = await UserPackage.findById(id);

    if (!userPackage) {
      return NextResponse.json(
        {
          result: "No User Package Found",
          success: false,
        },
        { status: 404 }
      );
    } else {
      return NextResponse.json(
        {
          result: userPackage,
          success: true,
        },
        { status: 200 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        result: "Something Went Wrong",
        success: false,
      },
      { status: 500 }
    );
  }
}
