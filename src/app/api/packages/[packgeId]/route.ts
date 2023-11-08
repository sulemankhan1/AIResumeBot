import UserPackage from "@/db/schemas/UserPackage";
import startDB from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: any,
  { params }: { params: { packgeId: string } }
) {
  const packgeId = params.packgeId;
  const payload = await req.json();

  console.log(packgeId);

  try {
    await startDB();

    let userPackage = await UserPackage.findOneAndUpdate(
      { _id: packgeId },
      payload,
      { new: true }
    );

    return NextResponse.json({ result: userPackage, success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { result: "Internal Server Error", success: false },
      { status: 404 }
    );
  }
}

export async function DELETE(
  req: any,
  { params }: { params: { packgeId: string } }
) {
  const packgeId = params.packgeId;
  try {
    await startDB();
    let userPackage = await UserPackage.findByIdAndDelete(
      { _id: packgeId },
      {}
    );
    return NextResponse.json({ result: userPackage, success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { result: "Internal Server Error", success: false },
      { status: 404 }
    );
  }
}