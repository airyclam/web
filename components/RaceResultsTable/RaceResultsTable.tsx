import { ColumnDef, Row } from "@tanstack/react-table";
import { Table } from "components/Table/Table";
import {
  PoliticalScope,
  RaceResult,
  State,
  useRaceIndexQuery,
} from "generated";
import useDebounce from "hooks/useDebounce";
import { Theme } from "hooks/useTheme";
import { useRouter } from "next/router";
import { HTMLProps, useEffect, useMemo, useRef } from "react";
import { dateString } from "utils/dates";
import { titleCase } from "utils/strings";

function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
}

export function RaceResultsTable({
  theme = "aqua",
  multiSelect = false,
  selectedRows = [],
}: {
  theme?: Theme;
  multiSelect?: boolean;
  selectedRows?: string[];
}) {
  const router = useRouter();
  const { query } = router;
  const { state, search, selected, scope } = query;
  const debouncedSearchQuery = useDebounce<string | null>(
    search as string,
    350
  );
  const shouldFetchRaceResults = !!debouncedSearchQuery || !!state || !!scope;

  const { data } = useRaceIndexQuery(
    {
      pageSize: 250,
      filter: {
        query: debouncedSearchQuery || null,
        state: state === "" ? null : (state as State) ?? null,
        politicalScope: scope as string as PoliticalScope,
      },
    },
    {
      refetchOnWindowFocus: false,
      enabled: shouldFetchRaceResults,
    }
  );

  const raceResults = useMemo(
    () => data?.races.edges.map((edge) => edge.node) || [],
    [data?.races.edges]
  ) as RaceResult[];

  const columns = useMemo<ColumnDef<RaceResult>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked:
                  row.getIsSelected() || selectedRows.includes(row.original.id),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },
      {
        accessorKey: "office.name",
        header: "Office",
        size: 300,
      },
      {
        accessorKey: "party",
      },
      {
        accessorKey: "office.subtitle",
        header: "Location",
        size: 300,
      },
      {
        accessorKey: "raceType",
        header: "Type",
        cell: (info) => {
          const raceType = info.getValue() as string;
          const party = (info.row.getValue("party") as { name: string })?.name;
          return titleCase(`${raceType} ${party ? "- " + party : ""}`);
        },
      },
      {
        accessorKey: "electionDate",
        header: "Date",
        cell: (info) => dateString(info.getValue() as string, true),
      },
    ],
    []
  );

  const onRowClick = (row: Row<RaceResult>) => {
    if (multiSelect) {
      row.toggleSelected();
    } else {
      void router.replace(
        {
          query: { ...query, selected: row.original.id },
        },
        undefined,
        {
          scroll: false,
          shallow: true,
        }
      );
    }
  };

  if (raceResults.length == 0) return null;

  return (
    <>
      <Table
        data={raceResults}
        columns={columns}
        initialState={{
          pagination: {
            pageSize: 5,
          },
          columnVisibility: {
            select: multiSelect,
            party: false,
          },
        }}
        theme={theme}
        onRowClick={onRowClick}
        selectedRowId={selected as string}
      />
    </>
  );
}
