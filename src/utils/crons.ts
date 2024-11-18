import { green, red, stripAnsiCode } from "@std/fmt/colors";
import type { Cron, CronExecutionRetry } from "./api_types.ts";
import { renderTimeDelta } from "./time.ts";
export function renderCron(cron: Cron): string {
  return `${cron.cron_spec.name} [${cron.cron_spec.schedule}] ${
    renderCronStatus(cron)
  }`;
}

function renderCronStatus(cron: Cron): string {
  if (!cron.status) {
    return "n/a";
  }
  switch (cron.status.status) {
    case "unscheduled":
      return `${
        cron.history.length > 0
          ? `${renderLastCronExecution(cron.history[0][0])} `
          : ""
      }(unscheduled)`;
    case "executing":
      if (cron.status.retries.length > 0) {
        return `${
          renderLastCronExecution(cron.status.retries[0])
        } (retrying...)`;
      } else {
        return "(executing...)";
      }
    case "scheduled":
      return `${
        cron.history.length > 0
          ? `${renderLastCronExecution(cron.history[0][0])} `
          : ""
      }(next at ${
        new Date(cron.status.deadline_ms).toLocaleString(navigator.language, {
          timeZoneName: "short",
        })
      })`;
  }
}

function renderLastCronExecution(execution: CronExecutionRetry): string {
  const start = new Date(execution.start_ms);
  const end = new Date(execution.end_ms);
  const duration = end.getTime() - start.getTime();
  const status = execution.status === "success"
    ? green("succeeded")
    : execution.status === "failure"
    ? red("failed")
    : "executing";
  return `${status} at ${
    start.toLocaleString(navigator.language, { timeZoneName: "short" })
  } after ${stripAnsiCode(renderTimeDelta(duration))}`;
}
