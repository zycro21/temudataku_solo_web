interface Props {
  status: "Published" | "Archived";
}

export default function StatusBadge({ status }: Props) {
  if (status === "Published") {
    return (
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-600">
        Published
      </span>
    );
  }

  return (
    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
      Archived
    </span>
  );
}