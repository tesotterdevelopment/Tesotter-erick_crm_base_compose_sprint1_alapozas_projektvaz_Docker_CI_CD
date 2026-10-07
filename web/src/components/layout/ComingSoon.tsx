interface ComingSoonProps {
  /** Jira ticket that will implement the page, e.g. "TCRM-112". */
  ticket: string;
  sprint: number;
}

// Temporary placeholder for pages scheduled in later sprints.
export function ComingSoon({ ticket, sprint }: ComingSoonProps) {
  return (
    <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted">
      Ez az oldal a {sprint}. sprintben készül el ({ticket}).
    </div>
  );
}
