import { TableCell, TableRow } from "../ui/table";
import { Skeleton } from "../ui/skeleton";

interface AdminTableSkeletonProps {
  columns: number;
  rows?: number;
}

export function AdminTableSkeleton({ columns, rows = 5 }: AdminTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

