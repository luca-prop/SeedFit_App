import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  SECRET_B2B: z.string().min(1, "SECRET_B2B is required"),
  SECRET_ADMIN: z.string().min(1, "SECRET_ADMIN is required"),
  MOLIT_API_KEY: z.string().min(1, "MOLIT_API_KEY is required"),
  SLACK_WEBHOOK_URL: z.string().optional(),
  PLAYBOARD_ENABLED: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_AMPLITUDE_API_KEY: z.string().optional(),
});

// process.env를 파싱하여 검증합니다.
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  SECRET_B2B: process.env.SECRET_B2B,
  SECRET_ADMIN: process.env.SECRET_ADMIN,
  MOLIT_API_KEY: process.env.MOLIT_API_KEY,
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
  PLAYBOARD_ENABLED: process.env.PLAYBOARD_ENABLED,
  NEXT_PUBLIC_AMPLITUDE_API_KEY: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
};

// 클라이언트 사이드에서는 서버 변수에 접근하면 안 되므로, 서버 사이드에서만 검증하도록 처리
type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

let env: Partial<ServerEnv> & ClientEnv;

if (typeof window === "undefined") {
  // 서버 사이드: 서버 및 클라이언트 변수 모두 검증
  const parsed = z.intersection(serverSchema, clientSchema).safeParse(processEnv);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  
  env = parsed.data;
} else {
  // 클라이언트 사이드: 클라이언트 변수만 검증
  const parsed = clientSchema.safeParse(processEnv);

  if (!parsed.success) {
    console.error("❌ Invalid client environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid client environment variables");
  }

  // 클라이언트에서는 서버 변수 타입은 유지하되 실제 값은 undefined가 됨
  env = parsed.data;
}

export { env };
