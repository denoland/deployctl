// deno-lint-ignore-file no-explicit-any
// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { Args } from "../args.ts";
import { API } from "../utils/api.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { wait } from "../utils/spinner.ts";
import {
  bgBrightGreen,
  Box,
  Computed,
  Frame,
  green,
  Label,
  Signal,
  Text,
  Tui,
} from "../../deps.ts";
import { satisfies } from "https://deno.land/std@0.170.0/semver/mod.ts";
import { LabelRectangle } from "https://deno.land/x/tui@2.1.6/src/components/label.ts";
import * as colors from "https://deno.land/std@0.170.0/fmt/colors.ts";
import { format } from "https://deno.land/std@0.170.0/fmt/duration.ts";
import {
  GridLayout,
  HorizontalLayout,
  VerticalLayout,
} from "https://deno.land/x/tui@2.1.6/mod.ts";
import {
  handleInput,
  handleKeyboardControls,
  handleMouseControls,
} from "https://deno.land/x/tui@2.1.6/mod.ts";
import {
  Table,
  TableUnicodeCharacters,
} from "https://deno.land/x/tui@2.1.6/src/components/table.ts";
import { bgRed } from "https://deno.land/std@0.97.0/fmt/colors.ts";

type SortKey = "reqs" | "cpu%" | "cpureq" | "rss" | "kv" | "queues";

export default async function topSubcommand(args: Args) {
  if (args.tui) {
    return await tui(args);
  } else {
    return await json(args);
  }
}

async function json(args: Args) {
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  const stats = await api.stream_metering(args.project!);
  for await (const stat of stats) {
    console.log(stat);
  }
}

async function tui(args: Args) {
  const regionTableHeight = new Signal(5);
  const sortBy = new Signal<SortKey>("reqs");
  let regionTableWidth = 0;
  const statusText = new Signal(`Connecting to ${args.project}...`);
  const error = new Signal("");
  let tui;
  try {
    tui = new Tui({ refreshRate: 1000 / 60 });
    handleInput(tui);
    handleMouseControls(tui);
    handleKeyboardControls(tui);

    tui.on("keyPress", ({ key, ctrl, shift, meta }) => {
      switch (key) {
        case "r":
          sortBy.value = "reqs";
          return;
        case "%":
          sortBy.value = "cpu%";
          return;
        case "c":
          sortBy.value = "cpureq";
          return;
        case "m":
          sortBy.value = "rss";
          return;
        case "k":
          sortBy.value = "kv";
          return;
        case "q":
          sortBy.value = "queues";
          return;
      }
    });
    const header = new Box({
      parent: tui,
      rectangle: new Computed(() => ({
        column: 0,
        row: 0,
        width: tui.rectangle.value.width,
        height: 1,
      })),
      zIndex: 0,
      theme: { base: (text) => colors.bgBrightGreen(colors.black(text)) },
    });
    new Text({
      parent: header,
      text: statusText,
      theme: { base: (text) => colors.bgBrightGreen(colors.black(text)) },
      zIndex: 1,
      rectangle: { column: 1, row: 0 },
    });
    const errorLabel = new Label({
      parent: tui,
      text: error,
      align: {
        vertical: "center",
        horizontal: "center",
      },
      theme: { base: (text) => colors.bgRed(colors.black(text)) },
      zIndex: 4,
      overwriteRectangle: true,
      rectangle: tui.rectangle,
    });
    new Box({
      parent: tui,
      theme: { base: colors.bgRed },
      zIndex: 3,
      rectangle: tui.rectangle,
      visible: new Computed(() => errorLabel.text.value !== ""),
    });
    new Label({
      parent: header,
      align: {
        vertical: "center",
        horizontal: "right",
      },
      text:
        "Press (key) to sort by: Req/min (r) | CPU% (%) | CPU/req (c) | RSS/5min (m) | KV/min (k) | Qs/min (q)",
      theme: { base: (text) => colors.bgBrightGreen(colors.black(text)) },
      zIndex: 2,
      overwriteRectangle: true,
      rectangle: header.rectangle,
    });
    const mainBox = new Box({
      parent: tui,
      theme: {},
      zIndex: 0,
      rectangle: new Computed(() => ({
        row: 2,
        column: 1,
        width: tui.rectangle.value.width - 2,
        height: tui.rectangle.value.height - 3,
      })),
    });
    const api = args.token
      ? API.fromToken(args.token)
      : API.withTokenProvisioner(TokenProvisioner);
    const meteringItems = await api.stream_metering(args.project!);
    statusText.value = `Connected to ${args.project}. Waiting for data...`;
    tui.dispatch();
    tui.run();
    let lastUpdate;
    setInterval(() => {
      if (lastUpdate) {
        const secs = ((new Date() - lastUpdate) / 1000).toFixed(0);
        if (secs > 10) {
          statusText.value = `Last updated ${secs}s ago`;
        }
      }
    }, 500);
    const layout = new Signal([], {
      deepObserve: true,
      watchObjectIndex: true,
    });
    const regions: {
      [region: string]: {
        instances: Signal<{
          [instance: string]: { ts: Date; item: any };
        }>;
      };
    } = {};
    for await (const item of meteringItems) {
      lastUpdate = new Date();
      let region = regions[item.region];
      if (region) {
        region.instances.value[item.runner] = {
          ts: lastUpdate,
          item,
        };
      } else {
        region = regions[item.region] = {
          instances: new Signal({
            [item.runner]: {
              ts: lastUpdate,
              item,
            },
          }, { deepObserve: true, watchObjectIndex: true }),
        };
        layout.value.push(item.region);

        const regionTable = new Table({
          parent: tui,
          theme: {
            frame: {},
            header: {},
            selectedRow: { base: (text) => colors.bgBlue(colors.black(text)) },
          },
          zIndex: 0,
          // Hack to workaround bug in Tui
          // (deepObserve in the TableUnicodeCharacters fail with TypeError: Cannot redefine property: Symbol(connected_signal))
          charMap: new Signal(TableUnicodeCharacters.sharp),
          //   charMap: "sharp",
          headers: [
            {
              title: "Req/min".padStart(7, " "),
            },
            {
              title: "CPU%".padStart(7, " "),
            },
            {
              title: "CPU/req".padStart(8, " "),
            },
            {
              title: "RSS/5min".padStart(9, " "),
            },
            {
              title: "KV/min".padStart(9, " "),
            },
            {
              title: "Qs/min".padStart(9, " "),
            },
          ],
          data: new Computed(() => {
            const data = [];
            const instances = Object.values(region.instances.value);
            const sortKey = sortBy.value;
            instances.sort(({ item: a }, { item: b }) => {
              switch (sortKey) {
                case "reqs":
                  return b.rpm - a.rpm;
                case "cpu%":
                  return b.cpuTimePerSecond - a.cpuTimePerSecond;
                case "cpureq":
                  return b.cpuTimePerRequest - a.cpuTimePerRequest;
                case "rss":
                  return b.maxRssMemory5Minutes - a.maxRssMemory5Minutes;
                case "kv":
                  return (b.kvReadUnitsPerMinute + b.kvWriteUnitsPerMinute) -
                    (a.kvReadUnitsPerMinute + a.kvWriteUnitsPerMinute);
                case "queues":
                  return (b.queueEnqueuePerMinute + b.queueDequeuePerMinute) -
                    (a.queueEnqueuePerMinute + a.queueDequeuePerMinute);
              }
            });
            for (const { item } of instances) {
              data.push([
                item.rpm.toFixed(0).padStart(7, " "),
                `${(item.cpuTimePerSecond / 10).toFixed(2)}%`.padStart(7, " "),
                `${(item.cpuTimePerRequest || 0).toFixed(2)}ms`.padStart(
                  8,
                  " ",
                ),
                `${(item.maxRssMemory5Minutes / 1_000_000).toFixed(3)}MB`
                  .padStart(9, " "),
                `${item.kvReadUnitsPerMinute.toFixed(0)}r ${
                  item.kvWriteUnitsPerMinute.toFixed(0)
                }w`.padStart(9, " "),
                `${item.queueEnqueuePerMinute.toFixed(0)}e ${
                  item.queueDequeuePerMinute.toFixed(0)
                }d`.padStart(9, " "),
              ]);
            }
            return data;
          }),

          rectangle: new Computed(() => {
            const numCols = Math.floor(
              mainBox.rectangle.value.width / regionTableWidth,
            );
            const index = layout.value.indexOf(item.region);
            const row = Math.floor(index / numCols);
            const extraRow = row === 0 ? 0 : row;
            const col = index % numCols;
            const extraCol = col === 0 ? 0 : col;
            const remainingWidth = Math.floor(
              mainBox.rectangle.value.width -
                (numCols * regionTableWidth) - numCols,
            ) - 1;
            const gap = Math.floor(remainingWidth / (numCols - 1));
            const rowGap = row !== 0 ? row : 0;
            const colGap = col !== 0 ? gap * col : 0;
            return {
              row: Math.ceil(
                mainBox.rectangle.value.row +
                  (row * regionTableHeight.value) +
                  extraRow + rowGap + 1,
              ),
              column: Math.ceil(
                mainBox.rectangle.value.column +
                  (col * regionTableWidth) +
                  extraCol + colGap,
              ),
              height: regionTableHeight.value,
              width: regionTableWidth,
            };
          }),
        });
        regionTableWidth = regionTable.rectangle.value.width;
        const regionTitle = new Label({
          parent: regionTable,
          theme: {},
          zIndex: 0,
          overwriteRectangle: true,
          align: {
            vertical: "center",
            horizontal: "center",
          },
          // rectangle: { row: 2, column: 1, width: isolateBox.rectangle.width },
          rectangle: new Computed(() => ({
            row: regionTable.rectangle.value.row - 1,
            column: regionTable.rectangle.value.column + 1,
            width: regionTable.rectangle.value.width - 2,
            height: 1,
          })),
          text: item.region,
        });
        new Frame({
          parent: regionTable,
          theme: {},
          zIndex: 0,
          rectangle: regionTitle.rectangle,
          charMap: "sharp",
        });

        region.table = regionTable;
      }

      statusText.value = `Connected to ${args.project}.`;
      let maxInstances = 0;
      for (const region in regions) {
        const instances = regions[region].instances.value;
        if (maxInstances < Object.keys(instances).length) {
          maxInstances = Object.keys(instances).length;
        }
        for (const instance in instances) {
          if (
            new Date() - instances[instance].ts > 30_000
          ) {
            delete instances[instance];
          }
        }
        if (Object.keys(instances).length === 0) {
          regions[region].table.destroy();
          layout.value.splice(layout.value.indexOf(region), 1);
          delete regions[region];
        }
      }
      regionTableHeight.value = Math.min(maxInstances, 5) + 4;
    }
  } catch (e) {
    error.value = `ERROR: ${e.toString()}`;
    // throw e;
  } finally {
    // if (tui) {
    //   tui.destroy();
    // }
  }
}

// - RPS
// - CPU
// - memory
// - network
