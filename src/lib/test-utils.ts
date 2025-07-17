import { NextResponse } from "next/server";

export const runHandler = async (handler: () => Promise<NextResponse>) => {
  const res = await handler();
  return res.json();
};
