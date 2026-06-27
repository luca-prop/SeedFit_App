export function KeyValueSpec({ label, value }: { label: string; value: string | string[] | null | undefined }) {
  const values = Array.isArray(value) ? value : value ? [value] : ["미기재"];

  return (
    <div className="grid gap-2 border-b border-slate-100 py-3 text-sm md:grid-cols-[10rem_1fr]">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="space-y-1 text-slate-800">
        {values.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </dd>
    </div>
  );
}

