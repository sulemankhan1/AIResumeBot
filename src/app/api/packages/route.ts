import UserPackage, { UserPackageData } from "@/db/schemas/UserPackage";
import startDB from "@/lib/db";
import { getServerSession } from "next-auth";

import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
export async function POST(request: any) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { result: "Not Authorised", success: false },
      { status: 401 }
    );
  }

  try {
    await startDB();
    const payload = await request.json();
    let userPackage = new UserPackage(payload);
    const response = await userPackage.save();
    console.log(response);
    return NextResponse.json(
      { result: response, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { result: "Internal Server Error", success: false },
      { status: 404 }
    );
  }
}

export async function GET(request: any) {
  try {
    await startDB();
    const packages = await UserPackage.find();
    return NextResponse.json(
      { success: true, result: packages },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { result: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
