export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-white text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground">🚧 Coming Soon</p>
    </div>
  );
}