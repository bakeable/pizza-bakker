import { NextRequest, NextResponse } from "next/server";

export const runHandler = async (handler: () => Promise<NextResponse>) => {
  const res = await handler();
  return res.json();
};

export const runPostHandler = async (
  handler: (request: NextRequest) => Promise<NextResponse>,
  body: object
) => {
  const request = new NextRequest("http://localhost:3000/test", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const res = await handler(request);
  return res.json();
};
