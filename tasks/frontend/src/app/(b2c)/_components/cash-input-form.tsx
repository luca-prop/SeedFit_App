"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CashInputForm() {
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(Number(rawValue))) {
      setValue(Number(rawValue).toLocaleString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cash = value.replace(/,/g, "");
    if (cash) {
      router.push(`/search?cash=${cash}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="relative">
        <ShadcnInput
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="가용 현금을 입력하세요 (예: 300,000,000)"
          className="text-lg py-6 pr-12 text-center"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          원
        </span>
      </div>
      <Button type="submit" className="w-full py-6 text-lg font-bold">
        검색하기
      </Button>
    </form>
  );
}
