export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-default-500">{description}</p>
      ) : null}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-default-500">{description}</p>
      ) : null}
    </div>
  );
}
