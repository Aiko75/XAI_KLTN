import { NextRequest } from "next/server";
import { GET as adminGet } from "../../../admin/export/route";

export async function GET(req: NextRequest) {
  return adminGet();
}
